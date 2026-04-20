from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.utils.error_handlers import register_error_handlers
from app.blueprints.cycles_routes import cycles_bp
from app.services.firebase_service import FirebaseService

def create_app():
    app = Flask(__name__)
    config = Config.from_env()

    FirebaseService.init()
    
    # Configurar CORS permitindo apenas origens especificadas no .env
    # Se CORS_ORIGINS for '*', permite tudo (útil para dev)
    origins = [o.strip() for o in config.cors_origins.split(",")] if config.cors_origins != "*" else "*"
    CORS(app, resources={r"/*": {"origins": origins}})
    
    # Registrar Error Handlers (Para JSON ao invés de HTML)
    register_error_handlers(app)
    
    # Registrar Blueprints
    app.register_blueprint(cycles_bp)
    
    @app.route('/health')
    def health():
        return {'status': 'ok'}
        
    return app
