using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace SafeHarbor.API.Data;

public class SafeHarborDbContext : IdentityDbContext<IdentityUser, IdentityRole, string>
{
    public SafeHarborDbContext(DbContextOptions<SafeHarborDbContext> options)
        : base(options)
    {
    }

    public DbSet<Resident> Residents => Set<Resident>();
    public DbSet<Safehouse> Safehouses => Set<Safehouse>();
    public DbSet<InterventionPlan> InterventionPlans => Set<InterventionPlan>();
    public DbSet<ProcessRecording> ProcessRecordings => Set<ProcessRecording>();
    public DbSet<HomeVisitation> HomeVisitations => Set<HomeVisitation>();
    public DbSet<IncidentReport> IncidentReports => Set<IncidentReport>();
    public DbSet<EducationRecord> EducationRecords => Set<EducationRecord>();
    public DbSet<HealthWellbeingRecord> HealthWellbeingRecords => Set<HealthWellbeingRecord>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<DonationAllocation> DonationAllocations => Set<DonationAllocation>();
    public DbSet<InKindDonationItem> InKindDonationItems => Set<InKindDonationItem>();
    public DbSet<Supporter> Supporters => Set<Supporter>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<PartnerAssignment> PartnerAssignments => Set<PartnerAssignment>();
    public DbSet<SafehouseMonthlyMetric> SafehouseMonthlyMetrics => Set<SafehouseMonthlyMetric>();
    public DbSet<PublicImpactSnapshot> PublicImpactSnapshots => Set<PublicImpactSnapshot>();
    public DbSet<SocialMediaPost> SocialMediaPosts => Set<SocialMediaPost>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Resident>().ToTable("residents");
        modelBuilder.Entity<Safehouse>().ToTable("safehouses");
        modelBuilder.Entity<InterventionPlan>().ToTable("intervention_plans");
        modelBuilder.Entity<ProcessRecording>().ToTable("process_recordings");
        modelBuilder.Entity<HomeVisitation>().ToTable("home_visitations");
        modelBuilder.Entity<IncidentReport>().ToTable("incident_reports");
        modelBuilder.Entity<EducationRecord>().ToTable("education_records");
        modelBuilder.Entity<HealthWellbeingRecord>().ToTable("health_wellbeing_records");
        modelBuilder.Entity<Donation>().ToTable("donations");
        modelBuilder.Entity<DonationAllocation>().ToTable("donation_allocations");
        modelBuilder.Entity<InKindDonationItem>().ToTable("in_kind_donation_items");
        modelBuilder.Entity<Supporter>().ToTable("supporters");
        modelBuilder.Entity<Partner>().ToTable("partners");
        modelBuilder.Entity<PartnerAssignment>().ToTable("partner_assignments");
        modelBuilder.Entity<SafehouseMonthlyMetric>().ToTable("safehouse_monthly_metrics");
        modelBuilder.Entity<PublicImpactSnapshot>().ToTable("public_impact_snapshots");
        modelBuilder.Entity<SocialMediaPost>().ToTable("social_media_posts");
    }
}
