using BizQuits.Data;
using BizQuits.Models;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Services;

public class GamificationService
{
    private readonly AppDbContext _context;

    public GamificationService(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // SEED ACHIEVEMENTS (SAFE)
    // =========================
    public async Task EnsureSeedAchievements()
    {
        var needed = GetDefaultAchievements();

        foreach (var a in needed)
        {
            if (!await _context.Achievements.AnyAsync(x => x.Code == a.Code))
                _context.Achievements.Add(a);
        }

        await _context.SaveChangesAsync();
    }

    // =========================
    // CLIENT STATS
    // =========================
    public async Task<ClientStats> EnsureClientStats(int userId)
    {
        var stats = await _context.ClientStats
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (stats != null)
            return stats;

        var user = await _context.Users.FirstAsync(u => u.Id == userId);

        stats = new ClientStats
        {
            UserId = userId,
            User = user,
            Xp = 0,
            Level = 1,
            TotalBookingsCreated = 0,
            TotalBookingsCompleted = 0,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ClientStats.Add(stats);
        await _context.SaveChangesAsync();
        return stats;
    }

    // =========================
    // BOOKINGS
    // =========================
    public async Task AwardFirstBooking(int userId)
    {
        var stats = await EnsureClientStats(userId);

        stats.TotalBookingsCreated += 1;
        stats.UpdatedAt = DateTime.UtcNow;

        await AddXp(userId, 10);
        await Unlock(userId, "first_booking");

        await _context.SaveChangesAsync();
    }

    public async Task AwardBookingCompleted(int userId)
    {
        var stats = await EnsureClientStats(userId);

        stats.TotalBookingsCompleted += 1;
        stats.UpdatedAt = DateTime.UtcNow;

        // XP pentru completare booking
        await AddXp(userId, 25);

        // Achievements
        await Unlock(userId, "first_completed_booking");

        var completed = stats.TotalBookingsCompleted;
        int[] milestones = { 5, 10, 25, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 750, 1000 };

        foreach (var m in milestones)
        {
            if (completed == m)
                await Unlock(userId, $"completed_{m}");
        }

        await _context.SaveChangesAsync();
    }

    // =========================
    // CHALLENGES (Sprint 4)
    // =========================
    public async Task AwardChallengeCompleted(int userId, int xpAmount, string? badgeCode)
    {
        // XP de la challenge
        await AddXp(userId, xpAmount);

        // Unlock achievement special dacă există
        if (!string.IsNullOrWhiteSpace(badgeCode))
        {
            await Unlock(userId, badgeCode);
        }

        // Check milestone-uri pentru challenges finalizate
        var stats = await EnsureClientStats(userId);
        var completedChallenges = await _context.ChallengeParticipations
            .CountAsync(cp => cp.UserId == userId && cp.Status == Models.ParticipationStatus.Completed);

        // Unlock achievements bazate pe număr challenges
        if (completedChallenges == 1)
            await Unlock(userId, "first_challenge");
        else if (completedChallenges == 5)
            await Unlock(userId, "challenges_5");
        else if (completedChallenges == 10)
            await Unlock(userId, "challenges_10");
        else if (completedChallenges == 25)
            await Unlock(userId, "challenges_25");

        await _context.SaveChangesAsync();
    }

    // =========================
    // COINS
    // =========================
    public async Task AwardCoins(int userId, int amount, string? reason = null)
    {
        if (amount <= 0) return;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;

        user.Coins += amount;
        await _context.SaveChangesAsync();
    }

    // =========================
    // REVIEWS (DOAR DUPĂ APPROVE)
    // =========================
    public async Task AwardReviewApproved(int userId)
    {
        // XP mic pentru review aprobat
        await AddXp(userId, 10);

        // Achievements
        await Unlock(userId, "first_review");

        var approvedCount = await _context.Reviews
            .CountAsync(r => r.ClientId == userId && r.IsApproved);

        if (approvedCount == 10)
            await Unlock(userId, "reviews_10");
    }

    // =========================
    // XP + LEVEL (EXPONENTIAL)
    // =========================
    public async Task AddXp(int userId, int amount)
    {
        var stats = await EnsureClientStats(userId);

        stats.Xp += Math.Max(0, amount);

        // Formula exponențială (IDENTICĂ cu frontend)
        static int Threshold(int level)
        {
            if (level <= 1) return 0;
            return (int)Math.Floor(80 * Math.Pow(level - 1, 1.7));
        }

        var newLevel = 1;
        while (stats.Xp >= Threshold(newLevel + 1))
        {
            newLevel++;
        }

        stats.Level = newLevel;
        stats.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    // =========================
    // ACHIEVEMENT UNLOCK
    // =========================
    private async Task Unlock(int userId, string code)
    {
        var ach = await _context.Achievements.FirstOrDefaultAsync(a => a.Code == code);
        if (ach == null)
            return;

        var alreadyUnlocked = await _context.UserAchievements
            .AnyAsync(ua => ua.UserId == userId && ua.AchievementId == ach.Id);

        if (alreadyUnlocked)
            return;

        var user = await _context.Users.FirstAsync(u => u.Id == userId);

        _context.UserAchievements.Add(new UserAchievement
        {
            UserId = userId,
            User = user,
            AchievementId = ach.Id,
            Achievement = ach,
            UnlockedAt = DateTime.UtcNow
        });

        // XP bonus de la achievement
        if (ach.XpReward > 0)
            await AddXp(userId, ach.XpReward);
    }

    // =========================
    // ACHIEVEMENTS LIST
    // =========================
    private static List<Achievement> GetDefaultAchievements()
    {
        var list = new List<Achievement>
        {
            new()
            {
                Code = "first_booking",
                Name = "First Booking",
                Description = "You created your first booking.",
                XpReward = 20,
                BadgeIcon = "🎟️"
            },
            new()
            {
                Code = "first_completed_booking",
                Name = "First Completed Booking",
                Description = "You completed your first booking.",
                XpReward = 40,
                BadgeIcon = "✅"
            },
            new()
            {
                Code = "first_review",
                Name = "First Review",
                Description = "You left your first review.",
                XpReward = 30,
                BadgeIcon = "✍️"
            },
            new()
            {
                Code = "reviews_10",
                Name = "Helpful Reviewer",
                Description = "You left 10 approved reviews.",
                XpReward = 150,
                BadgeIcon = "🗣️"
            },
            // Challenge achievements (Sprint 4)
            new()
            {
                Code = "first_challenge",
                Name = "Challenge Accepted",
                Description = "You completed your first challenge.",
                XpReward = 50,
                BadgeIcon = "🎯"
            },
            new()
            {
                Code = "challenges_5",
                Name = "Challenge Hunter",
                Description = "You completed 5 challenges.",
                XpReward = 100,
                BadgeIcon = "🏹"
            },
            new()
            {
                Code = "challenges_10",
                Name = "Challenge Master",
                Description = "You completed 10 challenges.",
                XpReward = 200,
                BadgeIcon = "⚔️"
            },
            new()
            {
                Code = "challenges_25",
                Name = "Challenge Legend",
                Description = "You completed 25 challenges.",
                XpReward = 400,
                BadgeIcon = "🛡️"
            }
        };

        (int m, int xp, string icon)[] milestones =
        {
            (5,  50, "🥉"),
            (10, 75, "🥈"),
            (25, 120, "🥇"),
            (50, 180, "🏅"),
            (100,250, "💎"),
            (150,300, "🔥"),
            (200,350, "⚡"),
            (250,400, "👑"),
            (300,450, "🏆"),
            (350,500, "🚀"),
            (400,550, "🌟"),
            (450,600, "🎖️"),
            (500,700, "🦾"),
            (750,900, "🧠"),
            (1000,1200,"🏰"),
        };

        foreach (var (m, xp, icon) in milestones)
        {
            list.Add(new Achievement
            {
                Code = $"completed_{m}",
                Name = $"{m} Completed Bookings",
                Description = $"Completed {m} bookings.",
                XpReward = xp,
                BadgeIcon = icon
            });
        }

        return list;
    }
}
