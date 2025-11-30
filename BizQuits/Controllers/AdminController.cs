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
                    u.EntrepreneurProfile.CompanyName,
                    u.EntrepreneurProfile.CUI,
                    u.EntrepreneurProfile.IsApproved
                } : null
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingEntrepreneurs()
    {
        var pending = await _context.EntrepreneurProfiles
            .Where(p => !p.IsApproved)
            .Include(p => p.User)
            .Select(p => new
            {
                p.Id,
                p.User.Email,
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
        if (profile == null)
        {
            return NotFound();
        }

        profile.IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("reject/{id}")]
    public async Task<IActionResult> RejectEntrepreneur(int id)
    {
        var profile = await _context.EntrepreneurProfiles.FindAsync(id);
        if (profile == null)
        {
            return NotFound();
        }

        var user = await _context.Users.FindAsync(profile.UserId);
        if (user != null)
        {
            _context.Users.Remove(user);
        }
        
        // The profile will be deleted by cascade due to the foreign key relationship

        await _context.SaveChangesAsync();

        return Ok();
    }
}
