using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return NotFound();
        }

        var response = new
        {
            user.Id,
            user.Email,
            Role = user.Role.ToString(),
            EntrepreneurProfile = user.EntrepreneurProfile != null ? new
            {
                user.EntrepreneurProfile.Id,
                user.EntrepreneurProfile.CompanyName,
                user.EntrepreneurProfile.CUI,
                user.EntrepreneurProfile.IsApproved
            } : null
        };

        return Ok(response);
    }
}
