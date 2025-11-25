import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDown,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { FuelSite, FuelApiResponse } from "@shared/fuel";

export default function Reports() {
  const [sites, setSites] = useState<FuelSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fuel/sites");
      if (!response.ok) throw new Error("Failed to fetch data");

      const data: FuelApiResponse = await response.json();
      if (data.success && data.data) {
        setSites(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateCSV = (data: FuelSite[], filename: string) => {
    const headers = [
      "SiteName",
      "CityName",
      "NextFuelingPlan",
      "Latitude",
      "Longitude",
    ];
    const csvContent = [
      headers.join(","),
      ...data.map((site) =>
        [
          site.SiteName,
          site.CityName,
          site.NextFuelingPlan,
          site.lat.toString(),
          site.lng.toString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredSites = (filter: "today" | "pending" | "all") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case "today":
        return sites.filter((site) => {
          const fuelDate = new Date(site.NextFuelingPlan);
          return fuelDate.toDateString() === today.toDateString();
        });
      case "pending":
        return sites.filter((site) => {
          const fuelDate = new Date(site.NextFuelingPlan);
          return fuelDate < today;
        });
      default:
        return sites;
    }
  };

  const todaySites = getFilteredSites("today");
  const pendingSites = getFilteredSites("pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Fuel Reports
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Generate and download fuel scheduling reports
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
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
                <span>Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Report */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Today's Fuel Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700 mb-2">
                {todaySites.length}
              </div>
              <p className="text-sm text-red-600 mb-4">
                Sites requiring fuel today
              </p>
              <Button
                size="sm"
                onClick={() => generateCSV(todaySites, "fuel_today.csv")}
                disabled={loading || todaySites.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardContent>
          </Card>

          {/* Pending Report */}
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <Calendar className="w-5 h-5 mr-2" />
                Overdue Sites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-700 mb-2">
                {pendingSites.length}
              </div>
              <p className="text-sm text-orange-600 mb-4">
                Sites with overdue fuel schedules
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateCSV(pendingSites, "fuel_pending.csv")}
                disabled={loading || pendingSites.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardContent>
          </Card>

          {/* Complete Report */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <FileText className="w-5 h-5 mr-2" />
                Complete Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 mb-2">
                {sites.length}
              </div>
              <p className="text-sm text-blue-600 mb-4">
                All fuel sites and schedules
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateCSV(sites, "fuel_complete.csv")}
                disabled={loading || sites.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Site List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Site Details
              </span>
              <Badge variant="outline">{sites.length} total sites</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Loading site data...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sites.map((site, index) => {
                  const today = new Date();
                  const fuelDate = new Date(site.NextFuelingPlan);
                  const isToday =
                    today.toDateString() === fuelDate.toDateString();
                  const isOverdue = fuelDate < today;
                  const daysDiff = Math.ceil(
                    (fuelDate.getTime() - today.getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  let statusColor = "bg-green-100 text-green-800";
                  let statusText = `${daysDiff} days`;

                  if (isOverdue) {
                    statusColor = "bg-red-100 text-red-800";
                    statusText = `${Math.abs(daysDiff)} days overdue`;
                  } else if (isToday) {
                    statusColor = "bg-red-100 text-red-800";
                    statusText = "Due today";
                  } else if (daysDiff === 1) {
                    statusColor = "bg-orange-100 text-orange-800";
                    statusText = "Tomorrow";
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {site.SiteName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {site.CityName} • {site.lat.toFixed(4)},{" "}
                            {site.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {site.NextFuelingPlan}
                        </p>
                        <Badge className={statusColor}>{statusText}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
