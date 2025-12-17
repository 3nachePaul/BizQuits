using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BizQuits.Models;

public class OfferClaim
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int OfferId { get; set; }

    [ForeignKey("OfferId")]
    public Offer Offer { get; set; } = null!;

    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;

    // Status: Claimed, Used, Expired
    public ClaimStatus Status { get; set; } = ClaimStatus.Claimed;

    // Unique code generated for this claim (for coupons/discounts)
    [MaxLength(50)]
    public string? ClaimCode { get; set; }

    // When the claim was used (if applicable)
    public DateTime? UsedAt { get; set; }

    // Notes or additional info
    [MaxLength(500)]
    public string? Notes { get; set; }
}

public enum ClaimStatus
{
    Claimed = 0,
    Used = 1,
    Expired = 2,
    Cancelled = 3
}
