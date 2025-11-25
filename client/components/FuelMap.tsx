import { useEffect, useRef } from "react";
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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const saudiBounds = L.latLngBounds(
      [16.0, 32.0],
      [33.0, 56.0],
    );

    const map = L.map(mapRef.current, {
      center: [23.8859, 45.0792],
      zoom: 6,
      minZoom: 5,
      maxZoom: 20,
      maxBounds: saudiBounds,
      maxBoundsViscosity: 1.0,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "&copy; Tiles by Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEO, Vexcel, FAO, DMA, NRCAN, GeoBase, IGN, Kadaster, USGS, Getmapping, Aerogrid, IGP, and the GIS User Community",
      },
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;

    if (!map || !layer) return;

    layer.clearLayers();

    const todaySiteNames = new Set(todaySites.map((s) => s.SiteName));
    const tomorrowSiteNames = new Set(tomorrowSites.map((s) => s.SiteName));
    const afterTomorrowSiteNames = new Set(
      afterTomorrowSites.map((s) => s.SiteName),
    );

    const highlightPoints: L.LatLngExpression[] = [];
    const allPoints: L.LatLngExpression[] = [];

    sites.forEach((site) => {
      let color = "#22c55e"; // green
      let status = "🟢 Scheduled (3+ days)";

      if (todaySiteNames.has(site.SiteName)) {
        color = "#ef4444";
        status = "🔴 Due today/overdue";
        highlightPoints.push([site.lat, site.lng]);
      } else if (tomorrowSiteNames.has(site.SiteName)) {
        color = "#ef4444";
        status = "🔴 Tomorrow";
        highlightPoints.push([site.lat, site.lng]);
      } else if (afterTomorrowSiteNames.has(site.SiteName)) {
        color = "#ef4444";
        status = "🔴 After tomorrow";
        highlightPoints.push([site.lat, site.lng]);
      }

      const marker = L.circleMarker([site.lat, site.lng], {
        radius: 9,
        color,
        fillColor: color,
        fillOpacity: 0.78,
        weight: 2,
      })
        .bindPopup(
          `<strong>${site.SiteName}</strong><br/>Fuel: ${site.NextFuelingPlan}<br/>Status: ${status}`,
        )
        .addTo(layer);

      marker.on("click", () => {
        map.setView([site.lat, site.lng], 10);
      });

      allPoints.push([site.lat, site.lng]);
    });

    if (highlightPoints.length > 0) {
      map.fitBounds(L.latLngBounds(highlightPoints).pad(0.35));
    } else if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints).pad(0.3));
    }
  }, [sites, todaySites, tomorrowSites, afterTomorrowSites]);

  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="map-container" />
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot red" />
          Due
        </div>
        <div className="legend-item">
          <span className="legend-dot green" />
          Fueling date
        </div>
      </div>
    </div>
  );
}
