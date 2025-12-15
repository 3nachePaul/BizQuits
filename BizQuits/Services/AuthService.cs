using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BizQuits.Data;
using BizQuits.DTOs;
using BizQuits.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BizQuits.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(AppDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<User> Register(UserRegisterDto request)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();
        
        if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
        {
            _logger.LogWarning("Registration attempt with existing email: {Email}", normalizedEmail);
            throw new InvalidOperationException("User with this email already exists.");
        }

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12),
            Role = request.Role
        };

        if (request.Role == Role.Entrepreneur)
        {
            if (string.IsNullOrWhiteSpace(request.CompanyName) || string.IsNullOrWhiteSpace(request.CUI))
            {
                throw new InvalidOperationException("CompanyName and CUI are required for entrepreneurs.");
            }
            user.EntrepreneurProfile = new EntrepreneurProfile
            {
                User = user,
                CompanyName = request.CompanyName.Trim(),
                CUI = request.CUI.Trim().ToUpperInvariant(),
                IsApproved = false
            };
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("New user registered: {Email}, Role: {Role}", normalizedEmail, request.Role);

        return user;
    }

    public async Task<AuthResponseDto> Login(UserLoginDto request)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();
        
        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            BCrypt.Net.BCrypt.HashPassword("dummy_password_for_timing");
            _logger.LogWarning("Login attempt for non-existent email: {Email}", normalizedEmail);
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for user: {Email}", normalizedEmail);
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        if (user.Role == Role.Entrepreneur && (user.EntrepreneurProfile == null || !user.EntrepreneurProfile.IsApproved))
        {
            _logger.LogWarning("Login attempt by unapproved entrepreneur: {Email}", normalizedEmail);
            throw new UnauthorizedAccessException("Account pending approval.");
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = await GenerateRefreshToken(user);
        
        _logger.LogInformation("User logged in successfully: {Email}", normalizedEmail);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
            User = MapUserToDto(user)
        };
    }

    public async Task<AuthResponseDto> RefreshToken(string token)
    {
        var refreshToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(rt => rt.Token == token);

        if (refreshToken == null)
        {
            _logger.LogWarning("Refresh token not found");
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (!refreshToken.IsActive)
        {
            _logger.LogWarning("Attempt to use inactive refresh token for user: {UserId}", refreshToken.UserId);
            
            if (refreshToken.IsRevoked)
            {
                await RevokeAllUserTokens(refreshToken.UserId, "Token reuse detected - potential security breach");
                _logger.LogCritical("Token reuse detected for user: {UserId}. All tokens revoked.", refreshToken.UserId);
            }
            
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        var user = refreshToken.User;
        
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.ReasonRevoked = "Replaced by new token";

        var newAccessToken = GenerateJwtToken(user);
        var newRefreshToken = await GenerateRefreshToken(user);
        
        refreshToken.ReplacedByToken = newRefreshToken.Token;
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Tokens refreshed for user: {Email}", user.Email);

        return new AuthResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken.Token,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes()),
            User = MapUserToDto(user)
        };
    }

    public async Task RevokeToken(string token, string reason = "User logout")
    {
        var refreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == token);
        
        if (refreshToken == null || !refreshToken.IsActive)
        {
            return;
        }

        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.ReasonRevoked = reason;
        
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Refresh token revoked for user: {UserId}, Reason: {Reason}", refreshToken.UserId, reason);
    }

    public async Task RevokeAllUserTokens(int userId, string reason = "Security action")
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.ReasonRevoked = reason;
        }

        await _context.SaveChangesAsync();
        
        _logger.LogInformation("All refresh tokens revoked for user: {UserId}, Reason: {Reason}, Count: {Count}", 
            userId, reason, activeTokens.Count);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found.")));
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
        var expires = DateTime.UtcNow.AddMinutes(GetAccessTokenExpirationMinutes());

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not found."),
            audience: _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not found."),
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> GenerateRefreshToken(User user)
    {
        var expiredTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync();
        
        _context.RefreshTokens.RemoveRange(expiredTokens);

        var refreshToken = new RefreshToken
        {
            Token = GenerateSecureToken(),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenExpirationDays())
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();
        return refreshToken;
    }

    private static string GenerateSecureToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private int GetAccessTokenExpirationMinutes()
    {
        return _configuration.GetValue<int>("Jwt:AccessTokenExpirationMinutes", 15);
    }

    private int GetRefreshTokenExpirationDays()
    {
        return _configuration.GetValue<int>("Jwt:RefreshTokenExpirationDays", 7);
    }

    private static UserInfoDto MapUserToDto(User user)
    {
        return new UserInfoDto
        {
            Id = user.Id,
            Email = user.Email,
            Role = user.Role.ToString(),
            EntrepreneurProfile = user.EntrepreneurProfile != null ? new UserEntrepreneurProfileDto
            {
                Id = user.EntrepreneurProfile.Id,
                CompanyName = user.EntrepreneurProfile.CompanyName,
                CUI = user.EntrepreneurProfile.CUI,
                IsApproved = user.EntrepreneurProfile.IsApproved
            } : null
        };
    }
}
