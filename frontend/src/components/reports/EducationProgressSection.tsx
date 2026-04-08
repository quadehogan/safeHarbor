import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricNumber } from '@/components/analytics/MetricNumber'
import { TrendChart } from '@/components/analytics/TrendChart'

interface EducationProgressSectionProps {
  enrollmentRate: number
  attendanceRate: number
  completionRate: number
  vocationalGraduates: number
  trendData: Array<{ month: string; avgProgress: number }>
  loading?: boolean
}

export function EducationProgressSection({
  enrollmentRate,
  attendanceRate,
  completionRate,
  vocationalGraduates,
  trendData,
  loading = false,
}: EducationProgressSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Education Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <MetricNumber label="Enrollment Rate" value={`${enrollmentRate}%`} loading={loading} />
          <MetricNumber label="Attendance Rate" value={`${attendanceRate}%`} loading={loading} />
          <MetricNumber label="Completion Rate" value={`${completionRate}%`} loading={loading} />
          <MetricNumber label="Vocational Graduates" value={vocationalGraduates} loading={loading} />
        </div>
        <TrendChart
          data={trendData as Record<string, unknown>[]}
          xKey="month"
          yKey="avgProgress"
          label="Avg Education Progress"
          chartType="line"
          height={200}
        />
      </CardContent>
    </Card>
  )
}
