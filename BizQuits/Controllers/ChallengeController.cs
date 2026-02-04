using BizQuits.Data;
using BizQuits.DTOs;
using BizQuits.Models;
using BizQuits.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChallengeController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly GamificationService _gamification;
    private readonly ChallengeProgressService _challengeProgress;

    public ChallengeController(AppDbContext context, GamificationService gamification, ChallengeProgressService challengeProgress)
    {
        _context = context;
        _gamification = gamification;
        _challengeProgress = challengeProgress;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim.Value) : 0;
    }

    private async Task<EntrepreneurProfile?> GetEntrepreneurProfile()
    {
        var userId = GetUserId();
        return await _context.EntrepreneurProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId && p.IsApproved);
    }

    // =========================
    // PUBLIC: Listare provocări active
    // =========================
    [HttpGet]
    public async Task<IActionResult> GetAllActive([FromQuery] ChallengeType? type, [FromQuery] string? search)
    {
        var query = _context.Challenges
            .Include(c => c.EntrepreneurProfile)
                .ThenInclude(p => p.User)
            .Where(c => c.Status == ChallengeStatus.Active)
            .Where(c => c.StartDate == null || c.StartDate <= DateTime.UtcNow)
            .Where(c => c.EndDate == null || c.EndDate >= DateTime.UtcNow)
            .AsQueryable();

        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(s) ||
                c.Description.ToLower().Contains(s));
        }

        var challenges = await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                Type = c.Type.ToString(),
                TrackingMode = c.TrackingMode.ToString(),
                c.TargetCount,
                c.TimeLimitDays,
                c.XpReward,
                c.CoinsReward,
                c.BadgeCode,
                c.RewardDescription,
                c.ProofInstructions,
                c.BonusValue,
                c.StartDate,
                c.EndDate,
                c.MaxParticipants,
                c.CreatedAt,
                Entrepreneur = new
                {
                    c.EntrepreneurProfile.Id,
                    c.EntrepreneurProfile.CompanyName,
                    Email = c.EntrepreneurProfile.User.Email
                },
                // Count participanți acceptați
                ParticipantsCount = _context.ChallengeParticipations
                    .Count(cp => cp.ChallengeId == c.Id &&
                           (cp.Status == ParticipationStatus.Accepted ||
                            cp.Status == ParticipationStatus.InProgress ||
                            cp.Status == ParticipationStatus.Completed))
            })
            .ToListAsync();

        return Ok(challenges);
    }

    [HttpGet("types")]
    public IActionResult GetTypes()
    {
        var types = Enum.GetValues<ChallengeType>()
            .Select(t => new { Value = (int)t, Name = t.ToString() });
        return Ok(types);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var challenge = await _context.Challenges
            .Include(c => c.EntrepreneurProfile)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (challenge == null)
            return NotFound("Challenge not found.");

        var participantsCount = await _context.ChallengeParticipations
            .CountAsync(cp => cp.ChallengeId == id &&
                   (cp.Status == ParticipationStatus.Accepted ||
                    cp.Status == ParticipationStatus.InProgress ||
                    cp.Status == ParticipationStatus.Completed));

        // Check if current user is participating
        var userId = GetUserId();
        var myParticipation = userId > 0
            ? await _context.ChallengeParticipations
                .FirstOrDefaultAsync(cp => cp.ChallengeId == id && cp.UserId == userId)
            : null;

        return Ok(new
        {
            challenge.Id,
            challenge.Title,
            challenge.Description,
            Type = challenge.Type.ToString(),
            TrackingMode = challenge.TrackingMode.ToString(),
            Status = challenge.Status.ToString(),
            challenge.TargetCount,
            challenge.TimeLimitDays,
            challenge.XpReward,
            challenge.CoinsReward,
            challenge.BadgeCode,
            challenge.RewardDescription,
            challenge.ProofInstructions,
            challenge.BonusValue,
            challenge.StartDate,
            challenge.EndDate,
            challenge.MaxParticipants,
            challenge.CreatedAt,
            Entrepreneur = new
            {
                challenge.EntrepreneurProfile.Id,
                challenge.EntrepreneurProfile.CompanyName,
                Email = challenge.EntrepreneurProfile.User.Email
            },
            ParticipantsCount = participantsCount,
            MyParticipation = myParticipation != null ? new
            {
                myParticipation.Id,
                Status = myParticipation.Status.ToString(),
                myParticipation.CurrentProgress,
                TargetProgress = challenge.TargetCount ?? 1,
                ProgressPercentage = challenge.TargetCount.HasValue && challenge.TargetCount > 0 
                    ? Math.Min(100, (myParticipation.CurrentProgress * 100) / challenge.TargetCount.Value) 
                    : 0,
                myParticipation.Deadline,
                myParticipation.RewardAwarded,
                myParticipation.XpAwarded,
                myParticipation.CoinsAwarded,
                ProofSubmitted = myParticipation.ProofSubmittedAt != null,
                myParticipation.ProofSubmittedAt
            } : null
        });
    }

    // =========================
    // ENTREPRENEUR: CRUD provocări
    // =========================
    [HttpPost]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> Create([FromBody] CreateChallengeDto dto)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null)
            return Forbid("Entrepreneur profile not found or not approved.");

        var challenge = new Challenge
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Type = dto.Type,
            TrackingMode = dto.TrackingMode,
            Status = ChallengeStatus.Draft,
            TargetCount = dto.TargetCount,
            TimeLimitDays = dto.TimeLimitDays,
            XpReward = dto.XpReward,
            CoinsReward = dto.CoinsReward,
            BadgeCode = dto.BadgeCode?.Trim(),
            RewardDescription = dto.RewardDescription?.Trim(),
            ProofInstructions = dto.ProofInstructions?.Trim(),
            BonusValue = dto.BonusValue,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MaxParticipants = dto.MaxParticipants,
            EntrepreneurProfileId = profile.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.Challenges.Add(challenge);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            challenge.Id,
            challenge.Title,
            Status = challenge.Status.ToString(),
            Message = "Challenge created as draft. Activate it when ready."
        });
    }

    [HttpGet("my")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetMyChallenges()
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null)
            return Ok(new List<object>());

        var challenges = await _context.Challenges
            .Where(c => c.EntrepreneurProfileId == profile.Id)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                Type = c.Type.ToString(),
                TrackingMode = c.TrackingMode.ToString(),
                Status = c.Status.ToString(),
                c.TargetCount,
                c.TimeLimitDays,
                c.XpReward,
                c.CoinsReward,
                c.RewardDescription,
                c.ProofInstructions,
                c.BonusValue,
                c.StartDate,
                c.EndDate,
                c.MaxParticipants,
                c.CreatedAt,
                ParticipantsCount = _context.ChallengeParticipations
                    .Count(cp => cp.ChallengeId == c.Id),
                PendingCount = _context.ChallengeParticipations
                    .Count(cp => cp.ChallengeId == c.Id && cp.Status == ParticipationStatus.Pending),
                ProofPendingCount = _context.ChallengeParticipations
                    .Count(cp => cp.ChallengeId == c.Id && cp.Status == ParticipationStatus.ProofSubmitted)
            })
            .ToListAsync();

        return Ok(challenges);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateChallengeDto dto)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null)
            return Forbid();

        var challenge = await _context.Challenges
            .FirstOrDefaultAsync(c => c.Id == id && c.EntrepreneurProfileId == profile.Id);

        if (challenge == null)
            return NotFound("Challenge not found.");

        if (dto.Title != null) challenge.Title = dto.Title.Trim();
        if (dto.Description != null) challenge.Description = dto.Description.Trim();
        if (dto.Type.HasValue) challenge.Type = dto.Type.Value;
        if (dto.Status.HasValue) challenge.Status = dto.Status.Value;
        if (dto.TrackingMode.HasValue) challenge.TrackingMode = dto.TrackingMode.Value;
        if (dto.TargetCount.HasValue) challenge.TargetCount = dto.TargetCount;
        if (dto.TimeLimitDays.HasValue) challenge.TimeLimitDays = dto.TimeLimitDays;
        if (dto.XpReward.HasValue) challenge.XpReward = dto.XpReward.Value;
        if (dto.CoinsReward.HasValue) challenge.CoinsReward = dto.CoinsReward.Value;
        if (dto.BadgeCode != null) challenge.BadgeCode = dto.BadgeCode.Trim();
        if (dto.RewardDescription != null) challenge.RewardDescription = dto.RewardDescription.Trim();
        if (dto.ProofInstructions != null) challenge.ProofInstructions = dto.ProofInstructions.Trim();
        if (dto.BonusValue.HasValue) challenge.BonusValue = dto.BonusValue;
        if (dto.StartDate.HasValue) challenge.StartDate = dto.StartDate;
        if (dto.EndDate.HasValue) challenge.EndDate = dto.EndDate;
        if (dto.MaxParticipants.HasValue) challenge.MaxParticipants = dto.MaxParticipants;

        challenge.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { updated = true, Status = challenge.Status.ToString() });
    }

    [HttpPatch("{id}/activate")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> Activate(int id)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var challenge = await _context.Challenges
            .FirstOrDefaultAsync(c => c.Id == id && c.EntrepreneurProfileId == profile.Id);

        if (challenge == null) return NotFound("Challenge not found.");

        challenge.Status = ChallengeStatus.Active;
        challenge.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { activated = true });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> Delete(int id)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var challenge = await _context.Challenges
            .FirstOrDefaultAsync(c => c.Id == id && c.EntrepreneurProfileId == profile.Id);

        if (challenge == null) return NotFound("Challenge not found.");

        // Check for active participants
        var hasActiveParticipants = await _context.ChallengeParticipations
            .AnyAsync(cp => cp.ChallengeId == id &&
                     (cp.Status == ParticipationStatus.Accepted || cp.Status == ParticipationStatus.InProgress));

        if (hasActiveParticipants)
            return BadRequest("Cannot delete challenge with active participants. Complete or cancel their participation first.");

        _context.Challenges.Remove(challenge);
        await _context.SaveChangesAsync();

        return Ok(new { deleted = true });
    }

    // =========================
    // CLIENT: Înscriere la provocare
    // =========================
    [HttpPost("{id}/join")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> Join(int id, [FromBody] JoinChallengeDto? dto)
    {
        var userId = GetUserId();

        var challenge = await _context.Challenges
            .FirstOrDefaultAsync(c => c.Id == id && c.Status == ChallengeStatus.Active);

        if (challenge == null)
            return NotFound("Challenge not found or not active.");

        // Check dates
        if (challenge.StartDate.HasValue && challenge.StartDate > DateTime.UtcNow)
            return BadRequest("Challenge has not started yet.");
        if (challenge.EndDate.HasValue && challenge.EndDate < DateTime.UtcNow)
            return BadRequest("Challenge has ended.");

        // Check max participants
        if (challenge.MaxParticipants.HasValue)
        {
            var currentCount = await _context.ChallengeParticipations
                .CountAsync(cp => cp.ChallengeId == id &&
                       cp.Status != ParticipationStatus.Rejected &&
                       cp.Status != ParticipationStatus.Withdrawn);

            if (currentCount >= challenge.MaxParticipants)
                return BadRequest("Challenge has reached maximum participants.");
        }

        // Check if already participating
        var existing = await _context.ChallengeParticipations
            .FirstOrDefaultAsync(cp => cp.ChallengeId == id && cp.UserId == userId);

        if (existing != null)
        {
            if (existing.Status == ParticipationStatus.Withdrawn || existing.Status == ParticipationStatus.Rejected)
            {
                // Allow re-join
                existing.Status = ParticipationStatus.Pending;
                existing.UserMessage = dto?.Message?.Trim();
                existing.EntrepreneurResponse = null;
                existing.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { rejoined = true, participationId = existing.Id });
            }
            return BadRequest("Already participating in this challenge.");
        }

        var user = await _context.Users.FirstAsync(u => u.Id == userId);

        var participation = new ChallengeParticipation
        {
            ChallengeId = id,
            Challenge = challenge,
            UserId = userId,
            User = user,
            Status = ParticipationStatus.Pending,
            UserMessage = dto?.Message?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.ChallengeParticipations.Add(participation);
        await _context.SaveChangesAsync();

        return Ok(new { joined = true, participationId = participation.Id });
    }

    [HttpGet("my/participations")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> GetMyParticipations()
    {
        var userId = GetUserId();

        var participations = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
                .ThenInclude(c => c.EntrepreneurProfile)
            .Where(cp => cp.UserId == userId)
            .OrderByDescending(cp => cp.CreatedAt)
            .Select(cp => new
            {
                cp.Id,
                Status = cp.Status.ToString(),
                cp.CurrentProgress,
                TargetProgress = cp.Challenge.TargetCount ?? 1,
                ProgressPercentage = cp.Challenge.TargetCount.HasValue && cp.Challenge.TargetCount > 0 
                    ? Math.Min(100, (cp.CurrentProgress * 100) / cp.Challenge.TargetCount.Value) 
                    : 0,
                cp.Deadline,
                cp.RewardAwarded,
                cp.XpAwarded,
                cp.CoinsAwarded,
                cp.EntrepreneurResponse,
                cp.CreatedAt,
                cp.CompletedAt,
                ProofSubmitted = cp.ProofSubmittedAt != null,
                cp.ProofSubmittedAt,
                Challenge = new
                {
                    cp.Challenge.Id,
                    cp.Challenge.Title,
                    cp.Challenge.Description,
                    Type = cp.Challenge.Type.ToString(),
                    TrackingMode = cp.Challenge.TrackingMode.ToString(),
                    ChallengeStatus = cp.Challenge.Status.ToString(),
                    cp.Challenge.TargetCount,
                    cp.Challenge.XpReward,
                    cp.Challenge.CoinsReward,
                    cp.Challenge.RewardDescription,
                    cp.Challenge.ProofInstructions,
                    cp.Challenge.BonusValue,
                    Entrepreneur = new
                    {
                        cp.Challenge.EntrepreneurProfile.Id,
                        cp.Challenge.EntrepreneurProfile.CompanyName
                    }
                }
            })
            .ToListAsync();

        return Ok(participations);
    }

    [HttpDelete("participations/{participationId}")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> Withdraw(int participationId)
    {
        var userId = GetUserId();

        var participation = await _context.ChallengeParticipations
            .FirstOrDefaultAsync(cp => cp.Id == participationId && cp.UserId == userId);

        if (participation == null)
            return NotFound("Participation not found.");

        if (participation.Status == ParticipationStatus.Completed)
            return BadRequest("Cannot withdraw from completed challenge.");

        participation.Status = ParticipationStatus.Withdrawn;
        participation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { withdrawn = true });
    }

    // =========================
    // ENTREPRENEUR: Gestionare participanți
    // =========================
    [HttpGet("{id}/participants")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetParticipants(int id)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var challenge = await _context.Challenges
            .FirstOrDefaultAsync(c => c.Id == id && c.EntrepreneurProfileId == profile.Id);

        if (challenge == null)
            return NotFound("Challenge not found.");

        var participants = await _context.ChallengeParticipations
            .Include(cp => cp.User)
            .Where(cp => cp.ChallengeId == id)
            .OrderByDescending(cp => cp.CreatedAt)
            .Select(cp => new
            {
                cp.Id,
                Status = cp.Status.ToString(),
                cp.CurrentProgress,
                cp.UserMessage,
                cp.EntrepreneurResponse,
                cp.Deadline,
                cp.RewardAwarded,
                cp.XpAwarded,
                cp.CreatedAt,
                cp.AcceptedAt,
                cp.CompletedAt,
                User = new
                {
                    cp.User.Id,
                    cp.User.Email
                }
            })
            .ToListAsync();

        return Ok(participants);
    }

    [HttpPatch("participations/{participationId}/respond")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> RespondToParticipation(int participationId, [FromBody] RespondParticipationDto dto)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var participation = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
            .FirstOrDefaultAsync(cp => cp.Id == participationId &&
                                       cp.Challenge.EntrepreneurProfileId == profile.Id);

        if (participation == null)
            return NotFound("Participation not found.");

        if (participation.Status != ParticipationStatus.Pending)
            return BadRequest("Can only respond to pending participations.");

        participation.EntrepreneurResponse = dto.Response?.Trim();
        participation.UpdatedAt = DateTime.UtcNow;

        if (dto.Accept)
        {
            participation.Status = ParticipationStatus.Accepted;
            participation.AcceptedAt = DateTime.UtcNow;

            // Set deadline if challenge has time limit
            if (participation.Challenge.TimeLimitDays.HasValue)
            {
                participation.Deadline = DateTime.UtcNow.AddDays(participation.Challenge.TimeLimitDays.Value);
            }
        }
        else
        {
            participation.Status = ParticipationStatus.Rejected;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            accepted = dto.Accept,
            Status = participation.Status.ToString(),
            Deadline = participation.Deadline
        });
    }

    [HttpPatch("participations/{participationId}/progress")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> UpdateProgress(int participationId, [FromBody] UpdateProgressDto dto)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var participation = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
            .FirstOrDefaultAsync(cp => cp.Id == participationId &&
                                       cp.Challenge.EntrepreneurProfileId == profile.Id);

        if (participation == null)
            return NotFound("Participation not found.");

        if (participation.Status != ParticipationStatus.Accepted &&
            participation.Status != ParticipationStatus.InProgress)
            return BadRequest("Participation must be accepted or in progress to update.");

        if (dto.Progress.HasValue)
        {
            participation.CurrentProgress = dto.Progress.Value;
            if (participation.Status == ParticipationStatus.Accepted)
                participation.Status = ParticipationStatus.InProgress;
        }

        participation.UpdatedAt = DateTime.UtcNow;

        // Mark as completed and award rewards
        if (dto.MarkCompleted == true)
        {
            participation.Status = ParticipationStatus.Completed;
            participation.CompletedAt = DateTime.UtcNow;

            if (!participation.RewardAwarded)
            {
                participation.RewardAwarded = true;
                participation.XpAwarded = participation.Challenge.XpReward;

                // Award XP through gamification service
                await _gamification.AwardChallengeCompleted(
                    participation.UserId,
                    participation.Challenge.XpReward,
                    participation.Challenge.BadgeCode);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            updated = true,
            Status = participation.Status.ToString(),
            participation.CurrentProgress,
            participation.RewardAwarded,
            participation.XpAwarded
        });
    }

    [HttpPatch("participations/{participationId}/fail")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> MarkFailed(int participationId)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var participation = await _context.ChallengeParticipations
            .Include(cp => cp.Challenge)
            .FirstOrDefaultAsync(cp => cp.Id == participationId &&
                                       cp.Challenge.EntrepreneurProfileId == profile.Id);

        if (participation == null)
            return NotFound("Participation not found.");

        participation.Status = ParticipationStatus.Failed;
        participation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { failed = true });
    }

    // =========================
    // CLIENT: Get live progress for a participation
    // =========================
    [HttpGet("participations/{participationId}/progress")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> GetProgress(int participationId)
    {
        var userId = GetUserId();

        var progressInfo = await _challengeProgress.GetProgressInfo(participationId, userId);
        if (progressInfo == null)
            return NotFound("Participation not found.");

        return Ok(progressInfo);
    }

    // =========================
    // CLIENT: Submit proof for manual verification challenges
    // =========================
    [HttpPost("participations/{participationId}/proof")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> SubmitProof(int participationId, [FromBody] SubmitProofDto dto)
    {
        var userId = GetUserId();

        if (string.IsNullOrWhiteSpace(dto.ProofText) && string.IsNullOrWhiteSpace(dto.ProofImageUrl))
            return BadRequest("You must provide either proof text or an image URL.");

        var success = await _challengeProgress.SubmitProof(participationId, userId, dto.ProofText, dto.ProofImageUrl);
        if (!success)
            return BadRequest("Could not submit proof. Make sure the challenge requires manual verification and you are still participating.");

        return Ok(new { proofSubmitted = true });
    }

    // =========================
    // ENTREPRENEUR: Verify submitted proof
    // =========================
    [HttpPatch("participations/{participationId}/verify")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> VerifyProof(int participationId, [FromBody] VerifyProofDto dto)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var success = await _challengeProgress.VerifyProof(participationId, profile.Id, dto.Approved, dto.Response);
        if (!success)
            return BadRequest("Could not verify proof. Make sure proof has been submitted.");

        return Ok(new { verified = true, approved = dto.Approved });
    }

    // =========================
    // ENTREPRENEUR: Get participations with pending proof
    // =========================
    [HttpGet("{id}/pending-proofs")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetPendingProofs(int id)
    {
        var profile = await GetEntrepreneurProfile();
        if (profile == null) return Forbid();

        var challenge = await _context.Challenges
            .FirstOrDefaultAsync(c => c.Id == id && c.EntrepreneurProfileId == profile.Id);

        if (challenge == null)
            return NotFound("Challenge not found.");

        var pendingProofs = await _context.ChallengeParticipations
            .Include(cp => cp.User)
            .Where(cp => cp.ChallengeId == id)
            .Where(cp => cp.Status == ParticipationStatus.ProofSubmitted)
            .OrderByDescending(cp => cp.ProofSubmittedAt)
            .Select(cp => new
            {
                cp.Id,
                cp.CurrentProgress,
                TargetProgress = cp.Challenge.TargetCount ?? 1,
                cp.ProofText,
                cp.ProofImageUrl,
                cp.ProofSubmittedAt,
                cp.CreatedAt,
                User = new
                {
                    cp.User.Id,
                    cp.User.Email
                }
            })
            .ToListAsync();

        return Ok(pendingProofs);
    }
}

// DTOs for proof submission
public class SubmitProofDto
{
    public string? ProofText { get; set; }
    public string? ProofImageUrl { get; set; }
}

public class VerifyProofDto
{
    public bool Approved { get; set; }
    public string? Response { get; set; }
}
