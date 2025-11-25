#!/usr/bin/env python3
"""
Startup script for COW Fuel Dashboard
Handles dynamic port configuration for cloud deployments
"""
import os
import sys
from main import app, fuel_data, generate_reports

def main():
    print("\n🚀 Starting COW Fuel Dashboard Server...")
    print("Loading Central Fuel Plan database...")
    
    # Generate initial reports
    try:
        generate_reports(fuel_data)
        print(f"✅ Loaded {len(fuel_data)} fuel sites")
    except Exception as e:
        print(f"⚠️ Warning: Could not generate reports: {e}")
    
    # Get port from environment variable with multiple fallbacks
    port = None
    
    # Try different environment variables used by various cloud platforms
    for port_var in ['PORT', 'HTTP_PORT', 'SERVER_PORT']:
        if os.environ.get(port_var):
            try:
                port = int(os.environ.get(port_var))
                print(f"📡 Using port {port} from {port_var} environment variable")
                break
            except ValueError:
                continue
    
    # If no port found, use default
    if port is None:
        port = 8080
        print(f"📡 Using default port {port}")
    
    # Determine host - use 0.0.0.0 for cloud deployments
    host = '0.0.0.0'
    
    print(f"🌐 Starting web server at http://{host}:{port}")
    print("📊 Available endpoints:")
    print(f"   - GET http://localhost:{port}/              - Main dashboard")
    print(f"   - GET http://localhost:{port}/api/ping      - Health check")
    print(f"   - GET http://localhost:{port}/api/fuel/sites - Get fuel sites")
    print(f"   - GET http://localhost:{port}/api/fuel/stats - Get statistics")
    print(f"   - GET http://localhost:{port}/api/fuel/refresh - Refresh data")
    print()
    
    try:
        # Start the server
        app.run(
            host=host,
            port=port,
            debug=False,  # Disable debug in production
            use_reloader=False  # Prevent double startup in some environments
        )
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Error: Port {port} is already in use!")
            print("Try using a different port or stop the conflicting service.")
            sys.exit(1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
