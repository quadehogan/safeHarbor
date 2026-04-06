using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker,DonorPortal")]
public class ImpactController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public ImpactController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PublicImpactSnapshot>>> Get(CancellationToken ct) =>
        Ok(await _db.PublicImpactSnapshots.AsNoTracking().ToListAsync(ct));
}
