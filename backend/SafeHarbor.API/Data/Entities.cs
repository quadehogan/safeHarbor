using System.ComponentModel.DataAnnotations;

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
    public int DonationId { get; set; }
}

public class DonationAllocation
{
    [Key]
    public int DonationAllocationId { get; set; }
}

public class InKindDonationItem
{
    [Key]
    public int InKindDonationItemId { get; set; }
}

public class Supporter
{
    [Key]
    public int SupporterId { get; set; }
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
