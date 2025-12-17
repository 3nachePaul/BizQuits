using BizQuits.Data;
using BizQuits.DTOs;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfferController : ControllerBase
{
    private readonly AppDbContext _context;

    public OfferController(AppDbContext context)
    {
        _context = context;
    }

    private static string GetOfferTypeDisplayName(OfferType type) => type switch
    {
        OfferType.JobMilestone => "Obiectiv Job-uri",
        OfferType.EarlyCompletion => "Finalizare Timpurie",
        OfferType.Coupon => "Cupon",
        OfferType.Discount => "Reducere",
        OfferType.Referral => "Recomandare",
        OfferType.LoyaltyReward => "Recompensă Fidelitate",
        _ => type.ToString()
    };

    // GET: api/offer - Get all active offers (public, for clients)
    [HttpGet]
    public async Task<IActionResult> GetAllOffers(
        [FromQuery] string? type = null,
        [FromQuery] string? search = null)
    {
        var query = _context.Offers
            .Include(o => o.EntrepreneurProfile)
                .ThenInclude(ep => ep.User)
            .Where(o => o.IsActive && o.EntrepreneurProfile.IsApproved)
            .Where(o => !o.ValidUntil.HasValue || o.ValidUntil > DateTime.UtcNow)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(type) && type != "all" && Enum.TryParse<OfferType>(type, out var offerType))
        {
            query = query.Where(o => o.Type == offerType);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(o =>
                o.Title.ToLower().Contains(searchLower) ||
                o.Description.ToLower().Contains(searchLower) ||
                o.EntrepreneurProfile.CompanyName.ToLower().Contains(searchLower));
        }

        var offers = await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OfferResponseDto
            {
                Id = o.Id,
                Title = o.Title,
                Description = o.Description,
                Type = o.Type.ToString(),
                TypeDisplayName = GetOfferTypeDisplayName(o.Type),
                MilestoneCount = o.MilestoneCount,
                EarlyCompletionDays = o.EarlyCompletionDays,
                DiscountPercentage = o.DiscountPercentage,
                BonusValue = o.BonusValue,
                RewardDescription = o.RewardDescription,
                ValidFrom = o.ValidFrom,
                ValidUntil = o.ValidUntil,
                IsActive = o.IsActive,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                Entrepreneur = new EntrepreneurInfoDto
                {
                    Id = o.EntrepreneurProfile.Id,
                    CompanyName = o.EntrepreneurProfile.CompanyName,
                    Email = o.EntrepreneurProfile.User.Email
                }
            })
            .ToListAsync();

        return Ok(offers);
    }

    // GET: api/offer/types - Get all offer types
    [HttpGet("types")]
    public IActionResult GetOfferTypes()
    {
        var types = Enum.GetValues<OfferType>()
            .Select(t => new
            {
                Value = t.ToString(),
                DisplayName = GetOfferTypeDisplayName(t),
                Description = t switch
                {
                    OfferType.JobMilestone => "Recompensă la al X-lea job finalizat",
                    OfferType.EarlyCompletion => "Bonus pentru finalizare înainte de termen",
                    OfferType.Coupon => "Cupon de reducere pentru servicii",
                    OfferType.Discount => "Reducere procentuală la servicii",
                    OfferType.Referral => "Bonus pentru recomandarea altor clienți",
                    OfferType.LoyaltyReward => "Recompensă pentru clienți fideli",
                    _ => ""
                }
            })
            .ToList();

        return Ok(types);
    }

    // GET: api/offer/{id} - Get offer by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOffer(int id)
    {
        var offer = await _context.Offers
            .Include(o => o.EntrepreneurProfile)
                .ThenInclude(ep => ep.User)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null)
        {
            return NotFound("Oferta nu a fost găsită");
        }

        var response = new OfferResponseDto
        {
            Id = offer.Id,
            Title = offer.Title,
            Description = offer.Description,
            Type = offer.Type.ToString(),
            TypeDisplayName = GetOfferTypeDisplayName(offer.Type),
            MilestoneCount = offer.MilestoneCount,
            EarlyCompletionDays = offer.EarlyCompletionDays,
            DiscountPercentage = offer.DiscountPercentage,
            BonusValue = offer.BonusValue,
            RewardDescription = offer.RewardDescription,
            ValidFrom = offer.ValidFrom,
            ValidUntil = offer.ValidUntil,
            IsActive = offer.IsActive,
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt,
            Entrepreneur = offer.EntrepreneurProfile != null ? new EntrepreneurInfoDto
            {
                Id = offer.EntrepreneurProfile.Id,
                CompanyName = offer.EntrepreneurProfile.CompanyName,
                Email = offer.EntrepreneurProfile.User.Email
            } : null
        };

        return Ok(response);
    }

    // GET: api/offer/my - Get offers for the logged-in entrepreneur
    [HttpGet("my")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetMyOffers()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        if (!user.EntrepreneurProfile.IsApproved)
        {
            return BadRequest("Contul tău de antreprenor este în așteptarea aprobării");
        }

        var offers = await _context.Offers
            .Where(o => o.EntrepreneurProfileId == user.EntrepreneurProfile.Id)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OfferResponseDto
            {
                Id = o.Id,
                Title = o.Title,
                Description = o.Description,
                Type = o.Type.ToString(),
                TypeDisplayName = GetOfferTypeDisplayName(o.Type),
                MilestoneCount = o.MilestoneCount,
                EarlyCompletionDays = o.EarlyCompletionDays,
                DiscountPercentage = o.DiscountPercentage,
                BonusValue = o.BonusValue,
                RewardDescription = o.RewardDescription,
                ValidFrom = o.ValidFrom,
                ValidUntil = o.ValidUntil,
                IsActive = o.IsActive,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                Entrepreneur = null
            })
            .ToListAsync();

        return Ok(offers);
    }

    // POST: api/offer - Create a new offer
    [HttpPost]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> CreateOffer([FromBody] CreateOfferDto dto)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        if (!user.EntrepreneurProfile.IsApproved)
        {
            return BadRequest("Contul tău de antreprenor este în așteptarea aprobării");
        }

        // Validate type-specific fields
        var validationError = ValidateOfferFields(dto);
        if (validationError != null)
        {
            return BadRequest(validationError);
        }

        var offer = new Offer
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            MilestoneCount = dto.MilestoneCount,
            EarlyCompletionDays = dto.EarlyCompletionDays,
            DiscountPercentage = dto.DiscountPercentage,
            BonusValue = dto.BonusValue,
            RewardDescription = dto.RewardDescription,
            ValidFrom = dto.ValidFrom,
            ValidUntil = dto.ValidUntil,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            EntrepreneurProfileId = user.EntrepreneurProfile.Id
        };

        _context.Offers.Add(offer);
        await _context.SaveChangesAsync();

        var response = new OfferResponseDto
        {
            Id = offer.Id,
            Title = offer.Title,
            Description = offer.Description,
            Type = offer.Type.ToString(),
            TypeDisplayName = GetOfferTypeDisplayName(offer.Type),
            MilestoneCount = offer.MilestoneCount,
            EarlyCompletionDays = offer.EarlyCompletionDays,
            DiscountPercentage = offer.DiscountPercentage,
            BonusValue = offer.BonusValue,
            RewardDescription = offer.RewardDescription,
            ValidFrom = offer.ValidFrom,
            ValidUntil = offer.ValidUntil,
            IsActive = offer.IsActive,
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt,
            Entrepreneur = null
        };

        return CreatedAtAction(nameof(GetOffer), new { id = offer.Id }, response);
    }

    // PUT: api/offer/{id} - Update an offer
    [HttpPut("{id}")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> UpdateOffer(int id, [FromBody] UpdateOfferDto dto)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound("Oferta nu a fost găsită");
        }

        if (offer.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        // Validate type-specific fields
        var validationError = ValidateOfferFields(new CreateOfferDto
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            MilestoneCount = dto.MilestoneCount,
            EarlyCompletionDays = dto.EarlyCompletionDays,
            DiscountPercentage = dto.DiscountPercentage,
            BonusValue = dto.BonusValue,
            RewardDescription = dto.RewardDescription
        });
        if (validationError != null)
        {
            return BadRequest(validationError);
        }

        offer.Title = dto.Title;
        offer.Description = dto.Description;
        offer.Type = dto.Type;
        offer.MilestoneCount = dto.MilestoneCount;
        offer.EarlyCompletionDays = dto.EarlyCompletionDays;
        offer.DiscountPercentage = dto.DiscountPercentage;
        offer.BonusValue = dto.BonusValue;
        offer.RewardDescription = dto.RewardDescription;
        offer.ValidFrom = dto.ValidFrom;
        offer.ValidUntil = dto.ValidUntil;
        offer.IsActive = dto.IsActive;
        offer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new OfferResponseDto
        {
            Id = offer.Id,
            Title = offer.Title,
            Description = offer.Description,
            Type = offer.Type.ToString(),
            TypeDisplayName = GetOfferTypeDisplayName(offer.Type),
            MilestoneCount = offer.MilestoneCount,
            EarlyCompletionDays = offer.EarlyCompletionDays,
            DiscountPercentage = offer.DiscountPercentage,
            BonusValue = offer.BonusValue,
            RewardDescription = offer.RewardDescription,
            ValidFrom = offer.ValidFrom,
            ValidUntil = offer.ValidUntil,
            IsActive = offer.IsActive,
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt,
            Entrepreneur = null
        };

        return Ok(response);
    }

    // PATCH: api/offer/{id}/toggle - Toggle offer active status
    [HttpPatch("{id}/toggle")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> ToggleOfferStatus(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound("Oferta nu a fost găsită");
        }

        if (offer.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        offer.IsActive = !offer.IsActive;
        offer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { offer.Id, offer.IsActive });
    }

    // DELETE: api/offer/{id} - Delete an offer
    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> DeleteOffer(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound("Oferta nu a fost găsită");
        }

        if (offer.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static string? ValidateOfferFields(CreateOfferDto dto)
    {
        return dto.Type switch
        {
            OfferType.JobMilestone when !dto.MilestoneCount.HasValue =>
                "Pentru tipul 'Obiectiv Job-uri', trebuie să specifici numărul de job-uri",
            OfferType.EarlyCompletion when !dto.EarlyCompletionDays.HasValue =>
                "Pentru tipul 'Finalizare Timpurie', trebuie să specifici numărul de zile",
            OfferType.Discount when !dto.DiscountPercentage.HasValue =>
                "Pentru tipul 'Reducere', trebuie să specifici procentul de reducere",
            _ => null
        };
    }

    // ========================================
    // OFFER CLAIMS - Client functionality
    // ========================================

    // POST: api/offer/{id}/claim - Claim an offer
    [HttpPost("{id}/claim")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> ClaimOffer(int id, [FromBody] ClaimOfferDto? dto = null)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return Unauthorized();
        }

        var offer = await _context.Offers
            .Include(o => o.EntrepreneurProfile)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (offer == null)
        {
            return NotFound("Oferta nu a fost găsită");
        }

        if (!offer.IsActive)
        {
            return BadRequest("Această ofertă nu mai este activă");
        }

        if (offer.ValidUntil.HasValue && offer.ValidUntil < DateTime.UtcNow)
        {
            return BadRequest("Această ofertă a expirat");
        }

        if (offer.ValidFrom.HasValue && offer.ValidFrom > DateTime.UtcNow)
        {
            return BadRequest("Această ofertă nu a început încă");
        }

        // Check if already claimed
        var existingClaim = await _context.OfferClaims
            .FirstOrDefaultAsync(oc => oc.OfferId == id && oc.UserId == user.Id);

        if (existingClaim != null)
        {
            return BadRequest("Ai revendicat deja această ofertă");
        }

        // Generate unique claim code
        var claimCode = GenerateClaimCode();

        var claim = new OfferClaim
        {
            OfferId = id,
            UserId = user.Id,
            ClaimedAt = DateTime.UtcNow,
            Status = ClaimStatus.Claimed,
            ClaimCode = claimCode,
            Notes = dto?.Notes
        };

        _context.OfferClaims.Add(claim);
        await _context.SaveChangesAsync();

        return Ok(new OfferClaimResponseDto
        {
            Id = claim.Id,
            OfferId = claim.OfferId,
            OfferTitle = offer.Title,
            ClaimCode = claim.ClaimCode,
            Status = claim.Status.ToString(),
            ClaimedAt = claim.ClaimedAt,
            Notes = claim.Notes
        });
    }

    // GET: api/offer/claims/my - Get my claimed offers
    [HttpGet("claims/my")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> GetMyClaims()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return Unauthorized();
        }

        var claims = await _context.OfferClaims
            .Include(oc => oc.Offer)
                .ThenInclude(o => o.EntrepreneurProfile)
                    .ThenInclude(ep => ep.User)
            .Where(oc => oc.UserId == user.Id)
            .OrderByDescending(oc => oc.ClaimedAt)
            .Select(oc => new OfferClaimResponseDto
            {
                Id = oc.Id,
                OfferId = oc.OfferId,
                OfferTitle = oc.Offer.Title,
                ClaimCode = oc.ClaimCode,
                Status = oc.Status.ToString(),
                ClaimedAt = oc.ClaimedAt,
                UsedAt = oc.UsedAt,
                Notes = oc.Notes,
                Offer = new OfferResponseDto
                {
                    Id = oc.Offer.Id,
                    Title = oc.Offer.Title,
                    Description = oc.Offer.Description,
                    Type = oc.Offer.Type.ToString(),
                    TypeDisplayName = GetOfferTypeDisplayName(oc.Offer.Type),
                    MilestoneCount = oc.Offer.MilestoneCount,
                    EarlyCompletionDays = oc.Offer.EarlyCompletionDays,
                    DiscountPercentage = oc.Offer.DiscountPercentage,
                    BonusValue = oc.Offer.BonusValue,
                    RewardDescription = oc.Offer.RewardDescription,
                    ValidFrom = oc.Offer.ValidFrom,
                    ValidUntil = oc.Offer.ValidUntil,
                    IsActive = oc.Offer.IsActive,
                    Entrepreneur = oc.Offer.EntrepreneurProfile != null ? new EntrepreneurInfoDto
                    {
                        Id = oc.Offer.EntrepreneurProfile.Id,
                        CompanyName = oc.Offer.EntrepreneurProfile.CompanyName,
                        Email = oc.Offer.EntrepreneurProfile.User != null ? oc.Offer.EntrepreneurProfile.User.Email : ""
                    } : null
                }
            })
            .ToListAsync();

        return Ok(claims);
    }

    // DELETE: api/offer/claims/{claimId} - Cancel a claim (only if not used)
    [HttpDelete("claims/{claimId}")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> CancelClaim(int claimId)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return Unauthorized();
        }

        var claim = await _context.OfferClaims.FindAsync(claimId);
        if (claim == null)
        {
            return NotFound("Revendicarea nu a fost găsită");
        }

        if (claim.UserId != user.Id)
        {
            return Forbid();
        }

        if (claim.Status == ClaimStatus.Used)
        {
            return BadRequest("Nu poți anula o ofertă care a fost deja folosită");
        }

        _context.OfferClaims.Remove(claim);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/offer/{id}/claims - Get claims for a specific offer (for entrepreneur)
    [HttpGet("{id}/claims")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetOfferClaims(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound("Oferta nu a fost găsită");
        }

        if (offer.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        var claims = await _context.OfferClaims
            .Include(oc => oc.User)
            .Where(oc => oc.OfferId == id)
            .OrderByDescending(oc => oc.ClaimedAt)
            .Select(oc => new
            {
                oc.Id,
                oc.ClaimCode,
                Status = oc.Status.ToString(),
                oc.ClaimedAt,
                oc.UsedAt,
                oc.Notes,
                User = new
                {
                    oc.User.Id,
                    oc.User.Email
                }
            })
            .ToListAsync();

        return Ok(claims);
    }

    // PATCH: api/offer/claims/{claimId}/use - Mark a claim as used (for entrepreneur)
    [HttpPatch("claims/{claimId}/use")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> MarkClaimAsUsed(int claimId)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user?.EntrepreneurProfile == null)
        {
            return BadRequest("Profilul de antreprenor nu a fost găsit");
        }

        var claim = await _context.OfferClaims
            .Include(oc => oc.Offer)
            .FirstOrDefaultAsync(oc => oc.Id == claimId);

        if (claim == null)
        {
            return NotFound("Revendicarea nu a fost găsită");
        }

        if (claim.Offer.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        if (claim.Status == ClaimStatus.Used)
        {
            return BadRequest("Această ofertă a fost deja folosită");
        }

        claim.Status = ClaimStatus.Used;
        claim.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Oferta a fost marcată ca folosită" });
    }

    private static string GenerateClaimCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, 8)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
