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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Resident>>> Get(CancellationToken ct) =>
        Ok(await _db.Residents.AsNoTracking().ToListAsync(ct));
}
