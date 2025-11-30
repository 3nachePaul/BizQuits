using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<User> Register(UserRegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("User with this email already exists.");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        if (request.Role == Role.Entrepreneur)
        {
            if (string.IsNullOrEmpty(request.CompanyName) || string.IsNullOrEmpty(request.CUI))
            {
                throw new Exception("CompanyName and CUI are required for entrepreneurs.");
            }
            user.EntrepreneurProfile = new EntrepreneurProfile
            {
                User = user,
                CompanyName = request.CompanyName,
                CUI = request.CUI,
                IsApproved = false
            };
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<string> Login(UserLoginDto request)
    {
        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid credentials.");
        }

        if (user.Role == Role.Entrepreneur && (user.EntrepreneurProfile == null || !user.EntrepreneurProfile.IsApproved))
        {
            throw new Exception("Account pending approval.");
        }

        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found.")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.Now.AddDays(1);

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not found."),
            _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not found."),
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
