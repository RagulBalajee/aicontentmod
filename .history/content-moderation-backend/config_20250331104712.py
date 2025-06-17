import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch DeepAI API Key
DEEPAI_API_KEY = os.getenv("DEEPAI_API_KEY")

# Ensure API key is set
if not DEEPAI_API_KEY:
    raise ValueError("DeepAI API Key not found. Set it in the .env file.")
