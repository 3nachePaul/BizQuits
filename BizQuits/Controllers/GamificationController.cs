using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = nameof(Role.Client))]
public class GamificationController : ControllerBase
{
    private readonly AppDbContext _context;

    public GamificationController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Unauthorized();

        var stats = await _context.ClientStats.FirstOrDefaultAsync(s => s.UserId == user.Id);
        stats ??= new ClientStats { UserId = user.Id, User = user };

        var achievements = await _context.UserAchievements
            .Include(ua => ua.Achievement)
            .Where(ua => ua.UserId == user.Id)
            .OrderByDescending(ua => ua.UnlockedAt)
            .Select(ua => new {
                ua.Achievement.Code,
                ua.Achievement.Name,
                ua.Achievement.Description,
                ua.Achievement.BadgeIcon,
                ua.UnlockedAt
            })
            .ToListAsync();

        return Ok(new
        {
            stats.Xp,
            stats.Level,
            stats.TotalBookingsCreated,
            stats.TotalBookingsCompleted,
            achievements
        });
    }
}
