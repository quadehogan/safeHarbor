using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class SupportersController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public SupportersController(SafeHarborDbContext db) => _db = db;

    // GET /api/Supporters/me — returns the current donor's supporter record by JWT email
    [HttpGet("me")]
    [Authorize(Roles = "Admin,SocialWorker,DonorPortal")]
    public async Task<ActionResult<Supporter>> GetMe(CancellationToken ct)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value
                    ?? User.FindFirst("email")?.Value;
        if (email == null) return Unauthorized();

        var supporter = await _db.Supporters
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Email == email, ct);

        if (supporter == null) return NotFound("No supporter record found for this account.");
        return Ok(supporter);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supporter>>> Get(
        [FromQuery] string? status,
        [FromQuery] string? type,
        CancellationToken ct)
    {
        var query = _db.Supporters.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(s => s.Status == status);

        if (!string.IsNullOrEmpty(type))
            query = query.Where(s => s.SupporterType == type);

        return Ok(await query.OrderByDescending(s => s.CreatedAt).ToListAsync(ct));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Supporter>> Get(int id, CancellationToken ct)
    {
        var supporter = await _db.Supporters
            .Include(s => s.Donations)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.SupporterId == id, ct);

        if (supporter is null) return NotFound();
        return Ok(supporter);
    }

    [HttpPost]
    public async Task<ActionResult<Supporter>> Post(Supporter supporter, CancellationToken ct)
    {
        var maxId = await _db.Supporters.MaxAsync(s => (int?)s.SupporterId, ct) ?? 0;
        supporter.SupporterId = maxId + 1;
        supporter.CreatedAt = DateTime.UtcNow;
        _db.Supporters.Add(supporter);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = supporter.SupporterId }, supporter);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, Supporter supporter, CancellationToken ct)
    {
        if (id != supporter.SupporterId) return BadRequest();

        var exists = await _db.Supporters.AnyAsync(s => s.SupporterId == id, ct);
        if (!exists) return NotFound();

        _db.Entry(supporter).State = EntityState.Modified;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var supporter = await _db.Supporters.FindAsync([id], ct);
        if (supporter is null) return NotFound();

        _db.Supporters.Remove(supporter);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
