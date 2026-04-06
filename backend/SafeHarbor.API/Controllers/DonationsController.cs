using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class DonationsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public DonationsController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Donation>>> Get(CancellationToken ct) =>
        Ok(await _db.Donations.AsNoTracking().ToListAsync(ct));
}
