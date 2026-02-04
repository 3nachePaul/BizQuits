using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamificationController : ControllerBase
{
    private readonly AppDbContext _context;

    public GamificationController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    [Authorize(Roles = nameof(Role.Client))]
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
                ua.Achievement.XpReward,
                ua.UnlockedAt
            })
            .ToListAsync();

        return Ok(new
        {
            stats.Xp,
            stats.Level,
            stats.TotalBookingsCreated,
            stats.TotalBookingsCompleted,
            user.Coins,
            achievements
        });
    }

    /// <summary>
    /// Get all possible achievements (gallery view)
    /// </summary>
    [HttpGet("achievements")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> GetAllAchievements()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Unauthorized();

        // Get all achievements
        var allAchievements = await _context.Achievements
            .OrderBy(a => a.Id)
            .ToListAsync();

        // Get user's unlocked achievements
        var unlockedIds = await _context.UserAchievements
            .Where(ua => ua.UserId == user.Id)
            .Select(ua => new { ua.AchievementId, ua.UnlockedAt })
            .ToListAsync();

        var unlockedDict = unlockedIds.ToDictionary(x => x.AchievementId, x => x.UnlockedAt);

        var result = allAchievements.Select(a => new
        {
            a.Id,
            a.Code,
            a.Name,
            a.Description,
            a.BadgeIcon,
            a.XpReward,
            IsUnlocked = unlockedDict.ContainsKey(a.Id),
            UnlockedAt = unlockedDict.ContainsKey(a.Id) ? unlockedDict[a.Id] : (DateTime?)null,
            Category = GetAchievementCategory(a.Code)
        }).ToList();

        return Ok(result);
    }

    /// <summary>
    /// Get gamification summary (tips, how it works)
    /// </summary>
    [HttpGet("info")]
    [AllowAnonymous]
    public IActionResult GetGamificationInfo()
    {
        return Ok(new
        {
            HowToEarnXp = new object[]
            {
                new { Action = "Create a booking", Xp = "10", Icon = "📅" },
                new { Action = "Complete a booking", Xp = "25", Icon = "✅" },
                new { Action = "Leave an approved review", Xp = "10", Icon = "✍️" },
                new { Action = "Complete a challenge", Xp = "Variable", Icon = "🎯" },
                new { Action = "Unlock achievements", Xp = "Bonus XP", Icon = "🏆" }
            },
            HowToEarnCoins = new object[]
            {
                new { Action = "Complete a booking", Coins = "10", Icon = "🎟️" }
            },
            LevelFormula = "XP needed = 80 × (level-1)^1.7",
            Tips = new[]
            {
                "Complete bookings regularly to level up faster!",
                "Leave reviews to earn extra XP",
                "Join challenges for bonus rewards",
                "Use coins to claim exclusive offers",
                "Unlock all achievements to become a legend!"
            }
        });
    }

    private static string GetAchievementCategory(string code)
    {
        if (code.StartsWith("completed_")) return "Bookings";
        if (code.StartsWith("challenge")) return "Challenges";
        if (code.StartsWith("review") || code == "first_review") return "Reviews";
        if (code.Contains("booking")) return "Bookings";
        return "General";
    }
}
