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
public class BugReportController : ControllerBase
{
    private readonly AppDbContext _db;

    public BugReportController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("id");

        if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("User id missing from token.");

        return userId;
    }

    // CREATE
    [HttpPost]
    public async Task<ActionResult<BugReportDto>> Create([FromBody] CreateBugReportDto dto)
    {
        var userId = GetUserId();

        var report = new BugReport
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Severity = dto.Severity,
            Priority = dto.Priority,
            Status = BugStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        _db.BugReports.Add(report);
        await _db.SaveChangesAsync();

        var userEmail = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync() ?? "";

        return Ok(new BugReportDto
        {
            Id = report.Id,
            UserId = report.UserId,
            UserEmail = userEmail,
            Title = report.Title,
            Description = report.Description,
            Severity = report.Severity,
            Priority = report.Priority,
            Status = report.Status,
            CreatedAt = report.CreatedAt
        });
    }

    // LIST MY BUGS
    [HttpGet("my")]
    public async Task<ActionResult<List<BugReportDto>>> MyReports()
    {
        var userId = GetUserId();

        var data = await _db.BugReports
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BugReportDto
            {
                Id = b.Id,
                UserId = b.UserId,
                Title = b.Title,
                Description = b.Description,
                Severity = b.Severity,
                Priority = b.Priority,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(data);
    }

    // GET MY BUG BY ID
    [HttpGet("my/{id:int}")]
    public async Task<ActionResult<BugReportDto>> MyById(int id)
    {
        var userId = GetUserId();

        var report = await _db.BugReports
            .AsNoTracking()
            .Where(b => b.Id == id && b.UserId == userId)
            .Select(b => new BugReportDto
            {
                Id = b.Id,
                UserId = b.UserId,
                Title = b.Title,
                Description = b.Description,
                Severity = b.Severity,
                Priority = b.Priority,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (report == null) return NotFound();
        return Ok(report);
    }
}
