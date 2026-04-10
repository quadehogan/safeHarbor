using System.Security.Claims;
using System.Text.Json;
using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

// ─── DTOs ────────────────────────────────────────────────────────────────────

public record AARSummaryDto(
    int Year,
    int CaringCount,
    int HealingCount,
    int TeachingCount,
    int TotalBeneficiaries,
    int ReintegratedCount
);

public record SafehouseMetricRowDto(
    int SafehouseId,
    string SafehouseCode,
    string Name,
    string Region,
    string City,
    int Capacity,
    int CurrentOccupancy,
    double? AvgHealthScore,
    double? AvgEducationProgress,
    int TotalIncidents,
    int TotalProcessRecordings,
    int TotalHomeVisitations,
    int ReintegrationsYtd
);

public record ResidentRiskSummaryDto(
    int HighRisk,
    int MediumRisk,
    int LowRisk,
    int ReadyForReintegration,
    int ReintegrationInProgress,
    int NotReadyForReintegration,
    IEnumerable<string> TopConcernFactors,
    IEnumerable<string> TopStrengthFactors,
    DateTime? LastScoredAt
);

public record DonorChurnSummaryDto(
    int HighChurn,
    int MediumChurn,
    int LowChurn,
    int TotalScored,
    IEnumerable<string> TopChurnFactors,
    DateTime? LastScoredAt,
    IEnumerable<AtRiskDonorDto> AtRiskDonors
);

public record AtRiskDonorDto(
    int SupporterId,
    string DisplayName,
    string SupporterType,
    double ChurnProbability,
    string RiskTier,
    IEnumerable<string> TopRiskFactors
);

