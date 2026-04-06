using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class PartnersController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public PartnersController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Partner>>> Get(CancellationToken ct) =>
        Ok(await _db.Partners.AsNoTracking().ToListAsync(ct));
}
