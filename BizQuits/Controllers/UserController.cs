using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BCrypt.Net;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
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
            return NotFound();
        }

        var response = new
        {
            user.Id,
            user.Email,
            user.Coins,
            user.HasSeenTutorial,
            Role = user.Role.ToString(),
            EntrepreneurProfile = user.EntrepreneurProfile != null ? new
            {
                user.EntrepreneurProfile.Id,
                user.EntrepreneurProfile.CompanyName,
                user.EntrepreneurProfile.CUI,
                user.EntrepreneurProfile.IsApproved
            } : null
        };

        return Ok(response);
    }

    // GET: api/user/coins - Get user's coin balance
    [HttpGet("coins")]
    public async Task<IActionResult> GetCoins()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new { coins = user.Coins });
    }

    public class UpdateProfileDto
    {
        public string? Email { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
        public string? CompanyName { get; set; }
        public string? CUI { get; set; }
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
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
            return NotFound();
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

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            {
                return BadRequest("Current password is required to change password.");
            }
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("Current password is incorrect.");
            }
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
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

    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountDto? dto)
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
            return NotFound();
        }

        // Verify password for non-admin users
        if (user.Role != Role.Admin)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Password is required to delete account.");
            }
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return BadRequest("Incorrect password.");
            }
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
            return BadRequest("Cannot delete account with active bookings. Please complete or cancel all bookings first.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { deleted = true });
    }

    public class DeleteAccountDto
    {
        public string? Password { get; set; }
    }

    // POST: api/user/tutorial/complete - Mark tutorial as seen
    [HttpPost("tutorial/complete")]
    public async Task<IActionResult> CompleteTutorial()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return NotFound();
        }

        user.HasSeenTutorial = true;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, hasSeenTutorial = true });
    }

    // POST: api/user/tutorial/reset - Reset tutorial (for replay)
    [HttpPost("tutorial/reset")]
    public async Task<IActionResult> ResetTutorial()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return NotFound();
        }

        user.HasSeenTutorial = false;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, hasSeenTutorial = false });
    }
}
