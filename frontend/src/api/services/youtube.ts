import { api } from "../axios";
import type { YouTubeReportType } from "@common/youtube.interfaces";

/**
 * Fetch all YouTube report types.
 * Uses Supabase token for authentication to your backend.
 * Backend will handle fetching Google token and calling YouTube API.
 * @returns {Promise<YouTubeReportType[]>} - List of report types.
 */
export const reportTypesApi = async (): Promise<YouTubeReportType[]> => {
  const response = await api.get<YouTubeReportType[]>("/youtube/report-types");
  return response.data;
};
