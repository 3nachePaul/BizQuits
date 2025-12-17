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
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    // ✅ Public: reviews APPROVED for a service + average
    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetForService(int serviceId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Client)
            .Where(r => r.ServiceId == serviceId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                ClientEmail = r.Client.Email
            })
            .ToListAsync();

        var avg = reviews.Count == 0 ? 0 : reviews.Average(r => r.Rating);

        return Ok(new { average = avg, count = reviews.Count, reviews });
    }

    // ✅ Client: eligibilitate (ca să știi dacă afișezi formularul în UI)
    [HttpGet("service/{serviceId}/eligibility")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> Eligibility(int serviceId)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null) return Unauthorized();

        var hasCompleted = await _context.Bookings.AnyAsync(b =>
            b.ClientId == client.Id &&
            b.ServiceId == serviceId &&
            b.Status == BookingStatus.Completed
        );

        // (atenție: asta blochează 1 review / service per user)
        var already = await _context.Reviews.AnyAsync(r => r.ServiceId == serviceId && r.ClientId == client.Id);

        return Ok(new { canReview = hasCompleted && !already, hasCompleted, alreadyReviewed = already });
    }

    // ✅ Client only: create review (PENDING approval) by SERVICE
    [HttpPost("service/{serviceId}")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> Create(int serviceId, [FromBody] CreateReviewDto dto)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null) return Unauthorized();

        var hasCompleted = await _context.Bookings.AnyAsync(b =>
            b.ClientId == client.Id &&
            b.ServiceId == serviceId &&
            b.Status == BookingStatus.Completed
        );

        if (!hasCompleted)
            return BadRequest("You can review only services you have completed.");

        var already = await _context.Reviews.AnyAsync(r => r.ServiceId == serviceId && r.ClientId == client.Id);
        if (already)
            return BadRequest("You already reviewed this service.");

        var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == serviceId);
        if (service == null) return NotFound("Service not found");

        var review = new Review
        {
            ServiceId = serviceId,
            Service = service,
            ClientId = client.Id,
            Client = client,
            Rating = dto.Rating,
            Comment = dto.Comment,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { review.Id, pending = true });
    }

    // ✅ Client only: create review by BOOKING (asta îți lipsea -> fix pentru 404)
    // POST /api/review/booking/{bookingId}
    [HttpPost("booking/{bookingId}")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> CreateForBooking(int bookingId, [FromBody] CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null) return Unauthorized();

        // booking + service
        var booking = await _context.Bookings
            .Include(b => b.Service!)
            .FirstOrDefaultAsync(b => b.Id == bookingId);

        if (booking == null) return NotFound("Booking not found.");
        if (booking.ClientId != client.Id) return Forbid();
        if (booking.Status != BookingStatus.Completed)
            return BadRequest("Booking must be completed to leave a review.");

        var serviceId = booking.ServiceId;

        // IMPORTANT:
        // În modelul tău actual Review NU are BookingId (cel mai probabil),
        // deci nu putem garanta 1 review / booking, ci 1 review / service / user.
        var already = await _context.Reviews.AnyAsync(r => r.ServiceId == serviceId && r.ClientId == client.Id);
        if (already)
            return BadRequest("You already reviewed this service.");

        var service = booking.Service!;
        var review = new Review
        {
            ServiceId = serviceId,
            Service = service,
            ClientId = client.Id,
            Client = client,
            Rating = dto.Rating,
            Comment = dto.Comment,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { review.Id, pending = true });
    }
}
