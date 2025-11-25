import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fuel, MapPin, Calendar, AlertTriangle, TrendingUp } from "lucide-react";

interface FuelSite {
  SiteName: string;
  CityName: string;
  NextFuelingPlan: string;
  lat: number;
  lng: number;
}

interface DashboardStats {
  totalSites: number;
  needFuelToday: number;
  tomorrow: number;
  afterTomorrow: number;
  overdue: number;
}

export default function Index() {
  const [sites, setSites] = useState<FuelSite[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    needFuelToday: 0,
    tomorrow: 0,
    afterTomorrow: 0,
    overdue: 0,
  });

  useEffect(() => {
    // Simulate loading data - you can replace this with actual API calls
    const mockData: FuelSite[] = [
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
    ];

    setSites(mockData);
    calculateStats(mockData);
  }, []);

  const calculateStats = (data: FuelSite[]) => {
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

    const todayCount = data.filter((site) =>
      isSameDay(new Date(site.NextFuelingPlan), today)
    ).length;

    const tomorrowCount = data.filter((site) =>
      isSameDay(new Date(site.NextFuelingPlan), tomorrow)
    ).length;

    const afterTomorrowCount = data.filter((site) =>
      isSameDay(new Date(site.NextFuelingPlan), afterTomorrow)
    ).length;

    const overdueCount = data.filter((site) =>
      isOverdue(new Date(site.NextFuelingPlan))
    ).length;

    setStats({
      totalSites: data.length,
      needFuelToday: todayCount,
      tomorrow: tomorrowCount,
      afterTomorrow: afterTomorrowCount,
      overdue: overdueCount,
    });
  };

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
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Live Data
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <MapPin className="w-5 h-5 mr-2" />
              Fuel Site Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Map Placeholder - You can integrate Leaflet here */}
              <div className="w-full h-[500px] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Interactive Map
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Map integration will show fuel sites across Saudi Arabia
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      🔴 Today/Overdue
                    </Badge>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      🟠 Tomorrow
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      🟡 After Tomorrow
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      🟢 Scheduled
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
                const isToday = today.toDateString() === siteDate.toDateString();
                const isOverdue = siteDate < today;
                const daysDiff = Math.ceil((siteDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                let statusColor = "bg-green-100 text-green-800 border-green-200";
                let statusText = `${daysDiff} days`;

                if (isOverdue) {
                  statusColor = "bg-red-100 text-red-800 border-red-200";
                  statusText = "Overdue";
                } else if (isToday) {
                  statusColor = "bg-red-100 text-red-800 border-red-200";
                  statusText = "Today";
                } else if (daysDiff === 1) {
                  statusColor = "bg-orange-100 text-orange-800 border-orange-200";
                  statusText = "Tomorrow";
                } else if (daysDiff === 2) {
                  statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
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
