// Global variables
let map;
let fuelData = [];
let lastUpdated = null;

// Initialize the dashboard
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 COW Fuel Dashboard initializing...");

  // Initialize refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  refreshBtn.addEventListener("click", refreshData);

  // Load initial data
  loadDashboardData();

  // Auto-refresh every 5 minutes
  setInterval(loadDashboardData, 5 * 60 * 1000);
});

// Load dashboard data from API
async function loadDashboardData() {
  try {
    console.log("📊 Loading dashboard data...");
    updateStatus("loading");

    // Fetch both sites and stats
    const [sitesResponse, statsResponse] = await Promise.all([
      fetch("/api/fuel/sites"),
      fetch("/api/fuel/stats"),
    ]);

    if (!sitesResponse.ok || !statsResponse.ok) {
      throw new Error("Failed to fetch fuel data");
    }

    const sitesData = await sitesResponse.json();
    const statsData = await statsResponse.json();

    if (sitesData.success) {
      fuelData = sitesData.data;
      lastUpdated = sitesData.lastUpdated;
    }

    if (statsData.success) {
      updateKPICards(statsData.stats);
    }

    // Initialize map if not already done
    if (!map) {
      initializeMap();
    } else {
      updateMap();
    }

    updateStatus("online");
    console.log(`✅ Loaded ${fuelData.length} fuel sites`);
  } catch (error) {
    console.error("❌ Error loading dashboard data:", error);
    updateStatus("offline");
    showError("Failed to load dashboard data. Using cached data if available.");
  }
}

// Update KPI cards
function updateKPICards(stats) {
  console.log("📈 Updating KPI cards:", stats);

  document.getElementById("totalSites").querySelector(".value").textContent =
    stats.totalSites || 0;
  document.getElementById("needFuelToday").querySelector(".value").textContent =
    stats.needFuelToday || 0;
  document.getElementById("tomorrowFuel").querySelector(".value").textContent =
    stats.tomorrow || 0;
  document
    .getElementById("afterTomorrowFuel")
    .querySelector(".value").textContent = stats.afterTomorrow || 0;

  // Calculate scheduled sites (total - overdue)
  const scheduled = (stats.totalSites || 0) - (stats.overdue || 0);
  document.getElementById("allScheduled").querySelector(".value").textContent =
    scheduled;

  // Update overdue text
  const overdueText = document.getElementById("overdueText");
  if (stats.overdue > 0) {
    overdueText.textContent = `+${stats.overdue} overdue`;
    overdueText.style.color = "#dc2626";
  } else {
    overdueText.textContent = "All on schedule";
    overdueText.style.color = "#16a34a";
  }
}

// Initialize Leaflet map
function initializeMap() {
  console.log("🗺️ Initializing map...");

  // Initialize map centered on Saudi Arabia
  map = L.map("map").setView([23.8859, 45.0792], 6);

  // Add tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Add markers
  updateMap();
}

// Update map markers
function updateMap() {
  if (!map || !fuelData.length) return;

  console.log("📍 Updating map markers...");

  // Clear existing markers (if any)
  map.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      map.removeLayer(layer);
    }
  });

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const afterTomorrow = addDays(today, 2);

  fuelData.forEach((site) => {
    if (!isValidCoordinate(site.lat) || !isValidCoordinate(site.lng)) {
      return;
    }

    const siteDate = new Date(site.NextFuelingPlan);
    let color = "#198754"; // green - scheduled
    let status = "Scheduled";

    if (siteDate < today) {
      color = "#dc3545"; // red - overdue
      status = "Overdue";
    } else if (isSameDay(siteDate, today)) {
      color = "#dc3545"; // red - today
      status = "Due Today";
    } else if (isSameDay(siteDate, tomorrow)) {
      color = "#fd7e14"; // orange - tomorrow
      status = "Due Tomorrow";
    } else if (isSameDay(siteDate, afterTomorrow)) {
      color = "#ffc107"; // yellow - after tomorrow
      status = "Due in 2 days";
    }

    const marker = L.circleMarker([site.lat, site.lng], {
      radius: 8,
      fillColor: color,
      color: color,
      weight: 2,
      fillOpacity: 0.8,
    });

    marker.bindPopup(`
      <div style="font-family: inherit;">
        <h4 style="margin: 0 0 8px 0; color: #2d3748;">${site.SiteName}</h4>
        <p style="margin: 0 0 4px 0; color: #718096;"><strong>City:</strong> ${site.CityName}</p>
        <p style="margin: 0 0 4px 0; color: #718096;"><strong>Next Fuel:</strong> ${site.NextFuelingPlan}</p>
        <p style="margin: 0; color: ${color}; font-weight: 600;"><strong>Status:</strong> ${status}</p>
      </div>
    `);

    marker.addTo(map);
  });
}

// Refresh data manually
async function refreshData() {
  console.log("🔄 Manual data refresh triggered");
  const refreshIcon = document.getElementById("refreshIcon");
  refreshIcon.classList.add("spinning");

  try {
    await fetch("/api/fuel/refresh", { method: "GET" });
    await loadDashboardData();
    showSuccess("Data refreshed successfully!");
  } catch (error) {
    console.error("❌ Error refreshing data:", error);
    showError("Failed to refresh data");
  } finally {
    refreshIcon.classList.remove("spinning");
  }
}

// Download reports
async function downloadReport(type) {
  console.log(`📥 Downloading ${type} report...`);

  const today = startOfDay(new Date());
  let filteredData = fuelData;
  let filename = "fuel_complete.csv";

  if (type === "today") {
    filteredData = fuelData.filter((site) => {
      const siteDate = new Date(site.NextFuelingPlan);
      return isSameDay(siteDate, today);
    });
    filename = "fuel_today.csv";
  } else if (type === "pending") {
    filteredData = fuelData.filter((site) => {
      const siteDate = new Date(site.NextFuelingPlan);
      return siteDate < today;
    });
    filename = "fuel_pending.csv";
  }

  // Generate CSV
  const headers = [
    "SiteName",
    "CityName",
    "NextFuelingPlan",
    "Latitude",
    "Longitude",
  ];
  const csvContent = [
    headers.join(","),
    ...filteredData.map((site) =>
      [
        site.SiteName,
        site.CityName,
        site.NextFuelingPlan,
        site.lat.toString(),
        site.lng.toString(),
      ].join(","),
    ),
  ].join("\n");

  // Download file
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showSuccess(`Downloaded ${filename} (${filteredData.length} records)`);
}

// Update status indicator
function updateStatus(status) {
  const statusBadge = document.getElementById("statusBadge");

  switch (status) {
    case "loading":
      statusBadge.textContent = "Loading...";
      statusBadge.className = "status-badge";
      break;
    case "online":
      statusBadge.textContent = "Live Data";
      statusBadge.className = "status-badge";
      break;
    case "offline":
      statusBadge.textContent = "Offline";
      statusBadge.className = "status-badge offline";
      break;
  }
}

// Show success message
function showSuccess(message) {
  console.log("✅", message);
  // You could add a toast notification here
}

// Show error message
function showError(message) {
  console.error("❌", message);
  // You could add a toast notification here
}

// Utility functions
function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isValidCoordinate(value) {
  return value !== null && value !== undefined && !Number.isNaN(Number(value));
}
