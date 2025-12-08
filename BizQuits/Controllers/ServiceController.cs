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
public class ServiceController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServiceController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/service - Get all active services (public, for clients)
    [HttpGet]
    public async Task<IActionResult> GetAllServices(
        [FromQuery] string? category = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? search = null)
    {
        var query = _context.Services
            .Include(s => s.EntrepreneurProfile!)
                .ThenInclude(ep => ep.User)
            .Where(s => s.IsActive && s.EntrepreneurProfile!.IsApproved)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(s => s.Category == category);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(s => s.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(s => s.Price <= maxPrice.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(s => 
                s.Name.ToLower().Contains(searchLower) || 
                s.Description.ToLower().Contains(searchLower) ||
                s.EntrepreneurProfile!.CompanyName.ToLower().Contains(searchLower));
        }

        var services = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new ServiceResponseDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Category = s.Category,
                Duration = s.Duration,
                Price = s.Price,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                Entrepreneur = new EntrepreneurInfoDto
                {
                    Id = s.EntrepreneurProfile!.Id,
                    CompanyName = s.EntrepreneurProfile.CompanyName,
                    Email = s.EntrepreneurProfile.User.Email
                }
            })
            .ToListAsync();

        return Ok(services);
    }

    // GET: api/service/categories - Get all unique categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Services
            .Where(s => s.IsActive)
            .Select(s => s.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/service/{id} - Get service by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetService(int id)
    {
        var service = await _context.Services
            .Include(s => s.EntrepreneurProfile!)
                .ThenInclude(ep => ep.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (service == null)
        {
            return NotFound("Service not found");
        }

        var response = new ServiceResponseDto
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            Category = service.Category,
            Duration = service.Duration,
            Price = service.Price,
            IsActive = service.IsActive,
            CreatedAt = service.CreatedAt,
            UpdatedAt = service.UpdatedAt,
            Entrepreneur = service.EntrepreneurProfile != null ? new EntrepreneurInfoDto
            {
                Id = service.EntrepreneurProfile.Id,
                CompanyName = service.EntrepreneurProfile.CompanyName,
                Email = service.EntrepreneurProfile.User.Email
            } : null
        };

        return Ok(response);
    }

    // GET: api/service/my - Get services for the logged-in entrepreneur
    [HttpGet("my")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> GetMyServices()
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

        if (!user.EntrepreneurProfile.IsApproved)
        {
            return BadRequest("Your entrepreneur account is pending approval");
        }

        var services = await _context.Services
            .Where(s => s.EntrepreneurProfileId == user.EntrepreneurProfile.Id)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new ServiceResponseDto
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                Category = s.Category,
                Duration = s.Duration,
                Price = s.Price,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                Entrepreneur = null
            })
            .ToListAsync();

        return Ok(services);
    }

    // POST: api/service - Create a new service
    [HttpPost]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
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

        if (!user.EntrepreneurProfile.IsApproved)
        {
            return BadRequest("Your entrepreneur account is pending approval");
        }

        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category,
            Duration = dto.Duration,
            Price = dto.Price,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            EntrepreneurProfileId = user.EntrepreneurProfile.Id
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        var response = new ServiceResponseDto
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            Category = service.Category,
            Duration = service.Duration,
            Price = service.Price,
            IsActive = service.IsActive,
            CreatedAt = service.CreatedAt,
            UpdatedAt = service.UpdatedAt,
            Entrepreneur = null
        };

        return CreatedAtAction(nameof(GetService), new { id = service.Id }, response);
    }

    // PUT: api/service/{id} - Update a service
    [HttpPut("{id}")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> UpdateService(int id, [FromBody] UpdateServiceDto dto)
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

        var service = await _context.Services.FindAsync(id);
        if (service == null)
        {
            return NotFound("Service not found");
        }

        // Ensure the service belongs to the logged-in entrepreneur
        if (service.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        service.Name = dto.Name;
        service.Description = dto.Description;
        service.Category = dto.Category;
        service.Duration = dto.Duration;
        service.Price = dto.Price;
        service.IsActive = dto.IsActive;
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new ServiceResponseDto
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            Category = service.Category,
            Duration = service.Duration,
            Price = service.Price,
            IsActive = service.IsActive,
            CreatedAt = service.CreatedAt,
            UpdatedAt = service.UpdatedAt,
            Entrepreneur = null
        };

        return Ok(response);
    }

    // PATCH: api/service/{id}/toggle - Toggle service active status
    [HttpPatch("{id}/toggle")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> ToggleServiceStatus(int id)
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

        var service = await _context.Services.FindAsync(id);
        if (service == null)
        {
            return NotFound("Service not found");
        }

        if (service.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        service.IsActive = !service.IsActive;
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { service.Id, service.IsActive });
    }

    // DELETE: api/service/{id} - Delete a service
    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(Role.Entrepreneur))]
    public async Task<IActionResult> DeleteService(int id)
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

        var service = await _context.Services.FindAsync(id);
        if (service == null)
        {
            return NotFound("Service not found");
        }

        if (service.EntrepreneurProfileId != user.EntrepreneurProfile.Id)
        {
            return Forbid();
        }

        _context.Services.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
