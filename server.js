const http = require("http");
const url = require("url");

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS0GkXnQMdKYZITuuMsAzeWDtGUqEJ3lWwqNdA67NewOsDOgqsZHKHECEEkea4nrukx4-DqxKmf62nC/pub?gid=1149576218&single=true&output=csv";

let cachedSites = [];
let cachedCentralSites = [];
let cachedTodayData = [];
let cachedTomorrowData = [];
let cachedAfterTomorrowData = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let insideQuotes = false;
  let currentCell = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      }
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function calculateFuelStatus(fuelingDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);

  const siteDate = new Date(fuelingDate);
  siteDate.setHours(0, 0, 0, 0);

  if (siteDate < today) {
    return "overdue";
  } else if (siteDate.getTime() === today.getTime()) {
    return "today";
  } else if (siteDate.getTime() === tomorrow.getTime()) {
    return "tomorrow";
  } else if (siteDate.getTime() === afterTomorrow.getTime()) {
    return "afterTomorrow";
  }
  return "future";
}

async function fetchAndParseSheet(urlToFetch = SHEET_URL, redirectCount = 0) {
  try {
    const https = require("https");
    return new Promise((resolve, reject) => {
      const req = https.get(urlToFetch, (response) => {
        // Handle redirects (301, 302, 307, 308)
        if ([301, 302, 307, 308].includes(response.statusCode)) {
          if (redirectCount >= 5) {
            reject(new Error("Too many redirects"));
            return;
          }

          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            reject(
              new Error(
                `Redirect without location header: ${response.statusCode}`,
              ),
            );
            return;
          }

          console.log(
            `🔄 Following redirect ${response.statusCode} to: ${redirectUrl}`,
          );
          resolve(fetchAndParseSheet(redirectUrl, redirectCount + 1));
          return;
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`),
          );
          return;
        }

        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            const rows = parseCSV(data);

            if (rows.length === 0) {
              console.warn("⚠️ No data found in sheet or sheet is empty");
              resolve([]);
              return;
            }

            console.log(`📊 Parsed ${rows.length} rows from sheet`);

            // Column indices (0-based): B=1, D=3, L=11, M=12, AJ=35
            const colB = 1; // SiteName
            const colD = 3; // RegionName
            const colL = 11; // lat
            const colM = 12; // lng
            const colAJ = 35; // NextFuelingPlan

            const sites = [];

            // Start from row 1 (skip header)
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];

              if (!row || row.length === 0) continue;

              const siteName = row[colB]?.trim();
              const regionName = row[colD]?.trim();
              const latStr = row[colL]?.trim();
              const lngStr = row[colM]?.trim();
              const fuelingDate = row[colAJ]?.trim();

              if (!siteName || !fuelingDate) {
                continue;
              }

              const lat = parseFloat(latStr || "0");
              const lng = parseFloat(lngStr || "0");

              if (isNaN(lat) || isNaN(lng)) {
                console.warn(`⚠️ Skipping ${siteName}: invalid coordinates`);
                continue;
              }

              sites.push({
                SiteName: siteName,
                RegionName: regionName || "Unknown",
                CityName: regionName || "Unknown",
                lat,
                lng,
                NextFuelingPlan: fuelingDate,
              });
            }

            console.log(
              `✅ Successfully parsed ${sites.length} sites from sheet`,
            );
            resolve(sites);
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on("error", (err) => {
        console.error("❌ HTTPS request error:", err.message);
        reject(err);
      });

      req.setTimeout(10000);
    });
  } catch (error) {
    console.error("❌ Error fetching/parsing Google Sheet:", error);
    return [];
  }
}

function updateCache(sites) {
  cachedSites = sites;
  cachedCentralSites = sites.filter(
    (site) =>
      site.RegionName && site.RegionName.toLowerCase().includes("central"),
  );

  cachedTodayData = [];
  cachedTomorrowData = [];
  cachedAfterTomorrowData = [];

  sites.forEach((site) => {
    const status = calculateFuelStatus(site.NextFuelingPlan);
    if (status === "today" || status === "overdue") {
      cachedTodayData.push(site);
    } else if (status === "tomorrow") {
      cachedTomorrowData.push(site);
    } else if (status === "afterTomorrow") {
      cachedAfterTomorrowData.push(site);
    }
  });

  cacheTimestamp = Date.now();
}

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

const server = http.createServer(async (req, res) => {
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

  try {
    // Refresh cache if needed
    if (Date.now() - cacheTimestamp > CACHE_DURATION) {
      console.log("Refreshing cache from Google Sheet...");
      const sites = await fetchAndParseSheet();
      if (sites.length > 0) {
        updateCache(sites);
      }
    }

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
        data: cachedSites,
        count: cachedSites.length,
        lastUpdated: new Date().toISOString(),
      };
    } else if (path === "/api/fuel/central") {
      response = {
        success: true,
        data: cachedCentralSites,
        count: cachedCentralSites.length,
        lastUpdated: new Date().toISOString(),
      };
    } else if (path === "/api/fuel/today") {
      response = {
        success: true,
        data: cachedTodayData,
        count: cachedTodayData.length,
        lastUpdated: new Date().toISOString(),
      };
    } else if (path === "/api/fuel/stats") {
      response = {
        success: true,
        stats: calculateStats(cachedSites),
      };
    } else if (path === "/data.json") {
      response = cachedSites;
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
            <strong>GET <a href="/api/fuel/sites">/api/fuel/sites</a></strong> - All fuel sites data
        </div>
        <div class="endpoint">
            <strong>GET <a href="/api/fuel/central">/api/fuel/central</a></strong> - Central region sites
        </div>
        <div class="endpoint">
            <strong>GET <a href="/api/fuel/today">/api/fuel/today</a></strong> - Sites due today
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
          "/api/fuel/central",
          "/api/fuel/today",
          "/api/fuel/stats",
          "/data.json",
        ],
        timestamp: new Date().toISOString(),
      };
    }

    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error("Request handler error:", err);
    res.writeHead(500);
    res.end(
      JSON.stringify({
        error: "Internal server error",
        message: err.message,
      }),
    );
  }
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`
🚀 COW Fuel Dashboard Server Started
📡 Port: ${PORT}
🌐 URL: http://localhost:${PORT}
🚀 Server: Node.js
📊 API Endpoints: /api/ping, /api/fuel/sites, /api/fuel/central, /api/fuel/today, /api/fuel/stats
⏰ Started: ${new Date().toLocaleString()}
  `);

  // Initial data fetch
  try {
    const sites = await fetchAndParseSheet();
    if (sites.length > 0) {
      updateCache(sites);
      console.log(`✅ Loaded ${sites.length} sites from Google Sheet`);
      console.log(`📍 Central region sites: ${cachedCentralSites.length}`);
      console.log(`⛽ Sites due today: ${cachedTodayData.length}`);
    } else {
      console.warn("⚠️ No sites loaded from Google Sheet");
    }
  } catch (err) {
    console.error("❌ Failed to load initial data:", err.message);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`❌ Error: Port ${PORT} is already in use!`);
  } else {
    console.log(`❌ Server error: ${err.message}`);
  }
});
