using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

// ── DTOs ────────────────────────────────────────────────────────
public record ResidentSummaryDto(
    int ResidentId,
    string? InternalCode,
    string? CaseStatus,
    string? CurrentRiskLevel,
    string? PresentAge,
    string? AssignedSocialWorker);

public record IncidentReportDto(
    int IncidentReportId,
    int? ResidentId,
    int? SafehouseId,
    DateOnly? IncidentDate,
    string? IncidentType,
    string? Severity,
    string? Description,
    string? ResponseTaken,
    bool? Resolved,
    DateOnly? ResolutionDate,
    string? ReportedBy,
    bool? FollowUpRequired);

public record SafehouseMetricDto(
    int SafehouseMonthlyMetricId,
    int? SafehouseId,
    DateOnly? MonthStart,
    DateOnly? MonthEnd,
    int? ActiveResidents,
    decimal? AvgEducationProgress,
    decimal? AvgHealthScore,
    int? ProcessRecordingCount,
    int? HomeVisitationCount,
    int? IncidentCount,
    string? Notes);

public record SafehouseDetailDto(
    int SafehouseId,
    string? SafehouseCode,
    string? Name,
    string? Region,
    string? City,
    string? Province,
    string? Country,
    DateOnly? OpenDate,
    string? Status,
    int? CapacityGirls,
    int? CapacityStaff,
    int? CurrentOccupancy,
    string? Notes,
    ResidentSummaryDto[] Residents,
    IncidentReportDto[] RecentIncidents,
    SafehouseMetricDto[] MonthlyMetrics);

// ── Controller ──────────────────────────────────────────────────
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class SafehousesController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public SafehousesController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Safehouse>>> Get(CancellationToken ct) =>
        Ok(await _db.Safehouses.AsNoTracking().ToListAsync(ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<SafehouseDetailDto>> Get(int id, CancellationToken ct)
    {
        var sh = await _db.Safehouses.AsNoTracking()
            .FirstOrDefaultAsync(s => s.SafehouseId == id, ct);

        if (sh is null) return NotFound();

        var residents = await _db.Residents
            .Where(r => r.SafehouseId == id)
            .AsNoTracking()
            .Select(r => new ResidentSummaryDto(
                r.ResidentId,
                r.InternalCode,
                r.CaseStatus,
                r.CurrentRiskLevel,
                r.PresentAge,
                r.AssignedSocialWorker))
            .ToListAsync(ct);

        var incidents = await _db.IncidentReports
            .Where(i => i.SafehouseId == id)
            .OrderByDescending(i => i.IncidentDate)
            .Take(10)
            .AsNoTracking()
            .Select(i => new IncidentReportDto(
                i.IncidentReportId,
                i.ResidentId,
                i.SafehouseId,
                i.IncidentDate,
                i.IncidentType,
                i.Severity,
                i.Description,
                i.ResponseTaken,
                i.Resolved,
                i.ResolutionDate,
                i.ReportedBy,
                i.FollowUpRequired))
            .ToListAsync(ct);

        var metrics = await _db.SafehouseMonthlyMetrics
            .Where(m => m.SafehouseId == id)
            .OrderByDescending(m => m.MonthStart)
            .AsNoTracking()
            .Select(m => new SafehouseMetricDto(
                m.SafehouseMonthlyMetricId,
                m.SafehouseId,
                m.MonthStart,
                m.MonthEnd,
                m.ActiveResidents,
                m.AvgEducationProgress,
                m.AvgHealthScore,
                m.ProcessRecordingCount,
                m.HomeVisitationCount,
                m.IncidentCount,
                m.Notes))
            .ToListAsync(ct);

        return Ok(new SafehouseDetailDto(
            sh.SafehouseId,
            sh.SafehouseCode,
            sh.Name,
            sh.Region,
            sh.City,
            sh.Province,
            sh.Country,
            sh.OpenDate,
            sh.Status,
            sh.CapacityGirls,
            sh.CapacityStaff,
            sh.CurrentOccupancy,
            sh.Notes,
            residents.ToArray(),
            incidents.ToArray(),
            metrics.ToArray()));
    }
}
