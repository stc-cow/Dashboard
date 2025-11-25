import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FuelMap } from "@/components/FuelMap";
import { Fuel, RefreshCw, MapPin, AlertTriangle, CalendarDays } from "lucide-react";
import { FuelSite, FuelStats } from "@shared/fuel";
import { ProcessedFuelData } from "@shared/sheets-parser";

interface FuelOverviewResponse {
  success: boolean;
  data?: ProcessedFuelData;
  error?: string;
  lastUpdated?: string;
}

const isCentralRegion = (site: FuelSite) =>
  site.RegionName?.toLowerCase().includes("central") ?? false;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function Index() {
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
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFuelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/fuel/overview");
      if (!response.ok) {
        throw new Error("Failed to fetch fuel data");
      }

      const payload: FuelOverviewResponse = await response.json();
      if (!payload.success || !payload.data) {
        throw new Error(payload.error || "Failed to fetch fuel data");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const centralOnly = payload.data.centralSites.filter(isCentralRegion);
      const centralToday = payload.data.today.filter(isCentralRegion);
      const centralTomorrow = payload.data.tomorrow.filter(isCentralRegion);
      const centralAfterTomorrow = payload.data.afterTomorrow.filter(isCentralRegion);
      const overdueCount = centralToday.filter((site) => {
        const fuelingDate = new Date(site.NextFuelingPlan);
        fuelingDate.setHours(0, 0, 0, 0);
        return fuelingDate < today;
      }).length;

      setSites(payload.data.sites);
      setCentralSites(centralOnly);
      setTodaySites(centralToday);
      setTomorrowSites(centralTomorrow);
      setAfterTomorrowSites(centralAfterTomorrow);
      setStats({
        totalSites: centralOnly.length,
        needFuelToday: centralToday.length,
        tomorrow: centralTomorrow.length,
        afterTomorrow: centralAfterTomorrow.length,
        overdue: overdueCount,
        lastUpdated: payload.lastUpdated || new Date().toISOString(),
      });
      setLastUpdated(payload.lastUpdated || new Date().toISOString());
    } catch (err) {
      console.error("Error fetching fuel data:", err);
    }
  };

  useEffect(() => {
    fetchFuelData();
    const interval = setInterval(fetchFuelData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const centralDueList = useMemo(
    () =>
      todaySites
        .slice()
        .sort(
          (a, b) =>
            new Date(a.NextFuelingPlan).getTime() -
            new Date(b.NextFuelingPlan).getTime(),
        ),
    [todaySites],
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">COW Fuel Dashboard</h1>
              <p className="text-blue-100 text-sm">Central Operations & Workflows</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-sm text-blue-100">Updated {formatDate(lastUpdated)}</span>
            )}
            <Button
              size="sm"
              onClick={fetchFuelData}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Badge className={`text-white ${error ? "bg-red-500" : "bg-green-500"}`}>
              {error ? "Offline" : "Live"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[430px] bg-gray-100 border-r border-gray-300 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {loading && sites.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin text-gray-600" />
                <span className="text-gray-600">Loading data...</span>
              </div>
            )}

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-gray-900">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Total Central sites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <p className="text-5xl font-bold text-gray-900">{centralSites.length}</p>
                  <Badge variant="outline" className="text-xs text-blue-700 border-blue-200 bg-blue-50">
                    Central region only
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Pulled directly from the Google Sheet (columns B, D, L, M, AJ)
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="pt-4 pb-5">
                  <p className="text-xs text-gray-600">Due and today fueling</p>
                  <div className="text-3xl font-bold text-red-600 mt-2 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {stats.needFuelToday}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="pt-4 pb-5">
                  <p className="text-xs text-gray-600">Tomorrow sites need fueling</p>
                  <div className="text-3xl font-bold text-orange-500 mt-2">{stats.tomorrow}</div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardContent className="pt-4 pb-5">
                  <p className="text-xs text-gray-600">After tomorrow sites need fuel</p>
                  <div className="text-3xl font-bold text-amber-500 mt-2">{stats.afterTomorrow}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-gray-900">
                  <CalendarDays className="w-5 h-5 mr-2 text-indigo-600" />
                  Due & Today fueling list (Central)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {centralDueList.length === 0 ? (
                  <p className="text-sm text-gray-600">No central sites are due today.</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Site Name</th>
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">Fueling Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {centralDueList.map((site, index) => (
                          <tr
                            key={`${site.SiteName}-${index}`}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="py-2 px-3 text-gray-900 font-medium text-xs">{site.SiteName}</td>
                            <td className="py-2 px-3 text-gray-700 text-xs">{formatDate(site.NextFuelingPlan)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

        <div className="flex-1 bg-gray-800">
          <FuelMap
            sites={centralSites}
            todaySites={todaySites}
            tomorrowSites={tomorrowSites}
            afterTomorrowSites={afterTomorrowSites}
          />
        </div>
      </div>
    </div>
  );
}
