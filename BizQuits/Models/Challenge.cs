using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Models;

public enum ChallengeType
{
    BookingMilestone,    // Finalizează X rezervări la acest antreprenor
    ReviewChallenge,     // Lasă review-uri
    SpeedChallenge,      // Finalizează rezervări în timp record
    LoyaltyChallenge,    // Fii client fidel
    ReferralChallenge,   // Aduce prieteni
    SeasonalChallenge    // Provocare sezonieră/temporară
}

public enum ChallengeStatus
{
    Draft,      // Creat dar nu activ
    Active,     // Acceptă participanți
    Completed,  // S-a terminat
    Cancelled   // Anulat
}

public class Challenge
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [Required]
    [MaxLength(2000)]
    public required string Description { get; set; }

    [Required]
    public ChallengeType Type { get; set; }

    public ChallengeStatus Status { get; set; } = ChallengeStatus.Draft;

    // Configurare specifică tipului
    public int? TargetCount { get; set; }           // Ex: finalizează 5 rezervări
    public int? TimeLimitDays { get; set; }         // Timp limită pentru completare

    // Recompense
    public int XpReward { get; set; } = 50;         // XP primit la finalizare

    [MaxLength(100)]
    public string? BadgeCode { get; set; }          // Cod achievement special (opțional)

    [MaxLength(500)]
    public string? RewardDescription { get; set; }  // Descriere recompensă text

    [Precision(18, 2)]
    public decimal? BonusValue { get; set; }        // Valoare bonus/cupon acordat

    // Perioadă validitate
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Limită participanți (opțional)
    public int? MaxParticipants { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Relație cu antreprenorul care a creat provocarea
    public int EntrepreneurProfileId { get; set; }
    public EntrepreneurProfile EntrepreneurProfile { get; set; } = null!;
}
