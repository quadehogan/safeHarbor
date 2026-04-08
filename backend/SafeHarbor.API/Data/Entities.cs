using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SafeHarbor.API.Data;

// ─── RESIDENT ────────────────────────────────────────────────────────────────

public class Resident
{
    [Key]
    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("case_control_no")]
    public string? CaseControlNo { get; set; }

    [Column("internal_code")]
    public string? InternalCode { get; set; }

    [Column("safehouse_id")]
    public int? SafehouseId { get; set; }

    [Column("case_status")]
    public string? CaseStatus { get; set; }

    [Column("sex")]
    public string? Sex { get; set; }

    [Column("date_of_birth")]
    public DateOnly? DateOfBirth { get; set; }

    [Column("birth_status")]
    public string? BirthStatus { get; set; }

    [Column("place_of_birth")]
    public string? PlaceOfBirth { get; set; }

    [Column("religion")]
    public string? Religion { get; set; }

    [Column("case_category")]
    public string? CaseCategory { get; set; }

    [Column("sub_cat_orphaned")]
    public bool? SubCatOrphaned { get; set; }

    [Column("sub_cat_trafficked")]
    public bool? SubCatTrafficked { get; set; }

    [Column("sub_cat_child_labor")]
    public bool? SubCatChildLabor { get; set; }

    [Column("sub_cat_physical_abuse")]
    public bool? SubCatPhysicalAbuse { get; set; }

    [Column("sub_cat_sexual_abuse")]
    public bool? SubCatSexualAbuse { get; set; }

    [Column("sub_cat_osaec")]
    public bool? SubCatOsaec { get; set; }

    [Column("sub_cat_cicl")]
    public bool? SubCatCicl { get; set; }

    [Column("sub_cat_at_risk")]
    public bool? SubCatAtRisk { get; set; }

    [Column("sub_cat_street_child")]
    public bool? SubCatStreetChild { get; set; }

    [Column("sub_cat_child_with_hiv")]
    public bool? SubCatChildWithHiv { get; set; }

    [Column("is_pwd")]
    public bool? IsPwd { get; set; }

    [Column("pwd_type")]
    public string? PwdType { get; set; }

    [Column("has_special_needs")]
    public bool? HasSpecialNeeds { get; set; }

    [Column("special_needs_diagnosis")]
    public string? SpecialNeedsDiagnosis { get; set; }

    [Column("family_is_4ps")]
    public bool? FamilyIs4Ps { get; set; }

    [Column("family_solo_parent")]
    public bool? FamilySoloParent { get; set; }

    [Column("family_indigenous")]
    public bool? FamilyIndigenous { get; set; }

    [Column("family_parent_pwd")]
    public bool? FamilyParentPwd { get; set; }

    [Column("family_informal_settler")]
    public bool? FamilyInformalSettler { get; set; }

    [Column("date_of_admission")]
    public DateOnly? DateOfAdmission { get; set; }

    [Column("age_upon_admission")]
    public string? AgeUponAdmission { get; set; }

    [Column("present_age")]
    public string? PresentAge { get; set; }

    [Column("length_of_stay")]
    public string? LengthOfStay { get; set; }

    [Column("referral_source")]
    public string? ReferralSource { get; set; }

    [Column("referring_agency_person")]
    public string? ReferringAgencyPerson { get; set; }

    [Column("date_colb_registered")]
    public DateOnly? DateColbRegistered { get; set; }

    [Column("date_colb_obtained")]
    public DateOnly? DateColbObtained { get; set; }

    [Column("assigned_social_worker")]
    public string? AssignedSocialWorker { get; set; }

    [Column("initial_case_assessment")]
    public string? InitialCaseAssessment { get; set; }

    [Column("date_case_study_prepared")]
    public DateOnly? DateCaseStudyPrepared { get; set; }

    [Column("reintegration_type")]
    public string? ReintegrationType { get; set; }

    [Column("reintegration_status")]
    public string? ReintegrationStatus { get; set; }

    [Column("initial_risk_level")]
    public string? InitialRiskLevel { get; set; }

    [Column("current_risk_level")]
    public string? CurrentRiskLevel { get; set; }

    [Column("date_enrolled")]
    public DateOnly? DateEnrolled { get; set; }

    [Column("date_closed")]
    public DateOnly? DateClosed { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("notes_restricted")]
    public string? NotesRestricted { get; set; }

    // Navigation
    [ForeignKey(nameof(SafehouseId))]
    public Safehouse? Safehouse { get; set; }

    public ICollection<ProcessRecording> ProcessRecordings { get; set; } = [];
    public ICollection<HomeVisitation> HomeVisitations { get; set; } = [];
    public ICollection<IncidentReport> IncidentReports { get; set; } = [];
    public ICollection<EducationRecord> EducationRecords { get; set; } = [];
    public ICollection<HealthWellbeingRecord> HealthWellbeingRecords { get; set; } = [];
    public ICollection<InterventionPlan> InterventionPlans { get; set; } = [];
}

