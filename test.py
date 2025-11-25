#!/usr/bin/env python3
import sys
import os
from datetime import datetime

print("=== COW Fuel Dashboard Test ===")
print(f"Python version: {sys.version}")
print(f"Platform: {sys.platform}")
print(f"Current directory: {os.getcwd()}")
print(f"Python executable: {sys.executable}")
print(f"Current time: {datetime.now()}")

# List all files in current directory
print("\nFiles in current directory:")
try:
    files = os.listdir('.')
    for f in sorted(files):
        print(f"  - {f}")
except Exception as e:
    print(f"Error listing files: {e}")

# Test basic server functionality
print("\nTesting basic HTTP server...")
try:
    import http.server
    print("✅ http.server module available")
except ImportError as e:
    print(f"❌ http.server import failed: {e}")

try:
    import json
    print("✅ json module available")
except ImportError as e:
    print(f"❌ json import failed: {e}")

print("\n=== Test Complete ===")
print("If you see this message, Python is working!")
