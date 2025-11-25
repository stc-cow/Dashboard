import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { FuelSite } from "@shared/fuel";

interface FuelMapProps {
  sites: FuelSite[];
}

export function FuelMap({ sites }: FuelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, you would initialize Leaflet map here
    // For now, we'll show a placeholder with site data
    if (mapRef.current && sites.length > 0) {
      console.log("Map would be initialized with sites:", sites);
    }
  }, [sites]);

  const getStatusColor = (nextFuelingPlan: string) => {
    const today = new Date();
    const fuelDate = new Date(nextFuelingPlan);
    const daysDiff = Math.ceil((fuelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return "bg-red-500"; // Overdue
    if (daysDiff === 0) return "bg-red-500"; // Today
    if (daysDiff === 1) return "bg-orange-500"; // Tomorrow
    if (daysDiff === 2) return "bg-yellow-500"; // After tomorrow
    return "bg-green-500"; // Future
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5 mr-2" />
          Fuel Site Locations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Map Container */}
          <div 
            ref={mapRef}
            className="w-full h-[500px] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 relative overflow-hidden"
          >
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }} />
            </div>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Interactive Map Integration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Connect to Leaflet.js to show fuel sites across Saudi Arabia
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
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

            {/* Mock Site Markers */}
            {sites.map((site, index) => {
              // Convert lat/lng to pixel positions (mock positioning)
              const x = (site.lng - 34) * 20 + 100; // Rough conversion for Saudi Arabia
              const y = (28 - site.lat) * 20 + 100;
              
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: Math.max(20, Math.min(x, 480)),
                    top: Math.max(20, Math.min(y, 480)),
                  }}
                >
                  <div 
                    className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${getStatusColor(site.NextFuelingPlan)} hover:scale-125 transition-transform cursor-pointer`}
                    title={`${site.SiteName} - ${site.CityName} - ${site.NextFuelingPlan}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>💡 To enable full map functionality:</p>
          <p className="ml-2">• Install Leaflet: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm install leaflet @types/leaflet</code></p>
          <p className="ml-2">• Add map tiles and proper coordinate mapping</p>
        </div>
      </CardContent>
    </Card>
  );
}
