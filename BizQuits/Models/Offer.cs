using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Models;

public enum OfferType
{
    JobMilestone,       // La al X-lea job realizat primești cadou
    EarlyCompletion,    // Job-uri finalizate mai devreme primesc bonus
    Coupon,             // Cupon pentru servicii
    Discount,           // Reducere procentuală
    Referral,           // Bonus pentru recomandări
    LoyaltyReward       // Recompensă pentru clienți fideli
}

public class Offer
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [Required]
    [MaxLength(2000)]
    public required string Description { get; set; }

    [Required]
    public OfferType Type { get; set; }

    // Configurare specifică tipului de ofertă
    public int? MilestoneCount { get; set; }           // Pentru JobMilestone: la al câtelea job
    public int? EarlyCompletionDays { get; set; }      // Pentru EarlyCompletion: cu câte zile mai devreme
    
    [Precision(18, 2)]
    public decimal? DiscountPercentage { get; set; }   // Pentru Discount: procentul de reducere
    
    [Precision(18, 2)]
    public decimal? BonusValue { get; set; }           // Valoarea bonusului/cuponului

    // Monetization: cost in coins to claim this offer
    public int CoinCost { get; set; } = 0;

    [MaxLength(500)]
    public string? RewardDescription { get; set; }     // Ce primește clientul

    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Relație cu antreprenorul
    public int EntrepreneurProfileId { get; set; }
    public EntrepreneurProfile EntrepreneurProfile { get; set; } = null!;
}
