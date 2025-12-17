using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class UserAchievement
{
    public int Id { get; set; }

    public int UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public required User User { get; set; }

    public int AchievementId { get; set; }
    [ForeignKey(nameof(AchievementId))]
    public required Achievement Achievement { get; set; }

    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}
