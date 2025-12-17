using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}
