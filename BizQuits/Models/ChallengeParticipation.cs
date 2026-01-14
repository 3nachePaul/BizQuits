using System.ComponentModel.DataAnnotations;

namespace BizQuits.Models;

public enum ParticipationStatus
{
    Pending,        // Cerere de înscriere trimisă
    Accepted,       // Acceptat de antreprenor
    Rejected,       // Respins de antreprenor
    InProgress,     // Lucrează la provocare
    Completed,      // Finalizat cu succes - recompensă acordată
    Failed,         // Nu a reușit în timp
    Withdrawn       // S-a retras singur
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

    // Progres
    public int CurrentProgress { get; set; } = 0;   // Ex: 3 din 5 rezervări finalizate

    [MaxLength(1000)]
    public string? UserMessage { get; set; }        // Mesaj de la utilizator la înscriere

    [MaxLength(1000)]
    public string? EntrepreneurResponse { get; set; } // Răspuns antreprenor

    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Deadline personalizat (calculat din Challenge.TimeLimitDays la accept)
    public DateTime? Deadline { get; set; }

    // Recompense acordate
    public bool RewardAwarded { get; set; } = false;
    public int XpAwarded { get; set; } = 0;
}
