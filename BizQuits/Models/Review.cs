using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class Review
{
    public int Id { get; set; }

    public int ServiceId { get; set; }
    [ForeignKey(nameof(ServiceId))]
    public required Service Service { get; set; }

    public int ClientId { get; set; }
    [ForeignKey(nameof(ClientId))]
    public required User Client { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    // ✅ Moderare
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
    public DateTime? RejectedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
