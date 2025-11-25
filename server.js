const http = require("http");
const url = require("url");

// Mock fuel data
const FUEL_DATA = [
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

function corsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function calculateStats(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);

  let todayCount = 0;
  let tomorrowCount = 0;
  let afterTomorrowCount = 0;
  let overdueCount = 0;

  data.forEach((site) => {
    const siteDate = new Date(site.NextFuelingPlan);
    siteDate.setHours(0, 0, 0, 0);

    if (siteDate.getTime() === today.getTime()) {
      todayCount++;
    } else if (siteDate.getTime() === tomorrow.getTime()) {
      tomorrowCount++;
    } else if (siteDate.getTime() === afterTomorrow.getTime()) {
      afterTomorrowCount++;
    } else if (siteDate < today) {
      overdueCount++;
    }
  });

  return {
    totalSites: data.length,
    needFuelToday: todayCount,
    tomorrow: tomorrowCount,
    afterTomorrow: afterTomorrowCount,
    overdue: overdueCount,
    lastUpdated: new Date().toISOString(),
  };
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  corsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");

  let response;

  if (path === "/api/ping") {
    response = {
      message: "COW Fuel Dashboard Server is running!",
      timestamp: new Date().toISOString(),
      status: "healthy",
      server: "Node.js",
    };
  } else if (path === "/api/fuel/sites") {
    response = {
      success: true,
      data: FUEL_DATA,
      count: FUEL_DATA.length,
      lastUpdated: new Date().toISOString(),
    };
  } else if (path === "/api/fuel/stats") {
    response = {
      success: true,
      stats: calculateStats(FUEL_DATA),
    };
  } else if (path === "/data.json") {
    response = FUEL_DATA;
  } else if (path === "/") {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>COW Fuel Dashboard - Server Running</title>
    <style>
        body { font-family: Arial; margin: 40px; background: #f0f2f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .status { color: #28a745; font-weight: bold; }
        .endpoint { background: #f8f9fa; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚚 COW Fuel Dashboard</h1>
        <p class="status">✅ Node.js Server is running successfully!</p>
        <p><strong>Current time:</strong> ${new Date().toLocaleString()}</p>
        <h3>🔗 API Endpoints:</h3>
        <div class="endpoint">
            <strong>GET <a href="/api/ping">/api/ping</a></strong> - Health check
        </div>
        <div class="endpoint">
            <strong>GET <a href="/api/fuel/sites">/api/fuel/sites</a></strong> - Fuel sites data (${FUEL_DATA.length} sites)
        </div>
        <div class="endpoint">
            <strong>GET <a href="/api/fuel/stats">/api/fuel/stats</a></strong> - Dashboard statistics
        </div>
        <div class="endpoint">
            <strong>GET <a href="/data.json">/data.json</a></strong> - Raw JSON data
        </div>
    </div>
</body>
</html>
    `);
    return;
  } else {
    response = {
      error: "Endpoint not found",
      availableEndpoints: [
        "/api/ping",
        "/api/fuel/sites",
        "/api/fuel/stats",
        "/data.json",
      ],
      timestamp: new Date().toISOString(),
    };
  }

  res.writeHead(200);
  res.end(JSON.stringify(response, null, 2));
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 COW Fuel Dashboard Server Started
📡 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
🚀 Server: Node.js
📊 API Endpoints: /api/ping, /api/fuel/sites, /api/fuel/stats
⏰ Started: ${new Date().toLocaleString()}
  `);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`❌ Error: Port ${PORT} is already in use!`);
  } else {
    console.log(`❌ Server error: ${err.message}`);
  }
});
