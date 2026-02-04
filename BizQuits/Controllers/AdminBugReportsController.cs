using BizQuits.Data;
using BizQuits.DTOs;
using BizQuits.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/admin/bugreports")]
[Authorize(Roles = "Admin")]
public class AdminBugReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminBugReportsController(AppDbContext db)
    {
        _db = db;
    }

    // LIST + FILTERS
    [HttpGet]
    public async Task<ActionResult<List<BugReportDto>>> GetAll(
        [FromQuery] BugStatus? status,
        [FromQuery] BugSeverity? severity,
        [FromQuery] BugPriority? priority
    )
    {
        var q = _db.BugReports
            .AsNoTracking()
            .Include(b => b.User)
            .AsQueryable();

        if (status.HasValue) q = q.Where(b => b.Status == status.Value);
        if (severity.HasValue) q = q.Where(b => b.Severity == severity.Value);
        if (priority.HasValue) q = q.Where(b => b.Priority == priority.Value);

        var data = await q
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BugReportDto
            {
                Id = b.Id,
                UserId = b.UserId,
                UserEmail = b.User != null ? b.User.Email : "",
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

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBugReportStatusDto dto)
    {
        var report = await _db.BugReports.FindAsync(id);
        if (report == null) return NotFound();

        report.Status = dto.Status;
        report.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/severity")]
    public async Task<IActionResult> UpdateSeverity(int id, [FromBody] UpdateBugReportSeverityDto dto)
    {
        var report = await _db.BugReports.FindAsync(id);
        if (report == null) return NotFound();

        report.Severity = dto.Severity;
        report.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/priority")]
    public async Task<IActionResult> UpdatePriority(int id, [FromBody] UpdateBugReportPriorityDto dto)
    {
        var report = await _db.BugReports.FindAsync(id);
        if (report == null) return NotFound();

        report.Priority = dto.Priority;
        report.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
