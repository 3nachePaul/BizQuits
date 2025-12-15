using System.Security.Claims;
using BizQuits.DTOs;
using BizQuits.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)) });
        }

        try
        {
            var user = await _authService.Register(request);
            return Ok(new { message = "Registration successful. Please log in." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration");
            return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
        }
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] UserLoginDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)) });
        }

        try
        {
            var response = await _authService.Login(request);
            
            SetRefreshTokenCookie(response.RefreshToken);
            
            return Ok(new
            {
                accessToken = response.AccessToken,
                expiresAt = response.AccessTokenExpiry,
                user = response.User
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during login");
            return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
        }
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto? request = null)
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
            
            if (string.IsNullOrEmpty(refreshToken))
            {
                return BadRequest(new { error = "Refresh token is required." });
            }

            var response = await _authService.RefreshToken(refreshToken);
            
            SetRefreshTokenCookie(response.RefreshToken);
            
            return Ok(new
            {
                accessToken = response.AccessToken,
                expiresAt = response.AccessTokenExpiry,
                user = response.User
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            Response.Cookies.Delete("refreshToken");
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during token refresh");
            return StatusCode(500, new { error = "An unexpected error occurred. Please try again later." });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto? request = null)
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
            
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.RevokeToken(refreshToken, "User logout");
            }
            
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });
            
            return Ok(new { message = "Logged out successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during logout");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("revoke-all")]
    [Authorize]
    public async Task<IActionResult> RevokeAllTokens()
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            await _authService.RevokeAllUserTokens(userId, "User requested logout from all devices");
            
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });
            
            return Ok(new { message = "All sessions have been terminated." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during revoke all tokens");
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Only send over HTTPS
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7),
            Path = "/api/auth"
        };
        
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
