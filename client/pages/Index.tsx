import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FuelMap } from "@/components/FuelMap";
import { CentralRegionCard } from "@/components/CentralRegionCard";
import {
  Fuel,
  MapPin,
  Calendar,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
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

      // Fetch all data in parallel
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

        // Categorize sites by fueling date
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

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchFuelData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  COW Fuel Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Central Operations & Workflows
                  {stats.lastUpdated && (
                    <span className="ml-2">
                      • Last updated:{" "}
                      {new Date(stats.lastUpdated).toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFuelData}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Badge
                variant="outline"
                className={`${error ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}
              >
                {error ? "Offline" : "Live Data"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Error State */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>Failed to load fuel data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && sites.length === 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center text-gray-500">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                <span>Loading fuel dashboard data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Total Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalSites}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-100 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Due & Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.needFuelToday}</div>
              {stats.overdue > 0 && (
                <p className="text-sm text-red-100 mt-1">
                  +{stats.overdue} overdue
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-100 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.tomorrow}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-100 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                After Tomorrow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.afterTomorrow}</div>
            </CardContent>
          </Card>

          <CentralRegionCard
            sites={centralSites}
            todaySites={todaySites}
            tomorrowSites={tomorrowSites}
            afterTomorrowSites={afterTomorrowSites}
          />
        </div>

        {/* Map Container */}
        <FuelMap
          sites={sites}
          todaySites={todaySites}
          tomorrowSites={tomorrowSites}
          afterTomorrowSites={afterTomorrowSites}
        />

        {/* Due & Today Sites List */}
        {todaySites.length > 0 && (
          <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Sites Due Today & Overdue ({todaySites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Site Name
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Region/City
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Fueling Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySites.map((site, index) => {
                      const today = new Date();
                      const siteDate = new Date(site.NextFuelingPlan);
                      const isOverdue = siteDate < today;

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                            {site.SiteName}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {site.CityName}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {site.NextFuelingPlan}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                isOverdue
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }
                            >
                              {isOverdue ? "OVERDUE" : "TODAY"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Schedule Overview */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Complete Fuel Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Tomorrow Section */}
              {tomorrowSites.length > 0 && (
                <div>
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                    Tomorrow ({tomorrowSites.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tomorrowSites.map((site, index) => (
                      <div
                        key={index}
                        className="p-3 bg-orange-50 dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-900/30"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {site.SiteName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {site.CityName}
                        </p>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          📅 {site.NextFuelingPlan}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* After Tomorrow Section */}
              {afterTomorrowSites.length > 0 && (
                <div>
                  <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    After Tomorrow ({afterTomorrowSites.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {afterTomorrowSites.map((site, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-900/30"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {site.SiteName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {site.CityName}
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          📅 {site.NextFuelingPlan}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scheduled Section */}
              {sites.length -
                todaySites.length -
                tomorrowSites.length -
                afterTomorrowSites.length >
                0 && (
                <div>
                  <h3 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    Scheduled (3+ days -{" "}
                    {sites.length -
                      todaySites.length -
                      tomorrowSites.length -
                      afterTomorrowSites.length}
                    )
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All other sites are scheduled for fuel in 3+ days.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
