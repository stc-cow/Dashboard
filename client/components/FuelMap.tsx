import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { FuelSite } from "@shared/fuel";

interface FuelMapProps {
  sites: FuelSite[];
  todaySites?: FuelSite[];
  tomorrowSites?: FuelSite[];
  afterTomorrowSites?: FuelSite[];
}

export function FuelMap({
  sites,
  todaySites = [],
  tomorrowSites = [],
  afterTomorrowSites = [],
}: FuelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapReady) return;

    // Initialize map centered on Saudi Arabia
    const map = L.map(mapRef.current).setView([23.8859, 45.0792], 6);

    // Use satellite tiles from Esri
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "&copy; Tiles by Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEO, Vexcel, FAO, DMA, NRCAN, GeoBase, IGN, Kadaster, USGS, Getmapping, Aerogrid, IGP, and the GIS User Community",
        maxZoom: 20,
        bounds: [
          [16.0, 32.0],
          [33.0, 56.0],
        ],
      },
    ).addTo(map);

    // Create custom icons for different statuses
    const createIcon = (color: string) => {
      return L.divIcon({
        html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        className: "custom-icon",
      });
    };

    const redIcon = createIcon("#ef4444");
    const orangeIcon = createIcon("#f97316");
    const yellowIcon = createIcon("#eab308");
    const greenIcon = createIcon("#22c55e");

    let maxOverdue = 0;
    const todaySiteNames = new Set(todaySites.map((s) => s.SiteName));
    const tomorrowSiteNames = new Set(tomorrowSites.map((s) => s.SiteName));
    const afterTomorrowSiteNames = new Set(
      afterTomorrowSites.map((s) => s.SiteName),
    );

    // Find site with most overdue days
    todaySites.forEach((site) => {
      const siteDate = new Date(site.NextFuelingPlan);
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - siteDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysDiff > maxOverdue) {
        maxOverdue = daysDiff;
      }
    });

    // Add markers for all sites
    sites.forEach((site) => {
      let icon = greenIcon;
      let zIndex = 100;
      let popupText = `<strong>${site.SiteName}</strong><br/>Fuel: ${site.NextFuelingPlan}<br/>Status: `;

      if (todaySiteNames.has(site.SiteName)) {
        icon = redIcon;
        zIndex = 1000;
        popupText += "🔴 Due Today/Overdue";
      } else if (tomorrowSiteNames.has(site.SiteName)) {
        icon = orangeIcon;
        zIndex = 800;
        popupText += "🟠 Tomorrow";
      } else if (afterTomorrowSiteNames.has(site.SiteName)) {
        icon = yellowIcon;
        zIndex = 600;
        popupText += "🟡 After Tomorrow";
      } else {
        popupText += "🟢 Scheduled (3+ days)";
      }

      const marker = L.marker([site.lat, site.lng], {
        icon,
        zIndexOffset: zIndex,
      })
        .bindPopup(popupText)
        .addTo(map);

      // Auto-zoom to highest priority sites
      if (todaySiteNames.has(site.SiteName)) {
        marker.on("click", () => {
          map.setView([site.lat, site.lng], 10);
        });
      }
    });

    // Auto-zoom if there are urgent sites
    if (todaySites.length > 0 && todaySites.length <= 3) {
      const group = new L.FeatureGroup(
        todaySites.map((site) => L.marker([site.lat, site.lng])),
      );
      map.fitBounds(group.getBounds().pad(0.2));
    }

    mapInstanceRef.current = map;
    setMapReady(true);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [sites, todaySites, tomorrowSites, afterTomorrowSites, mapReady]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <MapPin className="w-5 h-5 mr-2" />
          Fuel Site Locations Map (Saudi Arabia)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-[600px] bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
          />

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow" />
              <span className="text-xs font-medium text-gray-700">
                Today/Overdue
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow" />
              <span className="text-xs font-medium text-gray-700">
                Tomorrow
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow" />
              <span className="text-xs font-medium text-gray-700">
                After Tomorrow
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
              <span className="text-xs font-medium text-gray-700">3+ Days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
