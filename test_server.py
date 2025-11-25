#!/usr/bin/env python3
"""
Simple test script to verify the server can start
"""
import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    try:
        import pandas as pd
        print("✅ pandas imported successfully")
    except ImportError as e:
        print(f"❌ pandas import failed: {e}")
        return False
    
    try:
        import flask
        print("✅ flask imported successfully")
    except ImportError as e:
        print(f"❌ flask import failed: {e}")
        return False
    
    try:
        import flask_cors
        print("✅ flask_cors imported successfully")
    except ImportError as e:
        print(f"❌ flask_cors import failed: {e}")
        return False
    
    return True

def test_port():
    """Test if port 8080 is available"""
    import socket
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', 8080))
        sock.close()
        
        if result == 0:
            print("⚠️  Port 8080 is already in use")
            return False
        else:
            print("✅ Port 8080 is available")
            return True
    except Exception as e:
        print(f"❌ Error testing port: {e}")
        return False

def main():
    print("🔍 Testing COW Fuel Dashboard Setup...")
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Current directory: {os.getcwd()}")
    
    # Test imports
    if not test_imports():
        print("\n❌ Import test failed. Try running: pip install -r requirements.txt")
        return False
    
    # Test port
    if not test_port():
        print("\n⚠️  Port 8080 might be in use. The server will handle this.")
    
    print("\n✅ Setup test completed successfully!")
    print("🚀 You can now start the server with: python start.py")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
