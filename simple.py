#!/usr/bin/env python3
import json
import os
from datetime import datetime

# Simple HTTP server without Flask for testing
try:
    from http.server import HTTPServer, BaseHTTPRequestHandler
    from urllib.parse import urlparse, parse_qs
except ImportError:
    print("Python HTTP server modules not available")
    exit(1)

# Mock data
FUEL_DATA = [
    {"SiteName": "COW552", "CityName": "Riyadh", "NextFuelingPlan": "2025-01-19", "lat": 24.7136, "lng": 46.6753},
    {"SiteName": "COW910", "CityName": "Jeddah", "NextFuelingPlan": "2025-01-20", "lat": 21.4858, "lng": 39.1925},
    {"SiteName": "COW777", "CityName": "Buraydah", "NextFuelingPlan": "2025-01-21", "lat": 26.332, "lng": 43.9736}
]

class FuelDashboardHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        # Add CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        if path == '/api/ping':
            response = {
                "message": "COW Fuel Dashboard Server is running!",
                "timestamp": datetime.now().isoformat(),
                "status": "healthy"
            }
        elif path == '/api/fuel/sites':
            response = {
                "success": True,
                "data": FUEL_DATA,
                "lastUpdated": datetime.now().isoformat()
            }
        elif path == '/api/fuel/stats':
            response = {
                "success": True,
                "stats": {
                    "totalSites": len(FUEL_DATA),
                    "needFuelToday": 0,
                    "tomorrow": 1,
                    "afterTomorrow": 1,
                    "overdue": 1,
                    "lastUpdated": datetime.now().isoformat()
                }
            }
        elif path == '/data.json':
            response = FUEL_DATA
        else:
            response = {
                "message": "COW Fuel Dashboard API",
                "endpoints": ["/api/ping", "/api/fuel/sites", "/api/fuel/stats", "/data.json"],
                "status": "running"
            }
        
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {format % args}")

def run_server():
    port = int(os.environ.get('PORT', 8080))
    
    print(f"""
🚀 Starting COW Fuel Dashboard Simple Server
📡 Port: {port}
🌐 URL: http://localhost:{port}
📊 Endpoints: /api/ping, /api/fuel/sites, /api/fuel/stats
⏰ Started: {datetime.now().strftime('%H:%M:%S')}
""")
    
    try:
        server = HTTPServer(('0.0.0.0', port), FuelDashboardHandler)
        print(f"✅ Server started successfully on port {port}")
        server.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Error: Port {port} is already in use!")
        else:
            print(f"❌ Server error: {e}")
    except KeyboardInterrupt:
        print("\n👋 Server stopped")

if __name__ == "__main__":
    run_server()
