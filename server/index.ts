import express from "express";
import cors from "cors";
import {
  handleFuelOverview,
  handleGetCentralSites,
  handleGetFuelSites,
  handleGetFuelStats,
  handleGetFuelToday,
} from "./routes/fuel";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/ping", (req, res) => {
    res.json({ message: "Server is running!" });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Fuel dashboard API routes
  app.get("/api/fuel/sites", handleGetFuelSites);
  app.get("/api/fuel/central", handleGetCentralSites);
  app.get("/api/fuel/today", handleGetFuelToday);
  app.get("/api/fuel/stats", handleGetFuelStats);
  app.get("/api/fuel/overview", handleFuelOverview);

  return app;
}

// Start server if running directly
if (require.main === module) {
  const app = createServer();
  const PORT = process.env.PORT || 8080;

  app.listen(PORT, () => {
    console.log(`🚀 Fuel Dashboard Server running on port ${PORT}`);
  });
}
