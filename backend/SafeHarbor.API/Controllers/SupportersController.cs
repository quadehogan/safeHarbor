using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class SupportersController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public SupportersController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supporter>>> Get(CancellationToken ct) =>
        Ok(await _db.Supporters.AsNoTracking().ToListAsync(ct));
}
