using System.ComponentModel.DataAnnotations;

namespace BizQuits.Models;

public class Achievement
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public required string Code { get; set; }   // ex: "first_booking", "completed_10"

    [Required, MaxLength(200)]
    public required string Name { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public int XpReward { get; set; } = 0;

    [MaxLength(200)]
    public string? BadgeIcon { get; set; } // ex: "🏅" sau "🔥"
}
