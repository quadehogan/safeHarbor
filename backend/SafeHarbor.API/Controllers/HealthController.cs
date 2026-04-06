using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class HealthController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public HealthController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HealthWellbeingRecord>>> Get(CancellationToken ct) =>
        Ok(await _db.HealthWellbeingRecords.AsNoTracking().ToListAsync(ct));
}
