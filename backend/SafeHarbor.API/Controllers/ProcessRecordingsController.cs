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

    // GET /api/ProcessRecordings  or  GET /api/ProcessRecordings?residentId=5
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProcessRecording>>> Get(
        [FromQuery] int? residentId, CancellationToken ct)
    {
        var query = _db.ProcessRecordings.AsNoTracking().AsQueryable();
        if (residentId.HasValue)
            query = query.Where(r => r.ResidentId == residentId.Value);
        return Ok(await query.OrderByDescending(r => r.SessionDate).ToListAsync(ct));
    }

    // GET /api/ProcessRecordings/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProcessRecording>> GetById(int id, CancellationToken ct)
    {
        var record = await _db.ProcessRecordings.AsNoTracking()
            .FirstOrDefaultAsync(r => r.ProcessRecordingId == id, ct);
        if (record is null) return NotFound();
        return Ok(record);
    }

    // POST /api/ProcessRecordings
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProcessRecording>> Create(
        [FromBody] ProcessRecording recording, CancellationToken ct)
    {
        var maxId = await _db.ProcessRecordings.MaxAsync(r => (int?)r.ProcessRecordingId, ct) ?? 0;
        recording.ProcessRecordingId = maxId + 1;
        _db.ProcessRecordings.Add(recording);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetById), new { id = recording.ProcessRecordingId }, recording);
    }

    // PUT /api/ProcessRecordings/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProcessRecording>> Update(
        int id, [FromBody] ProcessRecording recording, CancellationToken ct)
    {
        if (id != recording.ProcessRecordingId) return BadRequest("ID mismatch.");

        var existing = await _db.ProcessRecordings.FindAsync([id], ct);
        if (existing is null) return NotFound();

        _db.Entry(existing).CurrentValues.SetValues(recording);
        await _db.SaveChangesAsync(ct);
        return Ok(existing);
    }

    // DELETE /api/ProcessRecordings/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var record = await _db.ProcessRecordings.FindAsync([id], ct);
        if (record is null) return NotFound();

        _db.ProcessRecordings.Remove(record);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
