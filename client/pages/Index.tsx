import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FuelMap } from "@/components/FuelMap";
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

      // Fetch sites and stats in parallel
      const [sitesResponse, statsResponse] = await Promise.all([
        fetch("/api/fuel/sites"),
        fetch("/api/fuel/stats"),
      ]);

      if (!sitesResponse.ok || !statsResponse.ok) {
        throw new Error("Failed to fetch fuel data");
      }

      const sitesData: FuelApiResponse = await sitesResponse.json();
      const statsData: FuelApiResponse = await statsResponse.json();

      if (sitesData.success && sitesData.data) {
        setSites(sitesData.data);
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
                Need Fuel Today
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

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-100 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                All Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalSites - stats.overdue}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Container */}
        <FuelMap sites={sites} />

        {/* Site List */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Fuel Schedule Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sites.map((site, index) => {
                const today = new Date();
                const siteDate = new Date(site.NextFuelingPlan);
                const isToday =
                  today.toDateString() === siteDate.toDateString();
                const isOverdue = siteDate < today;
                const daysDiff = Math.ceil(
                  (siteDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                let statusColor =
                  "bg-green-100 text-green-800 border-green-200";
                let statusText = `${daysDiff} days`;

                if (isOverdue) {
                  statusColor = "bg-red-100 text-red-800 border-red-200";
                  statusText = "Overdue";
                } else if (isToday) {
                  statusColor = "bg-red-100 text-red-800 border-red-200";
                  statusText = "Today";
                } else if (daysDiff === 1) {
                  statusColor =
                    "bg-orange-100 text-orange-800 border-orange-200";
                  statusText = "Tomorrow";
                } else if (daysDiff === 2) {
                  statusColor =
                    "bg-yellow-100 text-yellow-800 border-yellow-200";
                  statusText = "2 days";
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {site.SiteName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {site.CityName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {site.NextFuelingPlan}
                        </p>
                        <Badge className={statusColor}>{statusText}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
