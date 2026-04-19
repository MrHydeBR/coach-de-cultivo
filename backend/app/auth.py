from functools import wraps
from flask import request
from werkzeug.exceptions import Unauthorized
from app.config import Config

def require_api_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("X-API-Token")
        config = Config.from_env()
        
        if not token or token != config.api_token:
            raise Unauthorized("Missing or invalid X-API-Token header.")
            
        return f(*args, **kwargs)
    return decorated_function
