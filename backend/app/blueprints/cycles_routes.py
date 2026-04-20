from flask import Blueprint, jsonify
from app.auth import require_api_token
from app.services.firebase_service import FirebaseService

cycles_bp = Blueprint("cycles", __name__, url_prefix="/cycles")


@cycles_bp.route("/active", methods=["GET"])
@require_api_token
def get_active_cycle():
    db = FirebaseService.get().db
    docs = (
        db.collection("cycles")
        .where("status", "==", "active")
        .limit(1)
        .stream()
    )
    cycle = next((d.to_dict() for d in docs), None)
    if cycle is None:
        return jsonify({"error": "Not Found", "message": "No active cycle found"}), 404
    return jsonify(cycle), 200
