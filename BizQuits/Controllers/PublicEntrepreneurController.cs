using BizQuits.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizQuits.Controllers;

[ApiController]
[Route("api/public/entrepreneurs")]
public class PublicEntrepreneurController : ControllerBase
{
    private readonly AppDbContext _context;

    public PublicEntrepreneurController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/public/entrepreneurs/{entrepreneurProfileId}
    [HttpGet("{entrepreneurProfileId:int}")]
    public async Task<IActionResult> GetPublicProfile(int entrepreneurProfileId)
    {
        // ✅ Only approved entrepreneurs are public
        var ep = await _context.EntrepreneurProfiles
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == entrepreneurProfileId && x.IsApproved);

        if (ep == null)
            return NotFound("Entrepreneur profile not found or not approved");

        // ✅ Services (active)
        var services = await _context.Services
            .Where(s => s.EntrepreneurProfileId == entrepreneurProfileId && s.IsActive)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Category,
                s.Price,
                s.Duration
            })
            .ToListAsync();

        var serviceIds = services.Select(s => s.Id).ToList();

        // ✅ Approved reviews for those services + include client + more service info
        var reviews = await _context.Reviews
            .Include(r => r.Client)
            .Include(r => r.Service)
            .Where(r => r.IsApproved && serviceIds.Contains(r.ServiceId))
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,

                // who
                ClientEmail = r.Client != null ? r.Client.Email : null,

                // job/service reference
                Service = new
                {
                    r.ServiceId,
                    ServiceName = r.Service != null ? r.Service.Name : null,
                    Category = r.Service != null ? r.Service.Category : null,
                    Price = r.Service != null ? r.Service.Price : 0,
                    Duration = r.Service != null ? r.Service.Duration : null
                }
            })
            .ToListAsync();

        // ✅ Average rating per service
        var avgByService = reviews
            .GroupBy(r => new { r.Service.ServiceId, r.Service.ServiceName })
            .Select(g => new
            {
                ServiceId = g.Key.ServiceId,
                ServiceName = g.Key.ServiceName,
                average = g.Average(x => x.Rating),
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToList();

        // ✅ Company overall avg
        var companyAvg = reviews.Count == 0 ? 0 : reviews.Average(r => r.Rating);

        return Ok(new
        {
            entrepreneurProfile = new
            {
                ep.Id,
                ep.CompanyName,
                ep.CUI,
                Email = ep.User.Email
            },

            companyRating = new
            {
                average = companyAvg,
                count = reviews.Count
            },

            services,

            ratingsByService = avgByService,

            reviews
        });
    }
}
