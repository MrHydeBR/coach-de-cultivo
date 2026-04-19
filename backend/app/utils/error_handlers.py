from flask import jsonify
from werkzeug.exceptions import HTTPException

def register_error_handlers(app):
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Tratar erros HTTP mapeados pelo Werkzeug (ex: Unauthorized, NotFound, etc)
        if isinstance(e, HTTPException):
            response = e.get_response()
            response.data = jsonify({
                "error": e.name,
                "message": e.description,
            }).data
            response.content_type = "application/json"
            return response
            
        # Erros internos não mapeados
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500
