import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Get API credentials
SIGHTENGINE_API_USER = os.getenv("SIGHTENGINE_API_USER")
SIGHTENGINE_API_SECRET = os.getenv("SIGHTENGINE_API_SECRET")

# Raise an error if credentials are missing
if not SIGHTENGINE_API_USER or not SIGHTENGINE_API_SECRET:
    raise ValueError("SightEngine API credentials not found. Set them in the .env file.")
