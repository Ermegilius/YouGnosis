import { useEffect, useMemo, useState } from "react";
import { getDailyMetricsApi } from "@src/api/services/youtube";
import { Card, LoadingSpinner, ErrorMessage } from "@src/components/ui";
import type { Database } from "@common/supabase.types";

type DailyMetricRow =
  Database["public"]["Tables"]["youtube_daily_metrics"]["Row"];

interface DailyMetricsTableProps {
  jobId: string | null;
}

export const DailyMetricsTable = ({ jobId }: DailyMetricsTableProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DailyMetricRow[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!jobId) {
        setMetrics([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getDailyMetricsApi(jobId, { limit: 50 });
        setMetrics(data);
      } catch (err) {
        setError("Failed to load YouTube metrics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [jobId]);

  const rows = useMemo(() => metrics ?? [], [metrics]);

  return (
    <Card className="mt-6">
      <h3 className="text-lg font-semibold text-white">
        Daily Metrics (latest 50 rows)
      </h3>

      {isLoading && (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">
          No ingested data for this job yet.
        </p>
      )}

      {!isLoading && !error && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
            <thead className="bg-slate-900/50 text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Video</th>
                <th className="px-4 py-2 text-right">Views</th>
                <th className="px-4 py-2 text-right">Watch Time (min)</th>
                <th className="px-4 py-2 text-left">Extra Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row: DailyMetricRow) => {
                const payload =
                  (row.metric_payload as Record<string, unknown>) ?? {};
                const extraRaw =
                  payload.views_percentage ??
                  payload.country_code ??
                  payload.live_or_on_demand;

                const extra =
                  typeof extraRaw === "number"
                    ? extraRaw.toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })
                    : typeof extraRaw === "string"
                      ? extraRaw
                      : "—";

                return (
                  <tr key={row.id}>
                    <td className="px-4 py-2">
                      {new Date(row.report_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {row.video_id ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-right">{row.views ?? "—"}</td>
                    <td className="px-4 py-2 text-right">
                      {row.watch_time_minutes ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-left">{extra}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