// ─── SAFEHOUSE ────────────────────────────────────────────────────────────────

public class Safehouse
{
    [Key]
    [Column("safehouse_id")]
    public int SafehouseId { get; set; }

    [Column("safehouse_code")]
    public string? SafehouseCode { get; set; }

    [Column("name")]
    public string? Name { get; set; }

    [Column("region")]
    public string? Region { get; set; }

    [Column("city")]
    public string? City { get; set; }

    [Column("province")]
    public string? Province { get; set; }

    [Column("country")]
    public string? Country { get; set; }

    [Column("open_date")]
    public DateOnly? OpenDate { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("capacity_girls")]
    public int? CapacityGirls { get; set; }

    [Column("capacity_staff")]
    public int? CapacityStaff { get; set; }

    [Column("current_occupancy")]
    public int? CurrentOccupancy { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    // Navigation
    public ICollection<Resident> Residents { get; set; } = [];
    public ICollection<SafehouseMonthlyMetric> MonthlyMetrics { get; set; } = [];
}

// ─── INTERVENTION PLAN ────────────────────────────────────────────────────────

public class InterventionPlan
{
    [Key]
    [Column("plan_id")]
    public int InterventionPlanId { get; set; }

    [Column("resident_id")]
    public int? ResidentId { get; set; }

    [Column("plan_category")]
    public string? PlanCategory { get; set; }

    [Column("plan_description")]
    public string? PlanDescription { get; set; }

    [Column("services_provided")]
    public string? ServicesProvided { get; set; }

    [Column("target_value")]
    public decimal? TargetValue { get; set; }

    [Column("target_date")]
    public DateOnly? TargetDate { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("case_conference_date")]
    public DateOnly? CaseConferenceDate { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}

// ─── PROCESS RECORDING ────────────────────────────────────────────────────────

public class ProcessRecording
{
    [Key]
    [Column("recording_id")]
    public int ProcessRecordingId { get; set; }

    [Column("resident_id")]
    public int? ResidentId { get; set; }

    [Column("session_date")]
    public DateOnly? SessionDate { get; set; }

    [Column("social_worker")]
    public string? SocialWorker { get; set; }

    [Column("session_type")]
    public string? SessionType { get; set; }

    [Column("session_duration_minutes")]
    public int? SessionDurationMinutes { get; set; }

    [Column("emotional_state_observed")]
    public string? EmotionalStateObserved { get; set; }

    [Column("emotional_state_end")]
    public string? EmotionalStateEnd { get; set; }

    [Column("session_narrative")]
    public string? SessionNarrative { get; set; }

    [Column("interventions_applied")]
    public string? InterventionsApplied { get; set; }

    [Column("follow_up_actions")]
    public string? FollowUpActions { get; set; }

    [Column("progress_noted")]
    public bool? ProgressNoted { get; set; }

    [Column("concerns_flagged")]
    public bool? ConcernsFlagged { get; set; }

    [Column("referral_made")]
    public bool? ReferralMade { get; set; }

    [Column("notes_restricted")]
    public string? NotesRestricted { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}

// ─── HOME VISITATION ─────────────────────────────────────────────────────────

public class HomeVisitation
{
    [Key]
    [Column("visitation_id")]
    public int HomeVisitationId { get; set; }

    [Column("resident_id")]
    public int? ResidentId { get; set; }

    [Column("visit_date")]
    public DateOnly? VisitDate { get; set; }

    [Column("social_worker")]
    public string? SocialWorker { get; set; }

    [Column("visit_type")]
    public string? VisitType { get; set; }

