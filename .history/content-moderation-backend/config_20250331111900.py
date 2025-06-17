import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# SightEngine API Credentials
SIGHTENGINE_API_USER = os.getenv("917312070")
SIGHTENGINE_API_SECRET = os.getenv("yrPC6cRnjoudj2b52jUMcVjbziwpLihN")

if not SIGHTENGINE_API_USER or not SIGHTENGINE_API_SECRET:
    raise ValueError("SightEngine API credentials not found. Set them in the .env file.")
