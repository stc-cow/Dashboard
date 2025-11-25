import json
import pandas as pd
from datetime import datetime
from flask import Flask, jsonify, send_from_directory, send_file
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='.')
CORS(app)

# Live Google Sheet CSV link
SHEET_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vS0GkXnQMdKYZITuuMsAzeWDtGUqEJ3lWwqNdA67NewOsDOgqsZHKHECEEkea4nrukx4-DqxKmf62nC"
    "/pub?gid=1149576218&single=true&output=csv"
)

# Mock data for development
MOCK_DATA = [
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
    },
    {
        "SiteName": "COW777",
        "CityName": "Buraydah",
        "NextFuelingPlan": "2025-01-21",
        "lat": 26.332,
        "lng": 43.9736
    },
    {
        "SiteName": "COW123",
        "CityName": "Riyadh",
        "NextFuelingPlan": "2025-01-18",
        "lat": 24.7136,
        "lng": 46.6753
    },
    {
        "SiteName": "COW445",
        "CityName": "Dammam",
        "NextFuelingPlan": "2025-01-22",
        "lat": 26.4207,
        "lng": 50.0888
    },
    {
        "SiteName": "COW678",
        "CityName": "Medina",
        "NextFuelingPlan": "2025-01-17",
        "lat": 24.5247,
        "lng": 39.5692
    }
]

def load_data():
    """Load data from Google Sheet or fallback to mock data"""
    try:
        print(f"Loading sheet: {SHEET_URL}")
        df = pd.read_csv(SHEET_URL)
        return clean_and_filter(df)
    except Exception as e:
        print(f"Failed to load from Google Sheets: {e}")
        print("Using mock data for development")
        return MOCK_DATA

def clean_and_filter(df):
    """Auto-detect SiteName, CityName, NextFuelingPlan columns safely."""
    # Normalize column names
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.replace(" ", "", regex=False)
        .str.replace("_", "", regex=False)
        .str.replace("-", "", regex=False)
        .str.lower()
    )

    # Column detection priorities
    site_candidates = ["sitename", "site", "cowid", "siteno", "name"]
    city_candidates = ["cityname", "city", "location", "area", "region"]
    date_candidates = ["nextfuelingplan", "nextfueldate", "fueldate", "fuelplan"]

    def pick(candidates):
        return next((c for c in df.columns if c in candidates), None)

    site_col = pick(site_candidates)
    city_col = pick(city_candidates)
    date_col = pick(date_candidates)

    # Fallbacks for missing columns
    if site_col is None:
        df["sitename"] = "Unknown"
        site_col = "sitename"

    if city_col is None:
        df["cityname"] = "Unknown"
        city_col = "cityname"

    if date_col is None:
        df["nextfuelingplan"] = pd.NaT
        date_col = "nextfuelingplan"

    # Parse date column
    df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    df = df.dropna(subset=[date_col])

    print(f"[INFO] Using columns: Site={site_col} | City={city_col} | Date={date_col}")

    # Convert to list of dicts and add mock coordinates if missing
    data = []
    for _, row in df.iterrows():
        data.append({
            "SiteName": row[site_col],
            "CityName": row[city_col],
            "NextFuelingPlan": row[date_col].strftime("%Y-%m-%d"),
            "lat": getattr(row, 'lat', 24.7136),  # Default to Riyadh
            "lng": getattr(row, 'lng', 46.6753)   # Default to Riyadh
        })

    return data

def generate_reports(data):
    """Generate today's and pending fueling reports."""
    today = pd.to_datetime(datetime.today().date())

    df = pd.DataFrame(data)
    df['NextFuelingPlan'] = pd.to_datetime(df['NextFuelingPlan'])

    df_today = df[df['NextFuelingPlan'] == today]
    df_pending = df[df['NextFuelingPlan'] < today]

    df_today.to_csv("fuel_today.csv", index=False)
    df_pending.to_csv("fuel_pending.csv", index=False)

    print("[OK] fuel_today.csv generated.")
    print("[OK] fuel_pending.csv generated.")
    print(f"   -> Due today: {len(df_today)}")
    print(f"   -> Pending overdue: {len(df_pending)}")

def calculate_stats(data):
    """Calculate dashboard statistics"""
    today = datetime.today().date()
    tomorrow = pd.to_datetime(today) + pd.Timedelta(days=1)
    after_tomorrow = pd.to_datetime(today) + pd.Timedelta(days=2)

    today_count = 0
    tomorrow_count = 0
    after_tomorrow_count = 0
    overdue_count = 0

    for site in data:
        site_date = pd.to_datetime(site['NextFuelingPlan']).date()

        if site_date == today:
            today_count += 1
        elif site_date == tomorrow.date():
            tomorrow_count += 1
        elif site_date == after_tomorrow.date():
            after_tomorrow_count += 1
        elif site_date < today:
            overdue_count += 1

    return {
        "totalSites": len(data),
        "needFuelToday": today_count,
        "tomorrow": tomorrow_count,
        "afterTomorrow": after_tomorrow_count,
        "overdue": overdue_count,
        "lastUpdated": datetime.now().isoformat()
    }

# Load data on startup
fuel_data = load_data()

# Routes
@app.route('/')
def index():
    return send_file('index.html')

@app.route('/data.json')
def get_data_json():
    return jsonify(fuel_data)

@app.route('/api/ping')
def ping():
    return jsonify({"message": "Fuel Dashboard Server is running!", "timestamp": datetime.now().isoformat()})

@app.route('/api/demo')
def demo():
    return jsonify({"message": "Hello from the fuel dashboard API!", "timestamp": datetime.now().isoformat()})

@app.route('/api/fuel/sites')
def get_fuel_sites():
    return jsonify({
        "success": True,
        "data": fuel_data,
        "lastUpdated": datetime.now().isoformat()
    })

@app.route('/api/fuel/stats')
def get_fuel_stats():
    stats = calculate_stats(fuel_data)
    return jsonify({
        "success": True,
        "stats": stats
    })

@app.route('/api/fuel/refresh')
def refresh_data():
    global fuel_data
    try:
        fuel_data = load_data()
        generate_reports(fuel_data)
        return jsonify({
            "success": True,
            "message": "Data refreshed successfully",
            "count": len(fuel_data),
            "lastUpdated": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

if __name__ == "__main__":
    print("\n🚀 Starting COW Fuel Dashboard Server (Direct Mode)...")
    print("Loading Central Fuel Plan database...")

    # Generate initial reports
    generate_reports(fuel_data)

    # Get port from environment variable with better error handling
    try:
        port = int(os.environ.get('PORT', 8080))
    except ValueError:
        print("⚠️ Invalid PORT environment variable, using default 8080")
        port = 8080

    print(f"✅ Loaded {len(fuel_data)} fuel sites")
    print(f"🌐 Starting web server on port {port}...")
    print("📊 Dashboard endpoints:")
    print("   - GET /              - Main dashboard")
    print("   - GET /api/ping      - Health check")
    print("   - GET /api/fuel/sites - Get fuel sites")
    print("   - GET /api/fuel/stats - Get statistics")
    print("   - GET /api/fuel/refresh - Refresh data")
    print()

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
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