    [Column("location_visited")]
    public string? LocationVisited { get; set; }

    [Column("family_members_present")]
    public string? FamilyMembersPresent { get; set; }

    [Column("purpose")]
    public string? Purpose { get; set; }

    [Column("observations")]
    public string? Observations { get; set; }

    [Column("family_cooperation_level")]
    public string? FamilyCooperationLevel { get; set; }

    [Column("safety_concerns_noted")]
    public bool? SafetyConcernsNoted { get; set; }

    [Column("follow_up_needed")]
    public bool? FollowUpNeeded { get; set; }

    [Column("follow_up_notes")]
    public string? FollowUpNotes { get; set; }

    [Column("visit_outcome")]
    public string? VisitOutcome { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}

// ─── INCIDENT REPORT ─────────────────────────────────────────────────────────

public class IncidentReport
{
    [Key]
    [Column("incident_id")]
    public int IncidentReportId { get; set; }

    [Column("resident_id")]
    public int? ResidentId { get; set; }

    [Column("safehouse_id")]
    public int? SafehouseId { get; set; }

    [Column("incident_date")]
    public DateOnly? IncidentDate { get; set; }

    [Column("incident_type")]
    public string? IncidentType { get; set; }

    [Column("severity")]
    public string? Severity { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("response_taken")]
    public string? ResponseTaken { get; set; }

    [Column("resolved")]
    public bool? Resolved { get; set; }

    [Column("resolution_date")]
    public DateOnly? ResolutionDate { get; set; }

    [Column("reported_by")]
    public string? ReportedBy { get; set; }

    [Column("follow_up_required")]
    public bool? FollowUpRequired { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}

// ─── EDUCATION RECORD ────────────────────────────────────────────────────────

public class EducationRecord
{
    [Key]
    [Column("education_record_id")]
    public int EducationRecordId { get; set; }

    [Column("resident_id")]
    public int? ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly? RecordDate { get; set; }

    [Column("education_level")]
    public string? EducationLevel { get; set; }

    [Column("school_name")]
    public string? SchoolName { get; set; }

    [Column("enrollment_status")]
    public string? EnrollmentStatus { get; set; }

    [Column("attendance_rate")]
    public decimal? AttendanceRate { get; set; }

    [Column("progress_percent")]
    public decimal? ProgressPercent { get; set; }

    [Column("completion_status")]
    public string? CompletionStatus { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}

// ─── HEALTH & WELLBEING RECORD ───────────────────────────────────────────────

public class HealthWellbeingRecord
{
    [Key]
    [Column("health_record_id")]
    public int HealthWellbeingRecordId { get; set; }

    [Column("resident_id")]
    public int? ResidentId { get; set; }

    [Column("record_date")]
    public DateOnly? RecordDate { get; set; }

    [Column("general_health_score")]
    public decimal? GeneralHealthScore { get; set; }

    [Column("nutrition_score")]
    public decimal? NutritionScore { get; set; }

    [Column("sleep_quality_score")]
    public decimal? SleepQualityScore { get; set; }

    [Column("energy_level_score")]
    public decimal? EnergyLevelScore { get; set; }

    [Column("height_cm")]
    public decimal? HeightCm { get; set; }

    [Column("weight_kg")]
    public decimal? WeightKg { get; set; }

    [Column("bmi")]
    public decimal? Bmi { get; set; }

    [Column("medical_checkup_done")]
    public bool? MedicalCheckupDone { get; set; }

    [Column("psychological_checkup_done")]
    public bool? PsychologicalCheckupDone { get; set; }

    [Column("dental_checkup_done")]
    public bool? DentalCheckupDone { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey(nameof(ResidentId))]
    public Resident? Resident { get; set; }
}

// ─── DONATION ────────────────────────────────────────────────────────────────

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
    public string? CurrencyCode { get; set; }

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

// ─── DONATION ALLOCATION ─────────────────────────────────────────────────────

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

// ─── IN-KIND DONATION ITEM ───────────────────────────────────────────────────
// NOTE: Supabase uses item_name/item_category — these differ from the original stub.

public class InKindDonationItem
{
    [Key]
    [Column("item_id")]
    public int InKindDonationItemId { get; set; }

    [Column("donation_id")]
    public int DonationId { get; set; }

