import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FuelMap } from "@/components/FuelMap";
import { AlertTriangle, CalendarDays } from "lucide-react";
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

  const fetchFuelData = async () => {
    try {
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
    <div className="app-shell">
      <Card className="dashboard-card">
        <CardHeader className="card-header">
          <div>
            <p className="card-subtitle">Total Central sites</p>
            <h1 className="card-title">Central region fueling status</h1>
            {lastUpdated && (
              <p className="timestamp">Updated {formatDate(lastUpdated)}</p>
            )}
          </div>
          <div className="card-count">{centralSites.length}</div>
        </CardHeader>
        <CardContent className="card-body">
          <div className="layout">
            <div className="left-panel">
              <div className="stat-grid">
                <StatBlock
                  title="Due and today fueling"
                  value={stats.needFuelToday}
                  highlight
                />
                <StatBlock
                  title="Tomorrow sites need fueling"
                  value={stats.tomorrow}
                />
                <StatBlock
                  title="After tomorrow sites need fuel"
                  value={stats.afterTomorrow}
                />
              </div>

              <div className="table-card">
                <div className="table-header">
                  <CalendarDays className="icon" />
                  <span>Due &amp; Today fueling list (Central)</span>
                </div>
                {centralDueList.length === 0 ? (
                  <p className="empty">No central sites are due today.</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Site Name</th>
                        <th>Fueling Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centralDueList.map((site, index) => (
                        <tr key={`${site.SiteName}-${index}`}>
                          <td>{site.SiteName}</td>
                          <td>{formatDate(site.NextFuelingPlan)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="map-panel">
              <FuelMap
                sites={centralSites}
                todaySites={todaySites}
                tomorrowSites={tomorrowSites}
                afterTomorrowSites={afterTomorrowSites}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatBlockProps {
  title: string;
  value: number;
  highlight?: boolean;
}

function StatBlock({ title, value, highlight }: StatBlockProps) {
  return (
    <div className={`stat-block ${highlight ? "highlight" : ""}`}>
      <p className="stat-title">{title}</p>
      <div className="stat-value">
        {highlight && <AlertTriangle className="icon" />}
        {value}
      </div>
    </div>
  );
}
