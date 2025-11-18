import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  reportTypesApi,
  reportingJobsApi,
  createReportingJobApi,
  listReportsApi,
  downloadReportApi,
} from "@src/api/services/youtube";
import {
  type YouTubeReportType,
  type YouTubeJob,
  type YouTubeReport,
  type ApiError,
} from "@src/types/index";
import {
  Accordion,
  Button,
  Card,
  ErrorMessage,
  LoadingSpinner,
} from "@src/components/ui";

/**
 * YouTubeJobs - Manage YouTube Reporting API jobs
 * Features:
 * - View available report types
 * - Create new reporting jobs
 * - List existing jobs
 * - View and download reports for each job
 */
export default function YouTubeJobs(): ReactNode {
  // State for report types
  const [reportTypes, setReportTypes] = useState<YouTubeReportType[]>([]);
  const [reportTypesLoading, setReportTypesLoading] = useState(true);

  // State for jobs
  const [jobs, setJobs] = useState<YouTubeJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // State for creating new job
  const [selectedReportType, setSelectedReportType] = useState("");
  const [jobName, setJobName] = useState("");
  const [creating, setCreating] = useState(false);

  // State for reports
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [reports, setReports] = useState<YouTubeReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // State for downloading
  const [downloading, setDownloading] = useState<string | null>(null);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Fetch report types on mount
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        setReportTypesLoading(true);
        setError(null);
        const data = await reportTypesApi();
        setReportTypes(data);
      } catch (err) {
        const apiError = err as ApiError;
        console.error("Failed to fetch report types:", apiError);
        setError(apiError.message);
      } finally {
        setReportTypesLoading(false);
      }
    };

    fetchReportTypes();
  }, []);

  // Fetch existing jobs
  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      setError(null);
      const data = await reportingJobsApi();
      setJobs(data);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Failed to fetch existing jobs:", apiError);
      setError(apiError.message);
    } finally {
      setJobsLoading(false);
    }
  };

  // Create a new job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReportType || !jobName.trim()) {
      setError("Please select a report type and enter a job name.");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      await createReportingJobApi(selectedReportType, jobName);

      // Reset form
      setSelectedReportType("");
      setJobName("");

      // Refresh jobs list
      await fetchJobs();
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Failed to create job:", apiError);
      setError(apiError.message);
    } finally {
      setCreating(false);
    }
  };

  // Fetch reports for a specific job
  const handleViewReports = async (jobId: string) => {
    try {
      setReportsLoading(true);
      setError(null);
      setSelectedJobId(jobId);

      const data = await listReportsApi(jobId);
      setReports(data);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Failed to fetch reports:", apiError);
      setError(apiError.message);
    } finally {
      setReportsLoading(false);
    }
  };

  // Download a report
  const handleDownloadReport = async (reportId: string, jobId: string) => {
    try {
      setDownloading(reportId);
      setError(null);

      const { data, filename } = await downloadReportApi(reportId, jobId);

      // Create a blob and trigger download
      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Failed to download report:", apiError);
      setError(apiError.message);
    } finally {
      setDownloading(null);
    }
  };

  if (reportTypesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-gradient text-3xl font-bold">
          YouTube Reporting Jobs
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create and manage YouTube Analytics reporting jobs
        </p>
      </div>

      {/* Error Display */}
      {error && <ErrorMessage message={error} />}

      {/* Create New Job Section */}
      <Card>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Create New Reporting Job
        </h2>
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label
              htmlFor="reportType"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Report Type
            </label>
            <select
              id="reportType"
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={creating}
            >
              <option value="">Select a report type...</option>
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="jobName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Job Name
            </label>
            <input
              type="text"
              id="jobName"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g., My Channel Analytics"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={creating}
            />
          </div>

          <Button type="submit" disabled={creating} variant="primary">
            {creating ? "Creating..." : "Create Job"}
          </Button>
        </form>
      </Card>

      {/* Existing Jobs Section */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Existing Jobs
          </h2>
          <Button
            onClick={fetchJobs}
            disabled={jobsLoading}
            variant="secondary"
          >
            {jobsLoading ? "Loading..." : "Refresh Jobs"}
          </Button>
        </div>

        {jobsLoading ? (
          <LoadingSpinner />
        ) : jobs.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No jobs created yet. Create your first job above!
          </p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {job.name}
                  </h3>
                  <Button
                    onClick={() => handleViewReports(job.id)}
                    disabled={reportsLoading}
                    variant="secondary"
                    size="sm"
                  >
                    View Reports
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Report Type: {job.reportTypeId}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Created:{" "}
                  {new Date(job.createTime).toLocaleDateString("de-DE")}
                </p>

                {/* Reports List for Selected Job */}
                {selectedJobId === job.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                    {reportsLoading ? (
                      <LoadingSpinner />
                    ) : reports.length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No reports available yet. Reports are generated
                        periodically by YouTube.
                      </p>
                    ) : (
                      <Accordion title="Available Reports">
                        <div className="space-y-2">
                          {reports.map((report) => (
                            <div
                              key={report.id}
                              className="flex items-center justify-between rounded bg-gray-50 p-3 dark:bg-gray-800"
                            >
                              <div className="text-sm">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(
                                    report.startTime,
                                  ).toLocaleDateString("de-DE")}{" "}
                                  -{" "}
                                  {new Date(report.endTime).toLocaleDateString(
                                    "de-DE",
                                  )}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Created:{" "}
                                  {new Date(
                                    report.createTime,
                                  ).toLocaleDateString("de-DE")}
                                </p>
                              </div>
                              <Button
                                onClick={() =>
                                  handleDownloadReport(report.id, job.id)
                                }
                                disabled={downloading === report.id}
                                variant="primary"
                                size="sm"
                              >
                                {downloading === report.id
                                  ? "Downloading..."
                                  : "Download CSV"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
