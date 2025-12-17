using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class ClientStats
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public required User User { get; set; }

    public int Xp { get; set; } = 0;
    public int Level { get; set; } = 1;

    public int TotalBookingsCreated { get; set; } = 0;
    public int TotalBookingsCompleted { get; set; } = 0;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
