using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafeHarbor.API.Data;

public class Resident
{
    [Key]
    public int ResidentId { get; set; }
}

public class Safehouse
{
    [Key]
    public int SafehouseId { get; set; }
}

public class InterventionPlan
{
    [Key]
    public int InterventionPlanId { get; set; }
}

public class ProcessRecording
{
    [Key]
    public int ProcessRecordingId { get; set; }
}

public class HomeVisitation
{
    [Key]
    public int HomeVisitationId { get; set; }
}

public class IncidentReport
{
    [Key]
    public int IncidentReportId { get; set; }
}

public class EducationRecord
{
    [Key]
    public int EducationRecordId { get; set; }
}

public class HealthWellbeingRecord
{
    [Key]
    public int HealthWellbeingRecordId { get; set; }
}

public class Donation
{
    [Key]
    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("donation_type")]
    public string DonationType { get; set; } = string.Empty;

    [Column("donation_date")]
    public DateTime DonationDate { get; set; }

    [Column("is_recurring")]
    public bool IsRecurring { get; set; }

    [Column("campaign_name")]
    public string? CampaignName { get; set; }

    [Column("channel_source")]
    public string? ChannelSource { get; set; }

    [Column("currency_code")]
    public string CurrencyCode { get; set; } = "PHP";

    [Column("amount")]
    public decimal? Amount { get; set; }

    [Column("estimated_value")]
    public decimal? EstimatedValue { get; set; }

    [Column("impact_unit")]
    public string? ImpactUnit { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [Column("referral_post_id")]
    public int? ReferralPostId { get; set; }

    [ForeignKey(nameof(SupporterId))]
    public Supporter? Supporter { get; set; }

    public ICollection<DonationAllocation> DonationAllocations { get; set; } = [];
    public ICollection<InKindDonationItem> InKindDonationItems { get; set; } = [];
}

public class DonationAllocation
{
    [Key]
    [Column("allocation_id")]
    public int DonationAllocationId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("safehouse_id")]
    public int? SafehouseId { get; set; }

    [Column("program_area")]
    public string? ProgramArea { get; set; }

    [Column("amount_allocated")]
    public decimal AmountAllocated { get; set; }

    [Column("allocation_date")]
    public DateTime? AllocationDate { get; set; }

    [Column("allocation_notes")]
    public string? AllocationNotes { get; set; }

    [ForeignKey(nameof(DonationId))]
    public Donation? Donation { get; set; }
}

public class InKindDonationItem
{
    [Key]
    [Column("in_kind_donation_item_id")]
    public int InKindDonationItemId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("item_description")]
    public string? ItemDescription { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("estimated_unit_value")]
    public decimal? EstimatedUnitValue { get; set; }

    [Column("category")]
    public string? Category { get; set; }

    [ForeignKey(nameof(DonationId))]
    public Donation? Donation { get; set; }
}

public class Supporter
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("supporter_type")]
    public string SupporterType { get; set; } = string.Empty;

    [Column("display_name")]
    public string? DisplayName { get; set; }

    [Column("organization_name")]
    public string? OrganizationName { get; set; }

    [Column("first_name")]
    public string? FirstName { get; set; }

    [Column("last_name")]
    public string? LastName { get; set; }

    [Column("relationship_type")]
    public string? RelationshipType { get; set; }

    [Column("region")]
    public string? Region { get; set; }

    [Column("country")]
    public string? Country { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Active";

    [Column("first_donation_date")]
    public DateTime? FirstDonationDate { get; set; }

    [Column("acquisition_channel")]
    public string? AcquisitionChannel { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    public ICollection<Donation> Donations { get; set; } = [];
}

public class Partner
{
    [Key]
    public int PartnerId { get; set; }
}

public class PartnerAssignment
{
    [Key]
    public int PartnerAssignmentId { get; set; }
}

public class SafehouseMonthlyMetric
{
    [Key]
    public int SafehouseMonthlyMetricId { get; set; }
}

public class PublicImpactSnapshot
{
    [Key]
    public int PublicImpactSnapshotId { get; set; }
}

public class SocialMediaPost
{
    [Key]
    public int SocialMediaPostId { get; set; }
}
