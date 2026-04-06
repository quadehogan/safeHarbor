using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class InterventionPlansController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public InterventionPlansController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InterventionPlan>>> Get(CancellationToken ct) =>
        Ok(await _db.InterventionPlans.AsNoTracking().ToListAsync(ct));
}
