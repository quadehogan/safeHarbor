using System.Security.Claims;
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

        if (User.IsInRole("DonorPortal") && !User.IsInRole("Admin"))
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return Ok(Array.Empty<Donation>());

            var supporter = await _db.Supporters.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Email == email, ct);
            if (supporter is null)
                return Ok(Array.Empty<Donation>());

            query = query.Where(d => d.SupporterId == supporter.SupporterId);
        }

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
    [Authorize(Roles = "Admin,SocialWorker,DonorPortal")]
    public async Task<ActionResult<Donation>> Post(Donation donation, CancellationToken ct)
    {
        if (User.IsInRole("DonorPortal") && !User.IsInRole("Admin") && !User.IsInRole("SocialWorker"))
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value;
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email claim is missing.");

            var supporter = await _db.Supporters.AsNoTracking()
                .FirstOrDefaultAsync(s => s.Email == email, ct);
            if (supporter is null)
                return NotFound("No supporter record is linked to this account.");

            donation.SupporterId = supporter.SupporterId;
            donation.DonationDate = DateTime.UtcNow;
        }

        var maxId = await _db.Donations.MaxAsync(d => (int?)d.DonationId, ct) ?? 0;
        donation.DonationId = maxId + 1;
        if (donation.DonationDate.Kind == DateTimeKind.Unspecified)
            donation.DonationDate = DateTime.SpecifyKind(donation.DonationDate, DateTimeKind.Utc);
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

        if (donation.DonationDate.Kind == DateTimeKind.Unspecified)
            donation.DonationDate = DateTime.SpecifyKind(donation.DonationDate, DateTimeKind.Utc);
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
