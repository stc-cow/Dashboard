#!/usr/bin/env python3
"""
Minimal Flask server for testing - no external dependencies
"""
import os
import json
from datetime import datetime

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
except ImportError:
    print("❌ Flask not installed. Run: pip install flask flask-cors")
    exit(1)

app = Flask(__name__)
CORS(app)

# Mock fuel data for testing
MOCK_FUEL_DATA = [
    {
        "SiteName": "COW552",
        "CityName": "Riyadh", 
        "NextFuelingPlan": "2025-01-19",
        "lat": 24.7136,
        "lng": 46.6753
    },
    {
        "SiteName": "COW910",
        "CityName": "Jeddah",
        "NextFuelingPlan": "2025-01-20", 
        "lat": 21.4858,
        "lng": 39.1925
    }
]

@app.route('/')
def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>COW Fuel Dashboard - Test Server</title>
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
            <p class="status">✅ Server is running successfully!</p>
            <h3>🔗 Available Endpoints:</h3>
            <div class="endpoint">
                <strong>GET <a href="/api/ping">/api/ping</a></strong> - Health check
            </div>
            <div class="endpoint">
                <strong>GET <a href="/api/fuel/sites">/api/fuel/sites</a></strong> - Fuel sites data
            </div>
            <div class="endpoint">
                <strong>GET <a href="/api/fuel/stats">/api/fuel/stats</a></strong> - Dashboard statistics
            </div>
            <div class="endpoint">
                <strong>GET <a href="/data.json">/data.json</a></strong> - Raw JSON data
            </div>
            <p><em>Server started at """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</em></p>
        </div>
    </body>
    </html>
    """

@app.route('/api/ping')
def ping():
    return jsonify({
        "message": "COW Fuel Dashboard Server is running!",
        "timestamp": datetime.now().isoformat(),
        "status": "healthy"
    })

@app.route('/api/fuel/sites')
def get_fuel_sites():
    return jsonify({
        "success": True,
        "data": MOCK_FUEL_DATA,
        "count": len(MOCK_FUEL_DATA),
        "lastUpdated": datetime.now().isoformat()
    })

@app.route('/api/fuel/stats')
def get_fuel_stats():
    return jsonify({
        "success": True,
        "stats": {
            "totalSites": len(MOCK_FUEL_DATA),
            "needFuelToday": 0,
            "tomorrow": 1,
            "afterTomorrow": 1,
            "overdue": 0,
            "lastUpdated": datetime.now().isoformat()
        }
    })

@app.route('/data.json')
def get_data_json():
    return jsonify(MOCK_FUEL_DATA)

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 8080))
    
    print(f"""
🚀 Starting COW Fuel Dashboard Test Server...
📡 Port: {port}
🌐 URL: http://localhost:{port}
📊 Endpoints: /api/ping, /api/fuel/sites, /api/fuel/stats
⏰ Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    """)
    
    try:
        app.run(host='0.0.0.0', port=port, debug=False)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Error: Port {port} is already in use!")
            print("Try setting a different PORT environment variable.")
        else:
            print(f"❌ Server error: {e}")
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