    [Column("item_name")]
    public string? ItemName { get; set; }

    [Column("item_category")]
    public string? ItemCategory { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("unit_of_measure")]
    public string? UnitOfMeasure { get; set; }

    [Column("estimated_unit_value")]
    public decimal? EstimatedUnitValue { get; set; }

    [Column("intended_use")]
    public string? IntendedUse { get; set; }

    [Column("received_condition")]
    public string? ReceivedCondition { get; set; }

    [ForeignKey(nameof(DonationId))]
    public Donation? Donation { get; set; }
}

// ─── SUPPORTER ───────────────────────────────────────────────────────────────

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

// ─── PARTNER ─────────────────────────────────────────────────────────────────

public class Partner
{
    [Key]
    [Column("partner_id")]
    public int PartnerId { get; set; }

    [Column("partner_name")]
    public string? PartnerName { get; set; }

    [Column("partner_type")]
    public string? PartnerType { get; set; }

    [Column("role_type")]
    public string? RoleType { get; set; }

    [Column("contact_name")]
    public string? ContactName { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("phone")]
    public string? Phone { get; set; }

    [Column("region")]
    public string? Region { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("start_date")]
    public DateOnly? StartDate { get; set; }

    [Column("end_date")]
    public DateOnly? EndDate { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    public ICollection<PartnerAssignment> PartnerAssignments { get; set; } = [];
}

// ─── PARTNER ASSIGNMENT ──────────────────────────────────────────────────────

public class PartnerAssignment
{
    [Key]
    [Column("assignment_id")]
    public int PartnerAssignmentId { get; set; }

    [Column("partner_id")]
    public int? PartnerId { get; set; }

    [Column("safehouse_id")]
    public decimal? SafehouseId { get; set; }   // numeric in DB — use decimal

    [Column("program_area")]
    public string? ProgramArea { get; set; }

    [Column("assignment_start")]
    public DateOnly? AssignmentStart { get; set; }

    [Column("assignment_end")]
    public DateOnly? AssignmentEnd { get; set; }

    [Column("responsibility_notes")]
    public string? ResponsibilityNotes { get; set; }

    [Column("is_primary")]
    public bool? IsPrimary { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [ForeignKey(nameof(PartnerId))]
    public Partner? Partner { get; set; }
}

// ─── SAFEHOUSE MONTHLY METRIC ─────────────────────────────────────────────────

public class SafehouseMonthlyMetric
{
    [Key]
    [Column("metric_id")]
    public int SafehouseMonthlyMetricId { get; set; }

    [Column("safehouse_id")]
    public int? SafehouseId { get; set; }

    [Column("month_start")]
    public DateOnly? MonthStart { get; set; }

    [Column("month_end")]
    public DateOnly? MonthEnd { get; set; }

    [Column("active_residents")]
    public int? ActiveResidents { get; set; }

    [Column("avg_education_progress")]
    public decimal? AvgEducationProgress { get; set; }

    [Column("avg_health_score")]
    public decimal? AvgHealthScore { get; set; }

    [Column("process_recording_count")]
    public int? ProcessRecordingCount { get; set; }

    [Column("home_visitation_count")]
    public int? HomeVisitationCount { get; set; }

    [Column("incident_count")]
    public int? IncidentCount { get; set; }

    [Column("notes")]
    public string? Notes { get; set; }

    [ForeignKey(nameof(SafehouseId))]
    public Safehouse? Safehouse { get; set; }
}

// ─── PUBLIC IMPACT SNAPSHOT ──────────────────────────────────────────────────

public class PublicImpactSnapshot
{
    [Key]
    [Column("snapshot_id")]
    public int PublicImpactSnapshotId { get; set; }

    [Column("snapshot_date")]
    public DateOnly? SnapshotDate { get; set; }

    [Column("headline")]
    public string? Headline { get; set; }

    [Column("summary_text")]
    public string? SummaryText { get; set; }

    [Column("metric_payload_json")]
    public string? MetricPayloadJson { get; set; }

    [Column("is_published")]
    public bool? IsPublished { get; set; }

    [Column("published_at")]
    public DateOnly? PublishedAt { get; set; }
}

// ─── INTERVENTION RECOMMENDATION ─────────────────────────────────────────────

public class InterventionRecommendation
{
    [Key]
    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("profile_cluster")]
    public string? ProfileCluster { get; set; }

