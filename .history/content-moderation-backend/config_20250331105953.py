import os
from dotenv import load_dotenv

load_dotenv()

DEEPAI_API_KEY = os.getenv("DEEPAI_API_KEY")

if not DEEPAI_API_KEY:
    raise ValueError("DeepAI API Key not found. Set it in the .env file.")
