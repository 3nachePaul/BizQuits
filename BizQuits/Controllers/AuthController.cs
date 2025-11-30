using BizQuits.DTOs;
using BizQuits.Services;
using Microsoft.AspNetCore.Mvc;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto request)
    {
        try
        {
            var user = await _authService.Register(request);
            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto request)
    {
        try
        {
            var token = await _authService.Login(request);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
