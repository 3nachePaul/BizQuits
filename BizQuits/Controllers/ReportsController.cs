using BizQuits.Data;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = nameof(Role.Entrepreneur))]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/reports/active-users
    [HttpGet("active-users")]
    public async Task<IActionResult> GetActiveUsers()
    {
        var count = await _context.ClientStats.CountAsync();
        return Ok(new { activeUsers = count });
    }

    // GET: api/reports/campaign-stats
    [HttpGet("campaign-stats")]
    public async Task<IActionResult> GetCampaignStats()
    {
        var bookings = await _context.Bookings.ToListAsync();
        var completed = bookings.Count(b => b.Status == BookingStatus.Completed);
        var total = bookings.Count;
        return Ok(new { totalBookings = total, completedBookings = completed });
    }

    // GET: api/reports/user-activity
    [HttpGet("user-activity")]
    public async Task<IActionResult> GetUserActivity()
    {
        var stats = await _context.ClientStats
            .Include(cs => cs.User)
            .Select(cs => new {
                cs.User.Email,
                cs.Xp,
                cs.Level,
                cs.TotalBookingsCreated,
                cs.TotalBookingsCompleted
            })
            .ToListAsync();
        return Ok(stats);
    }
}
