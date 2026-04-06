using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class ProcessRecordingsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public ProcessRecordingsController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcessRecording>>> Get(CancellationToken ct) =>
        Ok(await _db.ProcessRecordings.AsNoTracking().ToListAsync(ct));
}
