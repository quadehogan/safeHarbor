using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class SocialMediaController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public SocialMediaController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SocialMediaPost>>> Get(CancellationToken ct) =>
        Ok(await _db.SocialMediaPosts.AsNoTracking().ToListAsync(ct));
}
