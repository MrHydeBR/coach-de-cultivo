import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    env: str
    api_token: str
    gemini_api_key: str
    gemini_model_text: str
    gemini_model_vision: str
    cors_origins: str

    @classmethod
    def from_env(cls) -> 'Config':
        return cls(
            env=os.getenv("FLASK_ENV", "development"),
            api_token=os.getenv("API_TOKEN", ""),
            gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
            gemini_model_text=os.getenv("GEMINI_MODEL_TEXT", "gemini-2.0-flash-exp"),
            gemini_model_vision=os.getenv("GEMINI_MODEL_VISION", "gemini-2.0-flash-exp"),
            cors_origins=os.getenv("CORS_ORIGINS", "*")
        )
