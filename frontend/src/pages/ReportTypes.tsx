import { useEffect, useState } from "react";
import { reportTypesApi } from "@src/api/services/youtube";
import { LoadingSpinner } from "@src/components/ui";
import type { ApiError, YouTubeReportType } from "@src/types/index";
import type { ReactNode } from "react";
import { ErrorMessage } from "@src/components/ui/ErrorMessage";

/**
 * ReportTypes - Displays a list of available report types.
 */
export default function ReportTypes(): ReactNode {
  const [reportTypes, setReportTypes] = useState<YouTubeReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await reportTypesApi();
        setReportTypes(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
        console.error("Failed to fetch report types:", apiError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="section">
        <h1 className="text-gradient text-2xl font-bold">Report Types</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="section">
      <h1 className="text-gradient text-2xl font-bold">Report Types</h1>
      {reportTypes.length > 0 ? (
        <ul className="list-disc pl-5">
          {reportTypes.map((type) => (
            <li key={type.id} className="text-gray-700 dark:text-gray-300">
              {type.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No report types available.</p>
      )}
    </div>
  );
}
