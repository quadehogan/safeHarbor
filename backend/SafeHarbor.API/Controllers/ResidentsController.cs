using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class ResidentsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public ResidentsController(SafeHarborDbContext db) => _db = db;

    // GET /api/Residents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Resident>>> Get(CancellationToken ct) =>
        Ok(await _db.Residents.AsNoTracking().ToListAsync(ct));

    // GET /api/Residents/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Resident>> GetById(int id, CancellationToken ct)
    {
        var resident = await _db.Residents.AsNoTracking().FirstOrDefaultAsync(r => r.ResidentId == id, ct);
        if (resident is null) return NotFound();
        return Ok(resident);
    }

    // POST /api/Residents
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Resident>> Create([FromBody] Resident resident, CancellationToken ct)
    {
        var maxId = await _db.Residents.MaxAsync(r => (int?)r.ResidentId, ct) ?? 0;
        resident.ResidentId = maxId + 1;
        _db.Residents.Add(resident);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = resident.ResidentId }, resident);
    }

    // PUT /api/Residents/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Resident>> Update(int id, [FromBody] Resident resident, CancellationToken ct)
    {
        if (id != resident.ResidentId) return BadRequest("ID mismatch.");

        var existing = await _db.Residents.FindAsync([id], ct);
        if (existing is null) return NotFound();

        _db.Entry(existing).CurrentValues.SetValues(resident);
        await _db.SaveChangesAsync(ct);
        return Ok(existing);
    }

    // DELETE /api/Residents/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var resident = await _db.Residents.FindAsync([id], ct);
        if (resident is null) return NotFound();

        _db.Residents.Remove(resident);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // GET /api/Residents/{id}/recommendation
    [HttpGet("{id}/recommendation")]
    public async Task<ActionResult<InterventionRecommendationDto>> GetRecommendation(int id, CancellationToken ct)
    {
        var rec = await _db.InterventionRecommendations
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.ResidentId == id, ct);

        if (rec is null) return NotFound();

        var services = ParseJsonArray(rec.RecommendedServices);
        var factors = ParseJsonArray(rec.TopOutcomeFactors);

        return Ok(new InterventionRecommendationDto(
            rec.ProfileCluster,
            services,
            rec.RecommendedSessionType,
            rec.RecommendedSessionsPerMonth,
            rec.RecommendedSocialWorker,
            rec.SwOutcomeScore,
            rec.PredictedHealthImprovement,
            rec.PredictedEducationImprovement,
            rec.SimilarResidentCount,
            rec.ConfidenceTier,
            factors,
            rec.ScoredAt
        ));
    }

    private static IEnumerable<string> ParseJsonArray(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<string[]>(json) ?? [];
        }
        catch { return []; }
    }
}

public record InterventionRecommendationDto(
    string? ProfileCluster,
    IEnumerable<string> RecommendedServices,
    string? RecommendedSessionType,
    int? RecommendedSessionsPerMonth,
    string? RecommendedSocialWorker,
    float? SwOutcomeScore,
    float? PredictedHealthImprovement,
    float? PredictedEducationImprovement,
    int? SimilarResidentCount,
    string? ConfidenceTier,
    IEnumerable<string> TopOutcomeFactors,
    DateTime? ScoredAt
);
