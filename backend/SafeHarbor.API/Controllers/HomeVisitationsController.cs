using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class HomeVisitationsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public HomeVisitationsController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HomeVisitation>>> Get(CancellationToken ct) =>
        Ok(await _db.HomeVisitations.Include(h => h.Resident).AsNoTracking().ToListAsync(ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<HomeVisitation>> Get(int id, CancellationToken ct)
    {
        var v = await _db.HomeVisitations.Include(h => h.Resident).FirstOrDefaultAsync(h => h.HomeVisitationId == id, ct);
        return v is null ? NotFound() : Ok(v);
    }

    [HttpPost]
    public async Task<ActionResult<HomeVisitation>> Post(HomeVisitation body, CancellationToken ct)
    {
        var maxId = await _db.HomeVisitations.MaxAsync(h => (int?)h.HomeVisitationId, ct) ?? 0;
        body.HomeVisitationId = maxId + 1;
        _db.HomeVisitations.Add(body);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = body.HomeVisitationId }, body);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, HomeVisitation body, CancellationToken ct)
    {
        if (id != body.HomeVisitationId) return BadRequest();
        var existing = await _db.HomeVisitations.FindAsync([id], ct);
        if (existing is null) return NotFound();
        _db.Entry(existing).CurrentValues.SetValues(body);
        await _db.SaveChangesAsync(ct);
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var v = await _db.HomeVisitations.FindAsync([id], ct);
        if (v is null) return NotFound();
        _db.HomeVisitations.Remove(v);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
