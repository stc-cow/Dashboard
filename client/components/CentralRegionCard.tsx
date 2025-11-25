import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Gauge } from "lucide-react";
import { FuelSite } from "@shared/fuel";

interface CentralRegionCardProps {
  sites: FuelSite[];
  todaySites: FuelSite[];
  tomorrowSites: FuelSite[];
  afterTomorrowSites: FuelSite[];
}

export function CentralRegionCard({
  sites,
  todaySites,
  tomorrowSites,
  afterTomorrowSites,
}: CentralRegionCardProps) {
  const centralToday = todaySites.filter(
    (site) =>
      site.CityName?.toLowerCase().includes("central") ||
      site.RegionName?.toLowerCase().includes("central"),
  );

  const centralTomorrow = tomorrowSites.filter(
    (site) =>
      site.CityName?.toLowerCase().includes("central") ||
      site.RegionName?.toLowerCase().includes("central"),
  );

  const centralAfterTomorrow = afterTomorrowSites.filter(
    (site) =>
      site.CityName?.toLowerCase().includes("central") ||
      site.RegionName?.toLowerCase().includes("central"),
  );

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Central Region Sites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-4xl font-bold">{sites.length}</div>
          <p className="text-blue-100 text-sm">Total Central Sites</p>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-blue-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-300">
                {centralToday.length}
              </div>
              <p className="text-xs text-blue-100 mt-1">Today</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-300">
                {centralTomorrow.length}
              </div>
              <p className="text-xs text-blue-100 mt-1">Tomorrow</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">
                {centralAfterTomorrow.length}
              </div>
              <p className="text-xs text-blue-100 mt-1">After Tomorrow</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
