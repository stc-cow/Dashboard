import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FuelMap } from "@/components/FuelMap";
import { Fuel, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { FuelSite, FuelStats, FuelApiResponse } from "@shared/fuel";

export default function Index() {
  const [sites, setSites] = useState<FuelSite[]>([]);
  const [centralSites, setCentralSites] = useState<FuelSite[]>([]);
  const [todaySites, setTodaySites] = useState<FuelSite[]>([]);
  const [tomorrowSites, setTomorrowSites] = useState<FuelSite[]>([]);
  const [afterTomorrowSites, setAfterTomorrowSites] = useState<FuelSite[]>([]);
  const [stats, setStats] = useState<FuelStats>({
    totalSites: 0,
    needFuelToday: 0,
    tomorrow: 0,
    afterTomorrow: 0,
    overdue: 0,
    lastUpdated: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFuelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sitesResponse, centralResponse, todayResponse, statsResponse] =
        await Promise.all([
          fetch("/api/fuel/sites"),
          fetch("/api/fuel/central"),
          fetch("/api/fuel/today"),
          fetch("/api/fuel/stats"),
        ]);

      if (
        !sitesResponse.ok ||
        !centralResponse.ok ||
        !todayResponse.ok ||
        !statsResponse.ok
      ) {
        throw new Error("Failed to fetch fuel data");
      }

      const sitesData: FuelApiResponse = await sitesResponse.json();
      const centralData: FuelApiResponse = await centralResponse.json();
      const todayData: FuelApiResponse = await todayResponse.json();
      const statsData: FuelApiResponse = await statsResponse.json();

      if (sitesData.success && sitesData.data) {
        setSites(sitesData.data);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const afterTomorrow = new Date(today);
        afterTomorrow.setDate(afterTomorrow.getDate() + 2);

        const todayList: FuelSite[] = [];
        const tomorrowList: FuelSite[] = [];
        const afterTomorrowList: FuelSite[] = [];

        sitesData.data.forEach((site) => {
          const siteDate = new Date(site.NextFuelingPlan);
          siteDate.setHours(0, 0, 0, 0);

          if (siteDate < today || siteDate.getTime() === today.getTime()) {
            todayList.push(site);
          } else if (siteDate.getTime() === tomorrow.getTime()) {
            tomorrowList.push(site);
          } else if (siteDate.getTime() === afterTomorrow.getTime()) {
            afterTomorrowList.push(site);
          }
        });

        setTodaySites(todayList);
        setTomorrowSites(tomorrowList);
        setAfterTomorrowSites(afterTomorrowList);
      }

      if (centralData.success && centralData.data) {
        setCentralSites(centralData.data);
      }

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error fetching fuel data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelData();

    const interval = setInterval(fetchFuelData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">COW Fuel Dashboard</h1>
              <p className="text-blue-100 text-sm">
                Central Operations & Workflows
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={fetchFuelData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            <Badge className="bg-green-500 text-white">
              {error ? "Offline" : "Live"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-96 bg-gray-100 border-r border-gray-300 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error State */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && sites.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin text-gray-600" />
                <span className="text-gray-600">Loading data...</span>
              </div>
            )}

            {/* Central Region Stats */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Central sites
              </h2>

              <div className="space-y-3">
                {/* Due and Today */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Due and today fueling
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {todaySites.length}
                  </p>
                </div>

                {/* Tomorrow */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Tomorrow sites need fueling
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {tomorrowSites.length}
                  </p>
                </div>

                {/* After Tomorrow */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    After tomorrow sites need fuel
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {afterTomorrowSites.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Sites Table */}
            {todaySites.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Sites Due Today
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">
                          Site Name
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">
                          Fueling Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySites.slice(0, 10).map((site, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-2 px-3 text-gray-900 font-medium text-xs">
                            {site.SiteName}
                          </td>
                          <td className="py-2 px-3 text-gray-600 text-xs">
                            {site.NextFuelingPlan}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {todaySites.length > 10 && (
                    <div className="p-3 bg-gray-50 text-center text-sm text-gray-600">
                      +{todaySites.length - 10} more sites
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 bg-gray-800">
          <FuelMap
            sites={sites}
            todaySites={todaySites}
            tomorrowSites={tomorrowSites}
            afterTomorrowSites={afterTomorrowSites}
          />
        </div>
      </div>
    </div>
  );
}
