import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

    const map = L.map(mapRef.current).setView([23.8859, 45.0792], 6);

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

    const todaySiteNames = new Set(todaySites.map((s) => s.SiteName));
    const tomorrowSiteNames = new Set(tomorrowSites.map((s) => s.SiteName));
    const afterTomorrowSiteNames = new Set(
      afterTomorrowSites.map((s) => s.SiteName),
    );

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

      if (todaySiteNames.has(site.SiteName)) {
        marker.on("click", () => {
          map.setView([site.lat, site.lng], 10);
        });
      }
    });

    if (todaySites.length > 0 && todaySites.length <= 3) {
      const group = new L.FeatureGroup(
        todaySites.map((site) => L.marker([site.lat, site.lng])),
      );
      map.fitBounds(group.getBounds().pad(0.2));
    }

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [sites, todaySites, tomorrowSites, afterTomorrowSites, mapReady]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ position: "relative" }}
    />
  );
}
