using System.Security.Claims;
using System.Text.Json;
using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

// ─── DTOs ────────────────────────────────────────────────────────────────────

public record ImpactSnapshotDto(
    int SnapshotId,
    string Month,
    double AvgHealthScore,
    double AvgEducationProgress,
    int TotalResidents,
    double DonationsTotalForMonth
);

public record ProgramImpactSummaryDto(
    string ProgramArea,
    string OutcomeMetric,
    double EstimatedPctChange,
    int TimeWindowMonths,
    string SampleStatementText
);

public record DonorImpactStatementDto(
    Guid StatementId,
    string ProgramArea,
    float AllocationAmount,
    string OutcomeMetric,
    int TimeWindowMonths,
    float EstimatedPctChange,
    string StatementText,
    DateTime? GeneratedAt
);

// ─── CONTROLLER ──────────────────────────────────────────────────────────────

[ApiController]
[Route("api/[controller]")]
public class ImpactController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public ImpactController(SafeHarborDbContext db) => _db = db;

    // GET /api/Impact (legacy — returns raw snapshots)
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<PublicImpactSnapshot>>> Get(CancellationToken ct) =>
        Ok(await _db.PublicImpactSnapshots.AsNoTracking().ToListAsync(ct));

    // GET /api/Impact/snapshots — parsed, typed, filters placeholders
    [HttpGet("snapshots")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ImpactSnapshotDto>>> GetSnapshots(CancellationToken ct)
    {
        var raw = await _db.PublicImpactSnapshots
            .AsNoTracking()
            .Where(s => s.IsPublished == true && s.MetricPayloadJson != null)
            .ToListAsync(ct);

        var results = new List<ImpactSnapshotDto>();
        foreach (var snapshot in raw)
        {
            try
            {
                // Python dict syntax → valid JSON
                var json = snapshot.MetricPayloadJson!
                    .Replace("'", "\"")
                    .Replace("None", "null")
                    .Replace("True", "true")
                    .Replace("False", "false");

                var payload = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json);
                if (payload == null) continue;

                var avgHealth = payload.TryGetValue("avg_health_score", out var h) ? h.GetDouble() : 0;
                if (avgHealth == 0) continue; // skip future placeholder rows

                var month = payload.TryGetValue("month", out var m) ? m.GetString() ?? "" : "";
                var avgEdu = payload.TryGetValue("avg_education_progress", out var e) ? e.GetDouble() : 0;
                var totalResidents = payload.TryGetValue("total_residents", out var tr) ? tr.GetInt32() : 0;
                var donationsTotal = payload.TryGetValue("donations_total_for_month", out var dt) ? dt.GetDouble() : 0;

                results.Add(new ImpactSnapshotDto(
                    snapshot.PublicImpactSnapshotId, month, avgHealth, avgEdu, totalResidents, donationsTotal));
            }
            catch { /* skip unparseable */ }
        }
        return Ok(results);
    }

    // GET /api/Impact/program-summary — aggregate, no PII, public
    [HttpGet("program-summary")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ProgramImpactSummaryDto>>> GetProgramSummary(CancellationToken ct)
    {
        var statements = await _db.DonorImpactStatements.AsNoTracking().ToListAsync(ct);

        var grouped = statements
            .GroupBy(s => new { s.ProgramArea, s.OutcomeMetric, s.TimeWindowMonths })
            .Select(g => new ProgramImpactSummaryDto(
                g.Key.ProgramArea,
                g.Key.OutcomeMetric,
                Math.Round(g.Average(s => (double)s.EstimatedPctChange), 1),
                g.Key.TimeWindowMonths,
                g.First().StatementText
            ))
            .ToList();

        return Ok(grouped);
    }

    // GET /api/Impact/statements — personalized, requires DonorPortal or Admin
    [HttpGet("statements")]
    [Authorize(Roles = "Admin,DonorPortal")]
    public async Task<ActionResult<IEnumerable<DonorImpactStatementDto>>> GetStatements(CancellationToken ct)
    {
        int supporterId;

        // Admins may pass an explicit supporterId query param
        if (User.IsInRole("Admin") &&
            HttpContext.Request.Query.TryGetValue("supporterId", out var sidParam) &&
            int.TryParse(sidParam, out var adminSid))
        {
            supporterId = adminSid;
        }
        else
        {
            // Identify donor from JWT email claim
            var email = User.FindFirst(ClaimTypes.Email)?.Value
                        ?? User.FindFirst("email")?.Value;
            if (email == null) return Unauthorized();

            var supporter = await _db.Supporters
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Email == email, ct);

            if (supporter == null)
                return NotFound("No supporter record found for this account.");

            supporterId = supporter.SupporterId;
        }

        var statements = await _db.DonorImpactStatements
            .AsNoTracking()
            .Where(s => s.SupporterId == supporterId)
            .ToListAsync(ct);

        return Ok(statements.Select(s => new DonorImpactStatementDto(
            s.StatementId, s.ProgramArea, s.AllocationAmount,
            s.OutcomeMetric, s.TimeWindowMonths, s.EstimatedPctChange,
            s.StatementText, s.GeneratedAt)));
    }
}
