using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Models;

public enum ChallengeType
{
    // Auto-tracked challenges (progress updates automatically)
    BookingMilestone,    // Complete X bookings with this entrepreneur
    ReviewChallenge,     // Leave X reviews for this entrepreneur
    OfferClaimChallenge, // Claim X offers from this entrepreneur
    
    // Manual verification challenges (user submits proof)
    ProofChallenge,      // User submits photo/text proof, entrepreneur verifies
    
    // Legacy types (can be manual or auto)
    SpeedChallenge,      // Complete bookings quickly (auto-tracked)
    LoyaltyChallenge,    // Be a loyal customer (auto-tracked based on repeat bookings)
    ReferralChallenge,   // Refer friends (manual verification)
    SeasonalChallenge    // Seasonal/temporary challenge (can be either)
}

// Defines how progress is tracked
public enum ChallengeTrackingMode
{
    Automatic,           // Progress tracked automatically by app actions
    ManualVerification,  // User submits proof, entrepreneur verifies
    EntrepreneurManual   // Entrepreneur manually updates progress
}

public enum ChallengeStatus
{
    Draft,      // Created but not active
    Active,     // Accepting participants
    Completed,  // Ended
    Cancelled   // Cancelled
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

    // How progress is tracked for this challenge
    public ChallengeTrackingMode TrackingMode { get; set; } = ChallengeTrackingMode.Automatic;

    // Challenge configuration
    public int? TargetCount { get; set; }           // Target: complete X bookings/reviews/etc
    public int? TimeLimitDays { get; set; }         // Time limit to complete

    // For proof-based challenges
    [MaxLength(500)]
    public string? ProofInstructions { get; set; }  // Instructions for what proof to submit

    // Rewards
    public int XpReward { get; set; } = 50;         // XP awarded on completion
    public int CoinsReward { get; set; } = 0;       // Coins awarded on completion

    [MaxLength(100)]
    public string? BadgeCode { get; set; }          // Special achievement code (optional)

    [MaxLength(500)]
    public string? RewardDescription { get; set; }  // Text description of reward

    [Precision(18, 2)]
    public decimal? BonusValue { get; set; }        // Bonus/coupon value

    // Validity period
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Participant limit (optional)
    public int? MaxParticipants { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Relationship with entrepreneur who created the challenge
    public int EntrepreneurProfileId { get; set; }
    public EntrepreneurProfile EntrepreneurProfile { get; set; } = null!;
}
