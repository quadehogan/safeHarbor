using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class EducationController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public EducationController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EducationRecord>>> Get(CancellationToken ct) =>
        Ok(await _db.EducationRecords.AsNoTracking().ToListAsync(ct));
}
