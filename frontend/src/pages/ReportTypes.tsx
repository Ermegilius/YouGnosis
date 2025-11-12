import { useEffect, useState } from "react";
import { reportTypesApi } from "@src/api/services/youtube";
import { LoadingSpinner } from "@src/components/LoadingSpinner";
import type { YouTubeReportType } from "@common/youtube.interfaces";
import type { ReactNode } from "react";

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
        setError("Failed to fetch report types. Please try again later.");
        console.error(err);
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
        <p className="text-red-500">{error}</p>
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
