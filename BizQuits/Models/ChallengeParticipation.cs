using System.ComponentModel.DataAnnotations;

namespace BizQuits.Models;

public enum ParticipationStatus
{
    Pending,           // Signup request sent
    Accepted,          // Accepted by entrepreneur
    Rejected,          // Rejected by entrepreneur
    InProgress,        // Working on the challenge
    ProofSubmitted,    // User submitted proof, awaiting verification
    Completed,         // Successfully completed - reward awarded
    Failed,            // Did not complete in time
    Withdrawn          // User withdrew
}

public class ChallengeParticipation
{
    public int Id { get; set; }

    [Required]
    public int ChallengeId { get; set; }
    public Challenge Challenge { get; set; } = null!;

    [Required]
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public ParticipationStatus Status { get; set; } = ParticipationStatus.Pending;

    // Progress tracking
    public int CurrentProgress { get; set; } = 0;   // E.g., 3 out of 5 bookings completed
    public int TargetProgress { get; set; } = 0;    // Copied from challenge at acceptance

    // For proof-based challenges
    [MaxLength(2000)]
    public string? ProofText { get; set; }          // Text proof/description from user

    [MaxLength(500)]
    public string? ProofImageUrl { get; set; }      // URL to proof image (if applicable)
    
    public DateTime? ProofSubmittedAt { get; set; } // When proof was submitted

    [MaxLength(1000)]
    public string? UserMessage { get; set; }        // Message from user at signup

    [MaxLength(1000)]
    public string? EntrepreneurResponse { get; set; } // Entrepreneur response

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Custom deadline (calculated from Challenge.TimeLimitDays at acceptance)
    public DateTime? Deadline { get; set; }

    // Rewards awarded
    public bool RewardAwarded { get; set; } = false;
    public int XpAwarded { get; set; } = 0;
    public int CoinsAwarded { get; set; } = 0;
}
