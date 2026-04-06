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
        Ok(await _db.HomeVisitations.AsNoTracking().ToListAsync(ct));
}
