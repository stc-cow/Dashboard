import { RequestHandler } from "express";
import {
  fetchAndParseGoogleSheet,
  processFuelData,
  ProcessedFuelData,
  SheetSite,
} from "../../shared/sheets-parser";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0GkXnQMdKYZITuuMsAzeWDtGUqEJ3lWwqNdA67NewOsDOgqsZHKHECEEkea4nrukx4-DqxKmf62nC/pub?gid=1149576218&single=true&output=csv";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

let cachedData: ProcessedFuelData | null = null;
let cachedAt = 0;
let inflightPromise: Promise<ProcessedFuelData> | null = null;

async function loadFuelData(): Promise<{
  processed: ProcessedFuelData;
  timestamp: number;
}> {
  const now = Date.now();

  if (cachedData && now - cachedAt < CACHE_DURATION) {
    return { processed: cachedData, timestamp: cachedAt };
  }

  if (inflightPromise) {
    const processed = await inflightPromise;
    return { processed, timestamp: cachedAt };
  }

  inflightPromise = (async () => {
    const sites: SheetSite[] = await fetchAndParseGoogleSheet(SHEET_URL);
    const processed = processFuelData(sites);

    cachedData = processed;
    cachedAt = Date.now();
    inflightPromise = null;

    return processed;
  })();

  const processed = await inflightPromise;
  return { processed, timestamp: cachedAt };
}

function handleError(res: Parameters<RequestHandler>[1], error: unknown) {
  console.error("Error fetching fuel data:", error);
  res.status(500).json({
    success: false,
    error: "Failed to fetch fuel data",
  });
}

export const handleGetFuelSites: RequestHandler = async (_req, res) => {
  try {
    const { processed, timestamp } = await loadFuelData();
    res.json({
      success: true,
      data: processed.sites,
      lastUpdated: new Date(timestamp).toISOString(),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const handleGetCentralSites: RequestHandler = async (_req, res) => {
  try {
    const { processed, timestamp } = await loadFuelData();
    res.json({
      success: true,
      data: processed.centralSites,
      lastUpdated: new Date(timestamp).toISOString(),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const handleGetFuelToday: RequestHandler = async (_req, res) => {
  try {
    const { processed, timestamp } = await loadFuelData();
    res.json({
      success: true,
      data: processed.today,
      lastUpdated: new Date(timestamp).toISOString(),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const handleGetFuelStats: RequestHandler = async (_req, res) => {
  try {
    const { processed, timestamp } = await loadFuelData();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueCount = processed.today.filter((site) => {
      const fuelingDate = new Date(site.NextFuelingPlan);
      fuelingDate.setHours(0, 0, 0, 0);
      return fuelingDate < today;
    }).length;

    res.json({
      success: true,
      stats: {
        totalSites: processed.stats.totalSites,
        needFuelToday: processed.today.length,
        tomorrow: processed.tomorrow.length,
        afterTomorrow: processed.afterTomorrow.length,
        overdue: overdueCount,
        lastUpdated: new Date(timestamp).toISOString(),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const handleFuelOverview: RequestHandler = async (_req, res) => {
  try {
    const { processed, timestamp } = await loadFuelData();
    res.json({
      success: true,
      data: processed,
      lastUpdated: new Date(timestamp).toISOString(),
    });
  } catch (error) {
    handleError(res, error);
  }
};
