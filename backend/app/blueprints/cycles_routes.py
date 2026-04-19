from flask import Blueprint, jsonify
from app.auth import require_api_token

cycles_bp = Blueprint("cycles", __name__, url_prefix="/cycles")

@cycles_bp.route("/active", methods=["GET"])
@require_api_token
def get_active_cycle():
    # Stub para a Missão 03. Na Missão real de DB, isso virá do Firestore.
    # Por hora, apenas retornamos 404 simulando que não há ciclo ativo.
    return jsonify({"error": "Not Found", "message": "No active cycle found"}), 404
