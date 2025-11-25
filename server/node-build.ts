import { createServer } from "./index";

// Start the server
const app = createServer();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Fuel Dashboard Server running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   - GET /api/ping - Health check`);
  console.log(`   - GET /api/demo - Demo endpoint`);
  console.log(`   - GET /api/fuel/sites - All sites`);
  console.log(`   - GET /api/fuel/central - Central-only sites`);
  console.log(`   - GET /api/fuel/today - Due and today sites`);
  console.log(`   - GET /api/fuel/stats - Fuel statistics`);
  console.log(`   - GET /api/fuel/overview - Combined payload`);
});
