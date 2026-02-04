using BizQuits.Data;
using BizQuits.DTOs;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/admin/monitoring")]
[Authorize(Roles = "Admin")]
public class AdminMonitoringController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminMonitoringController(AppDbContext db)
    {
        _db = db;
    }

    // Overview KPI cards
    [HttpGet("overview")]
    public async Task<ActionResult<AdminMonitoringOverviewDto>> Overview()
    {
        var now = DateTime.UtcNow;
        var from = now.AddHours(-24);

        // Active users = distinct users who sent/received a message in last 24h
        var activeSenderIds = _db.Messages
            .AsNoTracking()
            .Where(m => m.SentAt >= from)
            .Select(m => m.SenderId);

        var activeRecipientIds = _db.Messages
            .AsNoTracking()
            .Where(m => m.SentAt >= from)
            .Select(m => m.RecipientId);

        var activeUsersLast24h = await activeSenderIds
            .Concat(activeRecipientIds)
            .Distinct()
            .CountAsync();

        var totalUsers = await _db.Users.AsNoTracking().CountAsync();
        var totalServices = await _db.Services.AsNoTracking().CountAsync();
        var totalOffers = await _db.Offers.AsNoTracking().CountAsync();
        var totalChallenges = await _db.Challenges.AsNoTracking().CountAsync();
        var totalBookings = await _db.Bookings.AsNoTracking().CountAsync();
        var totalReviews = await _db.Reviews.AsNoTracking().CountAsync();
        var totalOfferClaims = await _db.OfferClaims.AsNoTracking().CountAsync();

        var bugOpen = await _db.BugReports.AsNoTracking().CountAsync(b => b.Status == BugStatus.Open);
        var bugInProgress = await _db.BugReports.AsNoTracking().CountAsync(b => b.Status == BugStatus.InProgress);
        var bugResolved = await _db.BugReports.AsNoTracking().CountAsync(b => b.Status == BugStatus.Resolved);
        var bugTotal = bugOpen + bugInProgress + bugResolved;

        return Ok(new AdminMonitoringOverviewDto
        {
            TotalUsers = totalUsers,
            ActiveUsersLast24h = activeUsersLast24h,
            TotalServices = totalServices,
            TotalOffers = totalOffers,
            TotalChallenges = totalChallenges,
            TotalBookings = totalBookings,
            TotalReviews = totalReviews,
            TotalOfferClaims = totalOfferClaims,

            BugOpen = bugOpen,
            BugInProgress = bugInProgress,
            BugResolved = bugResolved,
            BugTotal = bugTotal
        });
    }

    // Charts / reports data
    [HttpGet("bug-stats")]
    public async Task<ActionResult<AdminBugStatsDto>> BugStats([FromQuery] int days = 7)
    {
        if (days < 1) days = 1;
        if (days > 90) days = 90;

        var fromDate = DateTime.UtcNow.Date.AddDays(-(days - 1)); // include today

        // time series (group by day)
        var createdPerDayRaw = await _db.BugReports
            .AsNoTracking()
            .Where(b => b.CreatedAt >= fromDate)
            .GroupBy(b => b.CreatedAt.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .OrderBy(x => x.Day)
            .ToListAsync();

        // Fill missing days with 0 so chart doesn't "jump"
        var createdPerDay = new List<DailyCountDto>();
        for (int i = 0; i < days; i++)
        {
            var day = fromDate.AddDays(i);
            var found = createdPerDayRaw.FirstOrDefault(x => x.Day == day);
            createdPerDay.Add(new DailyCountDto
            {
                Day = day.ToString("yyyy-MM-dd"),
                Count = found?.Count ?? 0
            });
        }

        // distributions
        var byStatus = await _db.BugReports.AsNoTracking()
            .GroupBy(b => b.Status)
            .Select(g => new KeyValueIntDto { Key = g.Key.ToString(), Value = g.Count() })
            .ToListAsync();

        var bySeverity = await _db.BugReports.AsNoTracking()
            .GroupBy(b => b.Severity)
            .Select(g => new KeyValueIntDto { Key = g.Key.ToString(), Value = g.Count() })
            .ToListAsync();

        var byPriority = await _db.BugReports.AsNoTracking()
            .GroupBy(b => b.Priority)
            .Select(g => new KeyValueIntDto { Key = g.Key.ToString(), Value = g.Count() })
            .ToListAsync();

        return Ok(new AdminBugStatsDto
        {
            Days = days,
            BugsCreatedPerDay = createdPerDay,
            BugsByStatus = byStatus,
            BugsBySeverity = bySeverity,
            BugsByPriority = byPriority
        });
    }
}
