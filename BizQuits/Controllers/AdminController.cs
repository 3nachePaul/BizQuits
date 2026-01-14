using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = nameof(Role.Admin))]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // USERS
    // =========================
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .Select(u => new
            {
                u.Id,
                u.Email,
                Role = u.Role.ToString(),
                EntrepreneurProfile = u.EntrepreneurProfile != null ? new
                {
                    u.EntrepreneurProfile.Id,
                    u.EntrepreneurProfile.CompanyName,
                    u.EntrepreneurProfile.CUI,
                    u.EntrepreneurProfile.IsApproved
                } : null
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            Role = user.Role.ToString(),
            EntrepreneurProfile = user.EntrepreneurProfile != null ? new
            {
                user.EntrepreneurProfile.Id,
                user.EntrepreneurProfile.CompanyName,
                user.EntrepreneurProfile.CUI,
                user.EntrepreneurProfile.IsApproved
            } : null
        });
    }

    public class AdminUpdateUserDto
    {
        public string? Email { get; set; }
        public string? NewPassword { get; set; }
        public string? Role { get; set; }
        public string? CompanyName { get; set; }
        public string? CUI { get; set; }
        public bool? IsApproved { get; set; }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserDto dto)
    {
        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Update email if provided
        if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != user.Id);
            if (emailExists)
            {
                return BadRequest("Email is already in use.");
            }
            user.Email = dto.Email.Trim().ToLower();
        }

        // Update password if provided (admin can reset without knowing old password)
        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        // Update role if provided
        if (!string.IsNullOrWhiteSpace(dto.Role) && Enum.TryParse<Role>(dto.Role, true, out var newRole))
        {
            // If changing to Entrepreneur, create profile if doesn't exist
            if (newRole == Role.Entrepreneur && user.EntrepreneurProfile == null)
            {
                user.EntrepreneurProfile = new EntrepreneurProfile
                {
                    UserId = user.Id,
                    User = user,
                    CompanyName = dto.CompanyName ?? "Company",
                    CUI = dto.CUI ?? "N/A",
                    IsApproved = dto.IsApproved ?? false
                };
            }
            // If changing from Entrepreneur, remove profile
            else if (newRole != Role.Entrepreneur && user.EntrepreneurProfile != null)
            {
                _context.EntrepreneurProfiles.Remove(user.EntrepreneurProfile);
                user.EntrepreneurProfile = null;
            }
            user.Role = newRole;
        }

        // Update entrepreneur profile if applicable
        if (user.EntrepreneurProfile != null)
        {
            if (!string.IsNullOrWhiteSpace(dto.CompanyName))
            {
                user.EntrepreneurProfile.CompanyName = dto.CompanyName.Trim();
            }
            if (!string.IsNullOrWhiteSpace(dto.CUI))
            {
                user.EntrepreneurProfile.CUI = dto.CUI.Trim().ToUpper();
            }
            if (dto.IsApproved.HasValue)
            {
                user.EntrepreneurProfile.IsApproved = dto.IsApproved.Value;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            Role = user.Role.ToString(),
            EntrepreneurProfile = user.EntrepreneurProfile != null ? new
            {
                user.EntrepreneurProfile.Id,
                user.EntrepreneurProfile.CompanyName,
                user.EntrepreneurProfile.CUI,
                user.EntrepreneurProfile.IsApproved
            } : null
        });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Prevent admin from deleting themselves
        var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (user.Email == currentUserEmail)
        {
            return BadRequest("You cannot delete your own account from the admin panel.");
        }

        // Check for active bookings
        var hasActiveBookings = await _context.Bookings.AnyAsync(b =>
            (b.ClientId == user.Id || (user.EntrepreneurProfile != null &&
             _context.Services.Any(s => s.EntrepreneurProfileId == user.EntrepreneurProfile.Id && s.Id == b.ServiceId))) &&
            b.Status != BookingStatus.Cancelled &&
            b.Status != BookingStatus.Rejected &&
            b.Status != BookingStatus.Completed);

        if (hasActiveBookings)
        {
            return BadRequest("Cannot delete user with active bookings.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { deleted = true });
    }

    // =========================
    // ENTREPRENEUR APPROVAL
    // =========================
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingEntrepreneurs()
    {
        var pending = await _context.EntrepreneurProfiles
            .Where(p => !p.IsApproved)
            .Include(p => p.User)
            .Select(p => new
            {
                p.Id,
                Email = p.User.Email,
                p.CompanyName,
                p.CUI
            })
            .ToListAsync();

        return Ok(pending);
    }

    [HttpPost("approve/{id}")]
    public async Task<IActionResult> ApproveEntrepreneur(int id)
    {
        var profile = await _context.EntrepreneurProfiles.FindAsync(id);
        if (profile == null) return NotFound("Entrepreneur profile not found.");

        profile.IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok(new { approved = true });
    }

    [HttpPost("reject/{id}")]
    public async Task<IActionResult> RejectEntrepreneur(int id)
    {
        var profile = await _context.EntrepreneurProfiles.FindAsync(id);
        if (profile == null) return NotFound("Entrepreneur profile not found.");

        var user = await _context.Users.FindAsync(profile.UserId);
        if (user != null)
        {
            _context.Users.Remove(user); // cascade should remove profile
        }

        await _context.SaveChangesAsync();
        return Ok(new { rejected = true });
    }

    // =========================
    // REVIEW MODERATION
    // =========================

    // 🔍 Get all pending reviews (IsApproved=false)
    // IMPORTANT: asta se potrivește cu ReviewController-ul tău (reviews pe Service)
    [HttpGet("reviews/pending")]
    public async Task<IActionResult> GetPendingReviews()
    {
        // Dacă ai câmpuri gen RejectedAt, poți filtra și după ele.
        // Ca să nu-ți dea compile error, folosim doar IsApproved aici.

        var pending = await _context.Reviews
            .Include(r => r.Service)
            .Include(r => r.Client)
            .Where(r => !r.IsApproved)
            .OrderBy(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                ClientEmail = r.Client.Email,
                ServiceId = r.ServiceId,
                ServiceName = r.Service.Name
            })
            .ToListAsync();

        return Ok(pending);
    }

    // ✅ Approve review
    [HttpPost("reviews/{id}/approve")]
    public async Task<IActionResult> ApproveReview(int id)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return NotFound("Review not found.");

        if (review.IsApproved) return Ok(new { approved = true, already = true });

        review.IsApproved = true;

        // Dacă ai în model ApprovedAt, poți decommenta:
        // review.ApprovedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { approved = true });
    }

    // ❌ Reject review (varianta simplă: îl ștergi)
    // Dacă vrei soft-delete (RejectedAt), îmi trimiți modelul Review.cs și îl fac corect.
    [HttpPost("reviews/{id}/reject")]
    public async Task<IActionResult> RejectReview(int id)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return NotFound("Review not found.");

        // Varianta simplă: DELETE
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new { rejected = true });
    }

    // =========================
    // MODERATION: OFFERS
    // =========================
    [HttpGet("offers")]
    public async Task<IActionResult> GetAllOffers()
    {
        var offers = await _context.Offers
            .Include(o => o.EntrepreneurProfile)
                .ThenInclude(p => p.User)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.Title,
                o.Description,
                Type = o.Type.ToString(),
                o.IsActive,
                o.ValidFrom,
                o.ValidUntil,
                o.DiscountPercentage,
                o.BonusValue,
                o.CreatedAt,
                Entrepreneur = new
                {
                    o.EntrepreneurProfile.Id,
                    o.EntrepreneurProfile.CompanyName,
                    Email = o.EntrepreneurProfile.User.Email
                }
            })
            .ToListAsync();

        return Ok(offers);
    }

    public class AdminUpdateOfferDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }

    [HttpPut("offers/{id}")]
    public async Task<IActionResult> UpdateOffer(int id, [FromBody] AdminUpdateOfferDto dto)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
            return NotFound("Offer not found.");

        if (!string.IsNullOrWhiteSpace(dto.Title))
            offer.Title = dto.Title.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Description))
            offer.Description = dto.Description.Trim();
        if (dto.IsActive.HasValue)
            offer.IsActive = dto.IsActive.Value;

        offer.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { updated = true });
    }

    [HttpDelete("offers/{id}")]
    public async Task<IActionResult> DeleteOffer(int id)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
            return NotFound("Offer not found.");

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return Ok(new { deleted = true });
    }

    // =========================
    // MODERATION: SERVICES
    // =========================
    [HttpGet("services")]
    public async Task<IActionResult> GetAllServices()
    {
        var services = await _context.Services
            .Include(s => s.EntrepreneurProfile)
                .ThenInclude(p => p.User)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.Category,
                s.Duration,
                s.Price,
                s.IsActive,
                s.CreatedAt,
                Entrepreneur = new
                {
                    s.EntrepreneurProfile.Id,
                    s.EntrepreneurProfile.CompanyName,
                    Email = s.EntrepreneurProfile.User.Email
                }
            })
            .ToListAsync();

        return Ok(services);
    }

    public class AdminUpdateServiceDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }

    [HttpPut("services/{id}")]
    public async Task<IActionResult> UpdateService(int id, [FromBody] AdminUpdateServiceDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound("Service not found.");

        if (!string.IsNullOrWhiteSpace(dto.Name))
            service.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Description))
            service.Description = dto.Description.Trim();
        if (dto.IsActive.HasValue)
            service.IsActive = dto.IsActive.Value;

        service.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { updated = true });
    }

    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(int id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound("Service not found.");

        // Check for active bookings
        var hasActiveBookings = await _context.Bookings.AnyAsync(b =>
            b.ServiceId == id &&
            b.Status != BookingStatus.Cancelled &&
            b.Status != BookingStatus.Rejected &&
            b.Status != BookingStatus.Completed);

        if (hasActiveBookings)
            return BadRequest("Cannot delete service with active bookings.");

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return Ok(new { deleted = true });
    }

    // =========================
    // MODERATION: CHALLENGES
    // =========================
    [HttpGet("challenges")]
    public async Task<IActionResult> GetAllChallenges()
    {
        var challenges = await _context.Challenges
            .Include(c => c.EntrepreneurProfile)
                .ThenInclude(p => p.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                Type = c.Type.ToString(),
                Status = c.Status.ToString(),
                c.XpReward,
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
                ParticipantsCount = _context.ChallengeParticipations
                    .Count(cp => cp.ChallengeId == c.Id)
            })
            .ToListAsync();

        return Ok(challenges);
    }

    public class AdminUpdateChallengeDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    [HttpPut("challenges/{id}")]
    public async Task<IActionResult> UpdateChallenge(int id, [FromBody] AdminUpdateChallengeDto dto)
    {
        var challenge = await _context.Challenges.FindAsync(id);
        if (challenge == null)
            return NotFound("Challenge not found.");

        if (!string.IsNullOrWhiteSpace(dto.Title))
            challenge.Title = dto.Title.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Description))
            challenge.Description = dto.Description.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Status) &&
            Enum.TryParse<ChallengeStatus>(dto.Status, true, out var newStatus))
            challenge.Status = newStatus;

        challenge.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { updated = true });
    }

    [HttpDelete("challenges/{id}")]
    public async Task<IActionResult> DeleteChallenge(int id)
    {
        var challenge = await _context.Challenges.FindAsync(id);
        if (challenge == null)
            return NotFound("Challenge not found.");

        // Check for active participants
        var hasActiveParticipants = await _context.ChallengeParticipations.AnyAsync(cp =>
            cp.ChallengeId == id &&
            (cp.Status == ParticipationStatus.Accepted || cp.Status == ParticipationStatus.InProgress));

        if (hasActiveParticipants)
            return BadRequest("Cannot delete challenge with active participants.");

        _context.Challenges.Remove(challenge);
        await _context.SaveChangesAsync();

        return Ok(new { deleted = true });
    }
}