    [Column("recommended_services")]
    public string? RecommendedServices { get; set; }

    [Column("recommended_session_type")]
    public string? RecommendedSessionType { get; set; }

    [Column("recommended_sessions_per_month")]
    public int? RecommendedSessionsPerMonth { get; set; }

    [Column("recommended_social_worker")]
    public string? RecommendedSocialWorker { get; set; }

    [Column("sw_outcome_score")]
    public float? SwOutcomeScore { get; set; }

    [Column("predicted_health_improvement")]
    public float? PredictedHealthImprovement { get; set; }

    [Column("predicted_education_improvement")]
    public float? PredictedEducationImprovement { get; set; }

    [Column("similar_resident_count")]
    public int? SimilarResidentCount { get; set; }

    [Column("confidence_tier")]
    public string? ConfidenceTier { get; set; }

    [Column("top_outcome_factors")]
    public string? TopOutcomeFactors { get; set; }

    [Column("scored_at")]
    public DateTime? ScoredAt { get; set; }

    [Column("model_version")]
    public string? ModelVersion { get; set; }
}

// ─── SOCIAL MEDIA RECOMMENDATION ─────────────────────────────────────────────

public class SocialMediaRecommendation
{
    [Key]
    [Column("recommendation_id")]
    public Guid RecommendationId { get; set; }

    [Column("platform")]
    public string Platform { get; set; } = "";

    [Column("is_boosted")]
    public bool IsBoosted { get; set; }

    [Column("post_type")]
    public string? PostType { get; set; }

    [Column("media_type")]
    public string? MediaType { get; set; }

    [Column("content_topic")]
    public string? ContentTopic { get; set; }

    [Column("sentiment_tone")]
    public string? SentimentTone { get; set; }

    [Column("has_call_to_action")]
    public bool? HasCallToAction { get; set; }

    [Column("call_to_action_type")]
    public string? CallToActionType { get; set; }

    [Column("features_resident_story")]
    public bool? FeaturesResidentStory { get; set; }

    [Column("best_day_of_week")]
    public string? BestDayOfWeek { get; set; }

    [Column("best_hour")]
    public int? BestHour { get; set; }

    [Column("recommended_hashtag_count")]
    public int? RecommendedHashtagCount { get; set; }

    [Column("predicted_engagement_rate")]
    public float? PredictedEngagementRate { get; set; }

    [Column("predicted_donation_referrals")]
    public float? PredictedDonationReferrals { get; set; }

    [Column("predicted_donation_value_php")]
    public float? PredictedDonationValuePhp { get; set; }

    [Column("conversion_signal")]
    public string? ConversionSignal { get; set; }

    [Column("sample_count")]
    public int? SampleCount { get; set; }

    [Column("confidence_tier")]
    public string? ConfidenceTier { get; set; }

    [Column("generated_at")]
    public DateTime? GeneratedAt { get; set; }

    [Column("model_version")]
    public string? ModelVersion { get; set; }
}

// ─── RESIDENT RISK SCORE ─────────────────────────────────────────────────────

public class ResidentRiskScore
{
    [Key]
    [Column("resident_id")]
    public int ResidentId { get; set; }

    [Column("regression_risk_score")]
    public float RegressionRiskScore { get; set; }

    [Column("regression_risk_tier")]
    public string RegressionRiskTier { get; set; } = "";

    [Column("reintegration_score")]
    public float ReintegrationScore { get; set; }

    [Column("reintegration_tier")]
    public string ReintegrationTier { get; set; } = "";

    [Column("top_concern_factors")]
    public string? TopConcernFactors { get; set; }

    [Column("top_strength_factors")]
    public string? TopStrengthFactors { get; set; }

    [Column("scored_at")]
    public DateTime? ScoredAt { get; set; }

    [Column("model_version")]
    public string? ModelVersion { get; set; }
}

// ─── DONOR CHURN SCORE ───────────────────────────────────────────────────────

public class DonorChurnScore
{
    [Key]
    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("churn_score")]
    public float ChurnScore { get; set; }

    [Column("churn_tier")]
    public string ChurnTier { get; set; } = "";

    [Column("top_churn_factors")]
    public string? TopChurnFactors { get; set; }

