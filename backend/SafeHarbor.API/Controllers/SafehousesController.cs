using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

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
}