// ─── CONTROLLER ──────────────────────────────────────────────────────────────

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class ReportsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public ReportsController(SafeHarborDbContext db) => _db = db;

    // GET /api/Reports/aar-summary?year=2025
    [HttpGet("aar-summary")]
    public async Task<ActionResult<AARSummaryDto>> GetAARSummary(
        [FromQuery] int year, CancellationToken ct)
    {
        var plans = await _db.InterventionPlans
            .AsNoTracking()
            .Where(p => p.ServicesProvided != null)
            .Select(p => new { p.ResidentId, p.ServicesProvided })
            .ToListAsync(ct);

        var caringCount = plans
            .Where(p => p.ServicesProvided!.Contains("Caring"))
            .Select(p => p.ResidentId)
            .Distinct()
            .Count();

        var healingCount = plans
            .Where(p => p.ServicesProvided!.Contains("Healing"))
            .Select(p => p.ResidentId)
            .Distinct()
            .Count();

        var teachingCount = plans
            .Where(p => p.ServicesProvided!.Contains("Teaching"))
            .Select(p => p.ResidentId)
            .Distinct()
            .Count();

        var totalBeneficiaries = await _db.Residents
            .AsNoTracking()
            .Where(r => r.CaseStatus == "Active" ||
                        (r.DateClosed.HasValue && r.DateClosed.Value.Year == year))
            .CountAsync(ct);

        var reintegratedCount = await _db.Residents
            .AsNoTracking()
            .Where(r => r.DateClosed.HasValue &&
                        r.DateClosed.Value.Year == year &&
                        r.ReintegrationStatus == "Completed")
            .CountAsync(ct);

        return Ok(new AARSummaryDto(year, caringCount, healingCount, teachingCount,
            totalBeneficiaries, reintegratedCount));
    }

    // GET /api/Reports/safehouse-metrics?year=2025
    [HttpGet("safehouse-metrics")]
    public async Task<ActionResult<IEnumerable<SafehouseMetricRowDto>>> GetSafehouseMetrics(
        [FromQuery] int year, CancellationToken ct)
    {
        var safehouses = await _db.Safehouses.AsNoTracking().ToListAsync(ct);

        var metrics = await _db.SafehouseMonthlyMetrics
            .AsNoTracking()
            .Where(m => m.MonthStart.HasValue && m.MonthStart.Value.Year == year)
            .ToListAsync(ct);

        var reintegrationMap = (await _db.Residents
            .AsNoTracking()
            .Where(r => r.DateClosed.HasValue &&
                        r.DateClosed.Value.Year == year &&
                        r.ReintegrationStatus == "Completed" &&
                        r.SafehouseId.HasValue)
            .GroupBy(r => r.SafehouseId!.Value)
            .Select(g => new { SafehouseId = g.Key, Count = g.Count() })
            .ToListAsync(ct))
            .ToDictionary(r => r.SafehouseId, r => r.Count);

        var rows = safehouses.Select(s =>
        {
            var sfMetrics = metrics.Where(m => m.SafehouseId == s.SafehouseId).ToList();

            double? avgHealth = sfMetrics.Any(m => m.AvgHealthScore.HasValue && m.AvgHealthScore > 0)
                ? sfMetrics.Where(m => m.AvgHealthScore.HasValue && m.AvgHealthScore > 0)
                    .Average(m => (double)m.AvgHealthScore!.Value)
                : null;

            double? avgEdu = sfMetrics.Any(m => m.AvgEducationProgress.HasValue && m.AvgEducationProgress > 0)
                ? sfMetrics.Where(m => m.AvgEducationProgress.HasValue && m.AvgEducationProgress > 0)
                    .Average(m => (double)m.AvgEducationProgress!.Value)
                : null;

            return new SafehouseMetricRowDto(
                s.SafehouseId,
                s.SafehouseCode ?? "",
                s.Name ?? "",
                s.Region ?? "",
                s.City ?? "",
                s.CapacityGirls ?? 0,
                s.CurrentOccupancy ?? 0,
                avgHealth.HasValue ? Math.Round(avgHealth.Value, 2) : null,
                avgEdu.HasValue ? Math.Round(avgEdu.Value, 1) : null,
                sfMetrics.Sum(m => m.IncidentCount ?? 0),
                sfMetrics.Sum(m => m.ProcessRecordingCount ?? 0),
                sfMetrics.Sum(m => m.HomeVisitationCount ?? 0),
                reintegrationMap.GetValueOrDefault(s.SafehouseId, 0)
            );
        }).ToList();

        return Ok(rows);
    }

    // GET /api/Reports/resident-risk-summary
    [HttpGet("resident-risk-summary")]
    public async Task<ActionResult<ResidentRiskSummaryDto>> GetResidentRiskSummary(CancellationToken ct)
    {
        var scores = await _db.ResidentRiskScores.AsNoTracking().ToListAsync(ct);

        if (scores.Count == 0)
            return Ok(new ResidentRiskSummaryDto(0, 0, 0, 0, 0, 0, [], [], null));

        return Ok(new ResidentRiskSummaryDto(
            scores.Count(s => s.RegressionRiskTier == "high"),
            scores.Count(s => s.RegressionRiskTier == "medium"),
            scores.Count(s => s.RegressionRiskTier == "low"),
            scores.Count(s => s.ReintegrationTier == "ready"),
            scores.Count(s => s.ReintegrationTier == "in_progress"),
            scores.Count(s => s.ReintegrationTier == "not_ready"),
            ParseAndRankFactors(scores.Select(s => s.TopConcernFactors), 10),
            ParseAndRankFactors(scores.Select(s => s.TopStrengthFactors), 10),
            scores.Max(s => s.ScoredAt)
        ));
    }

    // GET /api/Reports/donor-churn-summary (Admin only)
    [HttpGet("donor-churn-summary")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DonorChurnSummaryDto>> GetDonorChurnSummary(CancellationToken ct)
    {
        var scores = await _db.DonorChurnScores.AsNoTracking().ToListAsync(ct);

        if (scores.Count == 0)
            return Ok(new DonorChurnSummaryDto(0, 0, 0, 0, [], null, []));

        // Build at-risk donor list (high + medium) joined with supporter names
        var atRiskScores = scores
            .Where(s => s.ChurnTier == "high" || s.ChurnTier == "medium")
            .OrderByDescending(s => s.ChurnScore)
            .ToList();

        var atRiskIds = atRiskScores.Select(s => s.SupporterId).ToHashSet();
        var supporters = await _db.Supporters
            .AsNoTracking()
            .Where(s => atRiskIds.Contains(s.SupporterId))
            .ToDictionaryAsync(s => s.SupporterId, ct);

        var atRiskDonors = atRiskScores.Select(s =>
        {
            var name = supporters.TryGetValue(s.SupporterId, out var sup)
                ? (sup.DisplayName ?? sup.OrganizationName ?? $"{sup.FirstName} {sup.LastName}")
                : $"Supporter #{s.SupporterId}";
            var type = supporters.TryGetValue(s.SupporterId, out var sup2)
                ? sup2.SupporterType : "";
            var factors = new List<string>();
            if (!string.IsNullOrWhiteSpace(s.TopChurnFactors))
            {
                try { factors = JsonSerializer.Deserialize<List<string>>(s.TopChurnFactors) ?? []; }
                catch { /* skip */ }
            }
            return new AtRiskDonorDto(s.SupporterId, name, type,
                Math.Round(s.ChurnScore, 2), s.ChurnTier, factors);
        }).ToList();

        return Ok(new DonorChurnSummaryDto(
            scores.Count(s => s.ChurnTier == "high"),
            scores.Count(s => s.ChurnTier == "medium"),
            scores.Count(s => s.ChurnTier == "low"),
            scores.Count,
            ParseAndRankFactors(scores.Select(s => s.TopChurnFactors), 10),
            scores.Max(s => s.ScoredAt),
            atRiskDonors
        ));
    }

    // GET /api/Reports/at-risk-donors
    [HttpGet("at-risk-donors")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AtRiskDonorDto>>> GetAtRiskDonors(CancellationToken ct)
    {
        // Join churn scores with supporters, return high and medium risk sorted by probability desc
        var atRisk = await _db.DonorChurnScores
            .AsNoTracking()
            .Where(s => s.ChurnTier == "high" || s.ChurnTier == "medium")
            .Join(
                _db.Supporters.AsNoTracking(),
                score => score.SupporterId,
                supporter => supporter.SupporterId,
                (score, supporter) => new { score, supporter })
            .OrderByDescending(x => x.score.ChurnScore)
            .Select(x => new AtRiskDonorDto(
                x.supporter.SupporterId,
                x.supporter.DisplayName ?? x.supporter.OrganizationName ?? $"{x.supporter.FirstName} {x.supporter.LastName}",
                x.supporter.SupporterType,
                Math.Round(x.score.ChurnScore, 2),
                x.score.ChurnTier,
                new List<string>() // EF can't parse JSON inline, we'll fill below
            ))
            .ToListAsync(ct);

        // Now fill in the risk factors from the raw scores
        var supporterIds = atRisk.Select(a => a.SupporterId).ToHashSet();
        var rawScores = await _db.DonorChurnScores
            .AsNoTracking()
            .Where(s => supporterIds.Contains(s.SupporterId))
            .ToDictionaryAsync(s => s.SupporterId, ct);

        var result = atRisk.Select(a =>
        {
            var factors = new List<string>();
            if (rawScores.TryGetValue(a.SupporterId, out var raw) && !string.IsNullOrWhiteSpace(raw.TopChurnFactors))
            {
                try { factors = JsonSerializer.Deserialize<List<string>>(raw.TopChurnFactors) ?? []; }
                catch { /* skip malformed */ }
            }
            return a with { TopRiskFactors = factors };
        }).ToList();

        return Ok(result);
    }

    private static IEnumerable<string> ParseAndRankFactors(IEnumerable<string?> jsonStrings, int topN)
    {
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var json in jsonStrings)
        {
            if (string.IsNullOrWhiteSpace(json)) continue;
            try
            {
                var factors = JsonSerializer.Deserialize<string[]>(json) ?? [];
                foreach (var f in factors.Where(f => !string.IsNullOrWhiteSpace(f)))
                    counts[f] = counts.GetValueOrDefault(f, 0) + 1;
            }
            catch { /* skip malformed */ }
        }
        return counts.OrderByDescending(kv => kv.Value).Take(topN).Select(kv => kv.Key);
    }
}
