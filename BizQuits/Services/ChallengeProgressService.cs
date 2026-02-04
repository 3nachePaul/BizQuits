using BizQuits.Data;
using BizQuits.Models;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Services;

public class ChallengeProgressService
{
    private readonly AppDbContext _context;
    private readonly GamificationService _gamification;
    private readonly ILogger<ChallengeProgressService> _logger;

    public ChallengeProgressService(
        AppDbContext context, 
        GamificationService gamification,
        ILogger<ChallengeProgressService> logger)
    {
        _context = context;
        _gamification = gamification;
        _logger = logger;
    }

    /// <summary>
    /// Called when a booking is completed to update relevant challenge progress
    /// </summary>
    public async Task OnBookingCompleted(int clientId, int serviceId)
    {
        try
        {
            var service = await _context.Services
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == serviceId);

            if (service == null) return;

            var entrepreneurProfileId = service.EntrepreneurProfileId;

            // Find active challenge participations for this user with booking-related challenges
            var participations = await _context.ChallengeParticipations
                .Include(cp => cp.Challenge)
                .Where(cp => cp.UserId == clientId)
                .Where(cp => cp.Status == ParticipationStatus.Accepted || 
                             cp.Status == ParticipationStatus.InProgress)
                .Where(cp => cp.Challenge.EntrepreneurProfileId == entrepreneurProfileId)
                .Where(cp => cp.Challenge.Status == ChallengeStatus.Active)
                .Where(cp => cp.Challenge.TrackingMode == ChallengeTrackingMode.Automatic)
                .Where(cp => cp.Challenge.Type == ChallengeType.BookingMilestone ||
                             cp.Challenge.Type == ChallengeType.SpeedChallenge ||
                             cp.Challenge.Type == ChallengeType.LoyaltyChallenge)
                .ToListAsync();

            foreach (var participation in participations)
            {
                await IncrementProgressAndCheckCompletion(participation);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating challenge progress on booking completion");
        }
    }

    /// <summary>
    /// Called when a review is approved to update relevant challenge progress
    /// </summary>
    public async Task OnReviewApproved(int clientId, int serviceId)
    {
        try
        {
            var service = await _context.Services
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == serviceId);

            if (service == null) return;

            var entrepreneurProfileId = service.EntrepreneurProfileId;

            // Find active challenge participations for review challenges
            var participations = await _context.ChallengeParticipations
                .Include(cp => cp.Challenge)
                .Where(cp => cp.UserId == clientId)
                .Where(cp => cp.Status == ParticipationStatus.Accepted || 
                             cp.Status == ParticipationStatus.InProgress)
                .Where(cp => cp.Challenge.EntrepreneurProfileId == entrepreneurProfileId)
                .Where(cp => cp.Challenge.Status == ChallengeStatus.Active)
                .Where(cp => cp.Challenge.TrackingMode == ChallengeTrackingMode.Automatic)
                .Where(cp => cp.Challenge.Type == ChallengeType.ReviewChallenge)
                .ToListAsync();

            foreach (var participation in participations)
            {
                await IncrementProgressAndCheckCompletion(participation);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating challenge progress on review approval");
        }
    }

    /// <summary>
    /// Called when an offer is claimed to update relevant challenge progress
    /// </summary>
    public async Task OnOfferClaimed(int clientId, int offerId)
    {
        try
        {
            var offer = await _context.Offers
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == offerId);

            if (offer == null) return;

            var entrepreneurProfileId = offer.EntrepreneurProfileId;

            // Find active challenge participations for offer claim challenges
            var participations = await _context.ChallengeParticipations
                .Include(cp => cp.Challenge)
                .Where(cp => cp.UserId == clientId)
                .Where(cp => cp.Status == ParticipationStatus.Accepted || 
                             cp.Status == ParticipationStatus.InProgress)
                .Where(cp => cp.Challenge.EntrepreneurProfileId == entrepreneurProfileId)
                .Where(cp => cp.Challenge.Status == ChallengeStatus.Active)
                .Where(cp => cp.Challenge.TrackingMode == ChallengeTrackingMode.Automatic)
                .Where(cp => cp.Challenge.Type == ChallengeType.OfferClaimChallenge)
                .ToListAsync();

            foreach (var participation in participations)
            {
                await IncrementProgressAndCheckCompletion(participation);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating challenge progress on offer claim");
        }
    }

    /// <summary>
    /// Increment progress and check if challenge is completed
    /// </summary>
    private async Task IncrementProgressAndCheckCompletion(ChallengeParticipation participation)
    {
        participation.CurrentProgress++;
        participation.UpdatedAt = DateTime.UtcNow;

        if (participation.Status == ParticipationStatus.Accepted)
        {
            participation.Status = ParticipationStatus.InProgress;
        }

        // Check if target reached
        if (participation.Challenge.TargetCount.HasValue && 
            participation.CurrentProgress >= participation.Challenge.TargetCount.Value)
        {
            await CompleteChallenge(participation);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Challenge progress updated: ParticipationId={ParticipationId}, Progress={Progress}/{Target}",
            participation.Id, 
            participation.CurrentProgress, 
            participation.TargetProgress);
    }

