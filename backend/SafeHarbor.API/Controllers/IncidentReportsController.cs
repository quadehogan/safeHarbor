using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class IncidentReportsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public IncidentReportsController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncidentReport>>> Get(CancellationToken ct) =>
        Ok(await _db.IncidentReports.AsNoTracking().ToListAsync(ct));
}
