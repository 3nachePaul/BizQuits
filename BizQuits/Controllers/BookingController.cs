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
[Authorize]
public class BookingController : ControllerBase
{
    private readonly AppDbContext _context;

    public BookingController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/booking - Create a new booking (Client only)
    [HttpPost]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null)
        {
            return Unauthorized();
        }

        // Check if service exists and is active
        var service = await _context.Services
            .Include(s => s.EntrepreneurProfile)
            .FirstOrDefaultAsync(s => s.Id == dto.ServiceId && s.IsActive);

        if (service == null)
        {
            return NotFound("Service not found or is not active");
        }

        // Check if entrepreneur is approved
        if (service.EntrepreneurProfile == null || !service.EntrepreneurProfile.IsApproved)
        {
            return BadRequest("This service is not available");
        }

        // Check if client already has a pending booking for this service
        var existingBooking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.ClientId == client.Id && 
                                      b.ServiceId == dto.ServiceId && 
                                      (b.Status == BookingStatus.Pending || b.Status == BookingStatus.Accepted || b.Status == BookingStatus.InProgress));

        if (existingBooking != null)
        {
            return BadRequest("You already have an active booking for this service");
        }

        var booking = new Booking
        {
            ClientId = client.Id,
            ServiceId = dto.ServiceId,
            Message = dto.Message,
            Status = BookingStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, MapToDto(booking, service, client));
    }

    // GET: api/booking/{id} - Get a specific booking
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBooking(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.EntrepreneurProfile)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return Unauthorized();
        }

        var booking = await _context.Bookings
            .Include(b => b.Client)
            .Include(b => b.Service!)
                .ThenInclude(s => s.EntrepreneurProfile)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return NotFound();
        }

        // Check if user is the client or the entrepreneur
        bool isClient = booking.ClientId == user.Id;
        bool isEntrepreneur = user.EntrepreneurProfile != null && 
                              booking.Service?.EntrepreneurProfileId == user.EntrepreneurProfile.Id;

        if (!isClient && !isEntrepreneur)
        {
            return Forbid();
        }

        return Ok(MapToDto(booking, booking.Service!, booking.Client!));
    }

    // GET: api/booking/my - Get all bookings for the logged-in client
    [HttpGet("my")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> GetMyBookings()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null)
        {
            return Unauthorized();
        }

        var bookings = await _context.Bookings
            .Include(b => b.Service!)
                .ThenInclude(s => s.EntrepreneurProfile)
            .Where(b => b.ClientId == client.Id)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var result = bookings.Select(b => MapToDto(b, b.Service!, client)).ToList();
        return Ok(result);
    }

    // GET: api/booking/entrepreneur - Get all bookings for entrepreneur's services
    [HttpGet("entrepreneur")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetEntrepreneurBookings()
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
            return BadRequest("Entrepreneur profile not found");
        }

        var bookings = await _context.Bookings
            .Include(b => b.Client)
            .Include(b => b.Service!)
                .ThenInclude(s => s.EntrepreneurProfile)
            .Where(b => b.Service!.EntrepreneurProfileId == user.EntrepreneurProfile.Id)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

        var result = bookings.Select(b => MapToDto(b, b.Service!, b.Client!)).ToList();
        return Ok(result);
    }

    // PATCH: api/booking/{id}/status - Update booking status (Entrepreneur only)
    [HttpPatch("{id}/status")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto dto)
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
            return BadRequest("Entrepreneur profile not found");
        }

        var booking = await _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Client)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return NotFound();
        }

        // Verify the booking is for one of this entrepreneur's services
        if (booking.Service?.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        // Parse and validate the new status
        if (!Enum.TryParse<BookingStatus>(dto.Status, true, out var newStatus))
        {
            return BadRequest("Invalid status value");
        }

        // Validate status transitions
        var validTransition = IsValidStatusTransition(booking.Status, newStatus);
        if (!validTransition)
        {
            return BadRequest($"Cannot transition from {booking.Status} to {newStatus}");
        }

        booking.Status = newStatus;
        booking.UpdatedAt = DateTime.UtcNow;
        
        if (!string.IsNullOrEmpty(dto.Response))
        {
            booking.EntrepreneurResponse = dto.Response;
        }

        // Set dates based on status
        if (newStatus == BookingStatus.Accepted || newStatus == BookingStatus.InProgress)
        {
            booking.StartDate ??= DateTime.UtcNow;
        }
        else if (newStatus == BookingStatus.Completed)
        {
            booking.CompletedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(MapToDto(booking, booking.Service!, booking.Client!));
    }

    // PATCH: api/booking/{id}/cancel - Cancel a booking (Client only, if pending)
    [HttpPatch("{id}/cancel")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null)
        {
            return Unauthorized();
        }

        var booking = await _context.Bookings
            .Include(b => b.Service!)
                .ThenInclude(s => s.EntrepreneurProfile)
            .FirstOrDefaultAsync(b => b.Id == id && b.ClientId == client.Id);

        if (booking == null)
        {
            return NotFound();
        }

        // Can only cancel if pending or accepted
        if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Accepted)
        {
            return BadRequest("Can only cancel pending or accepted bookings");
        }

        booking.Status = BookingStatus.Cancelled;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(booking, booking.Service!, client));
    }

    // PATCH: api/booking/{id}/complete - Mark booking as completed (Client only, when InProgress)
    [HttpPatch("{id}/complete")]
    [Authorize(Roles = nameof(Role.Client))]
    public async Task<IActionResult> CompleteBooking(int id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var client = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (client == null)
        {
            return Unauthorized();
        }

        var booking = await _context.Bookings
            .Include(b => b.Service!)
                .ThenInclude(s => s.EntrepreneurProfile)
            .FirstOrDefaultAsync(b => b.Id == id && b.ClientId == client.Id);

        if (booking == null)
        {
            return NotFound();
        }

        // Can only complete if in progress
        if (booking.Status != BookingStatus.InProgress)
        {
            return BadRequest("Can only complete bookings that are in progress");
        }

        booking.Status = BookingStatus.Completed;
        booking.CompletedDate = DateTime.UtcNow;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(booking, booking.Service!, client));
    }

    private static bool IsValidStatusTransition(BookingStatus current, BookingStatus next)
    {
        return (current, next) switch
        {
            (BookingStatus.Pending, BookingStatus.Accepted) => true,
            (BookingStatus.Pending, BookingStatus.Rejected) => true,
            (BookingStatus.Accepted, BookingStatus.InProgress) => true,
            (BookingStatus.Accepted, BookingStatus.Cancelled) => true,
            (BookingStatus.InProgress, BookingStatus.Cancelled) => true,
            _ => false
        };
    }

    private static BookingResponseDto MapToDto(Booking booking, Service service, User client)
    {
        return new BookingResponseDto
        {
            Id = booking.Id,
            Status = booking.Status.ToString(),
            Message = booking.Message,
            EntrepreneurResponse = booking.EntrepreneurResponse,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt,
            StartDate = booking.StartDate,
            CompletedDate = booking.CompletedDate,
            Service = new BookingServiceDto
            {
                Id = service.Id,
                Name = service.Name,
                Category = service.Category,
                Duration = service.Duration,
                Price = service.Price,
                EntrepreneurCompanyName = service.EntrepreneurProfile?.CompanyName
            },
            Client = new BookingClientDto
            {
                Id = client.Id,
                Email = client.Email
            }
        };
    }
}