    /// <summary>
    /// Complete a challenge and award rewards
    /// </summary>
    private async Task CompleteChallenge(ChallengeParticipation participation)
    {
        participation.Status = ParticipationStatus.Completed;
        participation.CompletedAt = DateTime.UtcNow;
        participation.UpdatedAt = DateTime.UtcNow;

        if (!participation.RewardAwarded)
        {
            participation.RewardAwarded = true;
            participation.XpAwarded = participation.Challenge.XpReward;
            participation.CoinsAwarded = participation.Challenge.CoinsReward;

            // Award through gamification service
            await _gamification.AwardChallengeCompleted(
                participation.UserId,
                participation.Challenge.XpReward,
                participation.Challenge.BadgeCode);

            // Award coins if applicable
            if (participation.Challenge.CoinsReward > 0)
            {
                await _gamification.AwardCoins(
                    participation.UserId, 
                    participation.Challenge.CoinsReward,
                    $"Challenge completed: {participation.Challenge.Title}");
            }
        }

        _logger.LogInformation(
            "Challenge completed: ParticipationId={ParticipationId}, UserId={UserId}, XP={XP}, Coins={Coins}",
            participation.Id, 
            participation.UserId,
            participation.XpAwarded,
            participation.CoinsAwarded);
    }

    /// <summary>
    /// Submit proof for a manual verification challenge
    /// </summary>
    public async Task<bool> SubmitProof(int participationId, int userId, string? proofText, string? proofImageUrl)
    {
        var participation = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
            .FirstOrDefaultAsync(cp => cp.Id == participationId && cp.UserId == userId);

        if (participation == null)
            return false;

        if (participation.Challenge.TrackingMode != ChallengeTrackingMode.ManualVerification)
            return false;

        if (participation.Status != ParticipationStatus.Accepted && 
            participation.Status != ParticipationStatus.InProgress)
            return false;

        participation.ProofText = proofText;
        participation.ProofImageUrl = proofImageUrl;
        participation.ProofSubmittedAt = DateTime.UtcNow;
        participation.Status = ParticipationStatus.ProofSubmitted;
        participation.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Proof submitted: ParticipationId={ParticipationId}, UserId={UserId}",
            participationId, userId);

        return true;
    }

    /// <summary>
    /// Verify proof and complete/reject the challenge (entrepreneur only)
    /// </summary>
    public async Task<bool> VerifyProof(int participationId, int entrepreneurProfileId, bool approved, string? response)
    {
        var participation = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
            .FirstOrDefaultAsync(cp => cp.Id == participationId && 
                                       cp.Challenge.EntrepreneurProfileId == entrepreneurProfileId);

        if (participation == null)
            return false;

        if (participation.Status != ParticipationStatus.ProofSubmitted)
            return false;

        participation.EntrepreneurResponse = response;
        participation.UpdatedAt = DateTime.UtcNow;

        if (approved)
        {
            participation.CurrentProgress = participation.TargetProgress; // Set to target
            await CompleteChallenge(participation);
        }
        else
        {
            // Allow user to resubmit
            participation.Status = ParticipationStatus.InProgress;
            participation.ProofText = null;
            participation.ProofImageUrl = null;
            participation.ProofSubmittedAt = null;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Proof verified: ParticipationId={ParticipationId}, Approved={Approved}",
            participationId, approved);

        return true;
    }

    /// <summary>
    /// Get real-time progress info for a user's participation
    /// </summary>
    public async Task<ChallengeProgressInfo?> GetProgressInfo(int participationId, int userId)
    {
        var participation = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
            .AsNoTracking()
            .FirstOrDefaultAsync(cp => cp.Id == participationId && cp.UserId == userId);

        if (participation == null) return null;

        return new ChallengeProgressInfo
        {
            ParticipationId = participation.Id,
            ChallengeId = participation.ChallengeId,
            ChallengeTitle = participation.Challenge.Title,
            ChallengeType = participation.Challenge.Type.ToString(),
            TrackingMode = participation.Challenge.TrackingMode.ToString(),
            CurrentProgress = participation.CurrentProgress,
            TargetProgress = participation.TargetProgress,
            ProgressPercentage = participation.TargetProgress > 0 
                ? Math.Min(100, (participation.CurrentProgress * 100) / participation.TargetProgress) 
                : 0,
            Status = participation.Status.ToString(),
            Deadline = participation.Deadline,
            ProofRequired = participation.Challenge.TrackingMode == ChallengeTrackingMode.ManualVerification,
            ProofInstructions = participation.Challenge.ProofInstructions,
            ProofSubmitted = participation.ProofSubmittedAt != null,
            XpReward = participation.Challenge.XpReward,
            CoinsReward = participation.Challenge.CoinsReward,
            RewardDescription = participation.Challenge.RewardDescription
        };
    }
}

public class ChallengeProgressInfo
{
    public int ParticipationId { get; set; }
    public int ChallengeId { get; set; }
    public string ChallengeTitle { get; set; } = "";
    public string ChallengeType { get; set; } = "";
    public string TrackingMode { get; set; } = "";
    public int CurrentProgress { get; set; }
    public int TargetProgress { get; set; }
    public int ProgressPercentage { get; set; }
    public string Status { get; set; } = "";
    public DateTime? Deadline { get; set; }
    public bool ProofRequired { get; set; }
    public string? ProofInstructions { get; set; }
    public bool ProofSubmitted { get; set; }
    public int XpReward { get; set; }
    public int CoinsReward { get; set; }
    public string? RewardDescription { get; set; }
}
