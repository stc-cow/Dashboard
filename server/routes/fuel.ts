import { RequestHandler } from "express";

export interface FuelSite {
  SiteName: string;
  CityName: string;
  NextFuelingPlan: string;
  lat: number;
  lng: number;
}

// Mock data - in production, this would fetch from Google Sheets or database
const mockFuelData: FuelSite[] = [
  {
    SiteName: "COW552",
    CityName: "Riyadh",
    NextFuelingPlan: "2025-01-19",
    lat: 24.7136,
    lng: 46.6753,
  },
  {
    SiteName: "COW910",
    CityName: "Jeddah",
    NextFuelingPlan: "2025-01-20",
    lat: 21.4858,
    lng: 39.1925,
  },
  {
    SiteName: "COW777",
    CityName: "Buraydah",
    NextFuelingPlan: "2025-01-21",
    lat: 26.332,
    lng: 43.9736,
  },
  {
    SiteName: "COW123",
    CityName: "Riyadh",
    NextFuelingPlan: "2025-01-18",
    lat: 24.7136,
    lng: 46.6753,
  },
  {
    SiteName: "COW445",
    CityName: "Dammam",
    NextFuelingPlan: "2025-01-22",
    lat: 26.4207,
    lng: 50.0888,
  },
  {
    SiteName: "COW678",
    CityName: "Medina",
    NextFuelingPlan: "2025-01-17",
    lat: 24.5247,
    lng: 39.5692,
  },
];

export const handleGetFuelSites: RequestHandler = (req, res) => {
  try {
    // In production, you would:
    // 1. Fetch from Google Sheets using the URL from your Python script
    // 2. Process the data similar to your clean_and_filter function
    // 3. Return the processed data

    res.json({
      success: true,
      data: mockFuelData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching fuel data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch fuel data",
    });
  }
};

export const handleGetFuelStats: RequestHandler = (req, res) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);

    const isSameDay = (date1: Date, date2: Date) => {
      return date1.toDateString() === date2.toDateString();
    };

    const isOverdue = (date: Date) => {
      return date < today;
    };

    const todayCount = mockFuelData.filter((site) =>
      isSameDay(new Date(site.NextFuelingPlan), today),
    ).length;

    const tomorrowCount = mockFuelData.filter((site) =>
      isSameDay(new Date(site.NextFuelingPlan), tomorrow),
    ).length;

    const afterTomorrowCount = mockFuelData.filter((site) =>
      isSameDay(new Date(site.NextFuelingPlan), afterTomorrow),
    ).length;

    const overdueCount = mockFuelData.filter((site) =>
      isOverdue(new Date(site.NextFuelingPlan)),
    ).length;

    const stats = {
      totalSites: mockFuelData.length,
      needFuelToday: todayCount,
      tomorrow: tomorrowCount,
      afterTomorrow: afterTomorrowCount,
      overdue: overdueCount,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error calculating fuel stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to calculate fuel statistics",
    });
  }
};
