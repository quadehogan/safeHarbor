using SafeHarbor.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DonationsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;

    public DonationsController(SafeHarborDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,SocialWorker,DonorPortal")]
    public async Task<ActionResult<IEnumerable<Donation>>> Get(
        [FromQuery] string? type,
        [FromQuery] string? campaign,
        [FromQuery] string? channel,
        CancellationToken ct)
    {
        var query = _db.Donations
            .Include(d => d.Supporter)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrEmpty(type))
            query = query.Where(d => d.DonationType == type);

        if (!string.IsNullOrEmpty(campaign))
            query = query.Where(d => d.CampaignName == campaign);

        if (!string.IsNullOrEmpty(channel))
            query = query.Where(d => d.ChannelSource == channel);

        return Ok(await query.OrderByDescending(d => d.DonationDate).ToListAsync(ct));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,SocialWorker,DonorPortal")]
    public async Task<ActionResult<Donation>> Get(int id, CancellationToken ct)
    {
        var donation = await _db.Donations
            .Include(d => d.Supporter)
            .Include(d => d.DonationAllocations)
            .Include(d => d.InKindDonationItems)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.DonationId == id, ct);

        if (donation is null) return NotFound();
        return Ok(donation);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SocialWorker")]
    public async Task<ActionResult<Donation>> Post(Donation donation, CancellationToken ct)
    {
        _db.Donations.Add(donation);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = donation.DonationId }, donation);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SocialWorker")]
    public async Task<IActionResult> Put(int id, Donation donation, CancellationToken ct)
    {
        if (id != donation.DonationId) return BadRequest();

        var exists = await _db.Donations.AnyAsync(d => d.DonationId == id, ct);
        if (!exists) return NotFound();

        _db.Entry(donation).State = EntityState.Modified;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SocialWorker")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var donation = await _db.Donations.FindAsync([id], ct);
        if (donation is null) return NotFound();

        _db.Donations.Remove(donation);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
