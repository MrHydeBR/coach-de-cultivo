from datetime import date, datetime
from flask import Blueprint, jsonify, request
from app.auth import require_api_token
from app.services.firebase_service import FirebaseService
from coach.rules import check_log

cycles_bp = Blueprint("cycles", __name__, url_prefix="/cycles")

REQUIRED_LOG_FIELDS = {"cycle_id", "date", "ph_in", "ec_in", "volume_ml"}


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


@cycles_bp.route("/logs", methods=["POST"])
@require_api_token
def create_log():
    body = request.get_json(silent=True) or {}
    missing = REQUIRED_LOG_FIELDS - body.keys()
    if missing:
        return jsonify({"error": "Bad Request", "message": f"Missing fields: {sorted(missing)}"}), 400

    cycle_id = body["cycle_id"]
    db = FirebaseService.get().db

    cycle_doc = db.collection("cycles").document(cycle_id).get()
    if not cycle_doc.exists:
        return jsonify({"error": "Not Found", "message": f"Cycle {cycle_id} not found"}), 404

    cycle = cycle_doc.to_dict()
    start = date.fromisoformat(cycle["start_date"])
    flip = date.fromisoformat(cycle["flip_date"])
    log_date = date.fromisoformat(body["date"])

    day = (log_date - start).days + 1
    phase = "flower" if log_date >= flip else "veg"
    doc_id = f"D{day:02d}"

    log = {
        "day": day,
        "date": body["date"],
        "phase": phase,
        "ph_in": float(body["ph_in"]),
        "ec_in": float(body["ec_in"]),
        "volume_ml": int(body["volume_ml"]),
        "runoff_ph": float(body["runoff_ph"]) if "runoff_ph" in body else None,
        "runoff_ec": float(body["runoff_ec"]) if "runoff_ec" in body else None,
        "notes": body.get("notes", ""),
        "photo_url": body.get("photo_url"),
        "coach_report": {"alerts": [], "actions_24h": [], "actions_5d": [], "summary": ""},
        "created_at": datetime.utcnow().isoformat(),
    }

    db.collection("cycles").document(cycle_id).collection("logs").document(doc_id).set(log, merge=True)
    return jsonify({"doc_id": doc_id, **log}), 201


@cycles_bp.route("/coach/today", methods=["GET"])
@require_api_token
def coach_today():
    cycle_id = request.args.get("cycle_id")
    if not cycle_id:
        return jsonify({"error": "Bad Request", "message": "cycle_id required"}), 400

    db = FirebaseService.get().db

    cycle_doc = db.collection("cycles").document(cycle_id).get()
    if not cycle_doc.exists:
        return jsonify({"error": "Not Found", "message": f"Cycle {cycle_id} not found"}), 404

    cycle = cycle_doc.to_dict()

    logs = list(
        db.collection("cycles").document(cycle_id).collection("logs")
        .order_by("day", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    if not logs:
        return jsonify({"error": "Not Found", "message": "No logs found for this cycle"}), 404

    log = logs[0].to_dict()
    alerts = check_log(log, cycle.get("setup", {}))

    report = {
        "cycle_id": cycle_id,
        "log_day": log["day"],
        "log_date": log["date"],
        "phase": log.get("phase"),
        "alerts": [
            {
                "code": a.code,
                "severity": a.severity,
                "message": a.message,
                "actions_24h": a.actions_24h,
                "actions_5d": a.actions_5d,
            }
            for a in alerts
        ],
        "generated_at": datetime.utcnow().isoformat(),
    }
    return jsonify(report), 200
