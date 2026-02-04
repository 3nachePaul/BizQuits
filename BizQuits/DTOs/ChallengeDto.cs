using System.ComponentModel.DataAnnotations;
using BizQuits.Models;

namespace BizQuits.DTOs;

// DTO pentru creare provocare
public class CreateChallengeDto
{
    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [Required]
    [MaxLength(2000)]
    public required string Description { get; set; }

    [Required]
    public ChallengeType Type { get; set; }

    /// <summary>
    /// How progress is tracked: Automatic (system tracks), ManualVerification (user submits proof), EntrepreneurManual (entrepreneur updates)
    /// </summary>
    public ChallengeTrackingMode TrackingMode { get; set; } = ChallengeTrackingMode.Automatic;

    public int? TargetCount { get; set; }
    public int? TimeLimitDays { get; set; }

    [Range(0, 10000)]
    public int XpReward { get; set; } = 50;

    /// <summary>
    /// Coins reward when challenge is completed (in addition to XP)
    /// </summary>
    [Range(0, 10000)]
    public int CoinsReward { get; set; } = 0;

    [MaxLength(100)]
    public string? BadgeCode { get; set; }

    [MaxLength(500)]
    public string? RewardDescription { get; set; }

    /// <summary>
    /// Instructions for users on how to submit proof (for ManualVerification tracking mode)
    /// </summary>
    [MaxLength(1000)]
    public string? ProofInstructions { get; set; }

    public decimal? BonusValue { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int? MaxParticipants { get; set; }
}

// DTO pentru actualizare provocare
public class UpdateChallengeDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    public ChallengeType? Type { get; set; }
    public ChallengeStatus? Status { get; set; }

    public ChallengeTrackingMode? TrackingMode { get; set; }

    public int? TargetCount { get; set; }
    public int? TimeLimitDays { get; set; }

    [Range(0, 10000)]
    public int? XpReward { get; set; }

    [Range(0, 10000)]
    public int? CoinsReward { get; set; }

    [MaxLength(100)]
    public string? BadgeCode { get; set; }

    [MaxLength(500)]
    public string? RewardDescription { get; set; }

    [MaxLength(1000)]
    public string? ProofInstructions { get; set; }

    public decimal? BonusValue { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int? MaxParticipants { get; set; }
}

// DTO pentru înscriere la provocare
public class JoinChallengeDto
{
    [MaxLength(1000)]
    public string? Message { get; set; }
}

// DTO pentru răspuns antreprenor la participare
public class RespondParticipationDto
{
    [Required]
    public bool Accept { get; set; }

    [MaxLength(1000)]
    public string? Response { get; set; }
}

// DTO pentru actualizare progres participare
public class UpdateProgressDto
{
    public int? Progress { get; set; }
    public bool? MarkCompleted { get; set; }
}