    [Column("scored_at")]
    public DateTime? ScoredAt { get; set; }

    [Column("model_version")]
    public string? ModelVersion { get; set; }
}

// ─── DONOR IMPACT STATEMENT ──────────────────────────────────────────────────

public class DonorImpactStatement
{
    [Key]
    [Column("statement_id")]
    public Guid StatementId { get; set; }

    [Column("supporter_id")]
    public int SupporterId { get; set; }

    [Column("safehouse_id")]
    public string SafehouseId { get; set; } = "";

    [Column("program_area")]
    public string ProgramArea { get; set; } = "";

    [Column("allocation_amount")]
    public float AllocationAmount { get; set; }

    [Column("outcome_metric")]
    public string OutcomeMetric { get; set; } = "";

    [Column("time_window_months")]
    public int TimeWindowMonths { get; set; }

    [Column("estimated_pct_change")]
    public float EstimatedPctChange { get; set; }

    [Column("statement_text")]
    public string StatementText { get; set; } = "";

    [Column("generated_at")]
    public DateTime? GeneratedAt { get; set; }

    [Column("model_version")]
    public string? ModelVersion { get; set; }
}

// ─── SOCIAL MEDIA POST ────────────────────────────────────────────────────────

public class SocialMediaPost
{
    [Key]
    [Column("post_id")]
    public int SocialMediaPostId { get; set; }

    [Column("platform")]
    public string? Platform { get; set; }

    [Column("platform_post_id")]
    public string? PlatformPostId { get; set; }

    [Column("post_url")]
    public string? PostUrl { get; set; }

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }

    [Column("day_of_week")]
    public string? DayOfWeek { get; set; }

    [Column("post_hour")]
    public int? PostHour { get; set; }

    [Column("post_type")]
    public string? PostType { get; set; }

    [Column("media_type")]
    public string? MediaType { get; set; }

    [Column("caption")]
    public string? Caption { get; set; }

    [Column("hashtags")]
    public string? Hashtags { get; set; }

    [Column("num_hashtags")]
    public int? NumHashtags { get; set; }

    [Column("mentions_count")]
    public int? MentionsCount { get; set; }

    [Column("has_call_to_action")]
    public bool? HasCallToAction { get; set; }

    [Column("call_to_action_type")]
    public string? CallToActionType { get; set; }

    [Column("content_topic")]
    public string? ContentTopic { get; set; }

    [Column("sentiment_tone")]
    public string? SentimentTone { get; set; }

    [Column("caption_length")]
    public int? CaptionLength { get; set; }

    [Column("features_resident_story")]
    public bool? FeaturesResidentStory { get; set; }

    [Column("campaign_name")]
    public string? CampaignName { get; set; }

    [Column("is_boosted")]
    public bool? IsBoosted { get; set; }

    [Column("boost_budget_php")]
    public decimal? BoostBudgetPhp { get; set; }

    [Column("impressions")]
    public int? Impressions { get; set; }

    [Column("reach")]
    public int? Reach { get; set; }

    [Column("likes")]
    public int? Likes { get; set; }

    [Column("comments")]
    public int? Comments { get; set; }

    [Column("shares")]
    public int? Shares { get; set; }

    [Column("saves")]
    public int? Saves { get; set; }

    [Column("click_throughs")]
    public int? ClickThroughs { get; set; }

    [Column("video_views")]
    public decimal? VideoViews { get; set; }

    [Column("engagement_rate")]
    public decimal? EngagementRate { get; set; }

    [Column("profile_visits")]
    public int? ProfileVisits { get; set; }

    [Column("donation_referrals")]
    public int? DonationReferrals { get; set; }

    [Column("estimated_donation_value_php")]
    public decimal? EstimatedDonationValuePhp { get; set; }

    [Column("follower_count_at_post")]
    public int? FollowerCountAtPost { get; set; }

    [Column("watch_time_seconds")]
    public decimal? WatchTimeSeconds { get; set; }

    [Column("avg_view_duration_seconds")]
    public decimal? AvgViewDurationSeconds { get; set; }

    [Column("subscriber_count_at_post")]
    public decimal? SubscriberCountAtPost { get; set; }

    [Column("forwards")]
    public decimal? Forwards { get; set; }
}
