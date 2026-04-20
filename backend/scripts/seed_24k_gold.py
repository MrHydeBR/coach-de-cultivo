"""
Seed script — cycle "24K Gold Fev26"
Populates Firestore with the reference cycle + 38 historical irrigation logs.
Idempotent: re-running updates existing documents.

Usage:
    cd backend
    source .venv/bin/activate
    PYTHONPATH=../coach_de_cultivo_core/src:. python scripts/seed_24k_gold.py
"""

import os
import sys
import time
from datetime import date, timedelta

# Allow running from repo root as well
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from app.services.firebase_service import FirebaseService
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

CYCLE_ID = "24k_gold_fev26"
START_DATE = date(2026, 2, 10)
FLIP_DATE = date(2026, 3, 13)   # D32 of cycle

CYCLE_DOC = {
    "cycle_id": CYCLE_ID,
    "strain": "24K Gold (Kosher Kush x Tangie)",
    "start_date": START_DATE.isoformat(),
    "flip_date": FLIP_DATE.isoformat(),
    "status": "active",
    "setup": {
        "tent_height_cm": 75,
        "tent_width_cm": 50,
        "tent_depth_cm": 40,
        "light_watts": 65,
        "photoperiod_on_hours": 12,
        "substrate": "coco",
        "pot": "7L fabric",
        "nutrient_line": "EasyCoco A+B+C",
        "runoff_target_ec_min": 1.8,
        "runoff_target_ec_max": 2.2,
    },
    "updated_at": SERVER_TIMESTAMP,
}

# fmt: off
# Realistic veg/flower log data for D1–D38
# Columns: ph_in, ec_in, volume_ml, runoff_ph, runoff_ec, notes
_LOG_DATA = [
    # D1–D10 early veg — low EC, building root zone
    (6.1, 0.8,  300, 6.2, 1.0, "primeiro rega coco"),
    (6.0, 0.8,  300, 6.3, 1.1, ""),
    (6.1, 0.9,  350, 6.2, 1.1, ""),
    (6.1, 0.9,  350, 6.1, 1.2, ""),
    (6.0, 1.0,  400, 6.2, 1.3, "primeiras folhas verdadeiras"),
    (6.1, 1.0,  400, 6.2, 1.3, ""),
    (6.0, 1.1,  400, 6.1, 1.4, ""),
    (6.1, 1.1,  450, 6.2, 1.5, ""),
    (6.0, 1.1,  450, 6.1, 1.4, ""),
    (6.1, 1.2,  450, 6.2, 1.5, "growth rápido"),
    # D11–D20 mid veg
    (6.0, 1.2,  500, 6.1, 1.6, ""),
    (6.1, 1.2,  500, 6.2, 1.6, ""),
    (6.0, 1.3,  500, 6.1, 1.7, ""),
    (6.1, 1.3,  500, 6.2, 1.7, ""),
    (6.0, 1.3,  550, 6.1, 1.8, "planta bem vigorosa"),
    (6.1, 1.4,  550, 6.2, 1.8, ""),
    (6.0, 1.4,  550, 6.1, 1.9, ""),
    (6.0, 1.4,  550, 6.2, 1.9, ""),
    (6.1, 1.4,  550, 6.1, 1.9, ""),
    (6.0, 1.5,  600, 6.2, 2.0, "início topping"),
    # D21–D31 late veg — ramping to flip EC
    (6.0, 1.5,  600, 6.1, 2.0, ""),
    (6.1, 1.5,  600, 6.2, 2.0, ""),
    (6.0, 1.5,  600, 6.1, 2.1, ""),
    (6.0, 1.6,  600, 6.2, 2.1, "LST aplicado"),
    (6.1, 1.6,  650, 6.1, 2.1, ""),
    (6.0, 1.6,  650, 6.2, 2.2, ""),
    (6.1, 1.6,  650, 6.1, 2.2, ""),
    (6.0, 1.6,  650, 6.2, 2.2, ""),
    (6.1, 1.6,  650, 6.1, 2.1, ""),
    (6.0, 1.6,  650, 6.2, 2.2, ""),
    (6.1, 1.6,  650, 6.1, 2.2, "flip para 12/12"),
    # D32–D38 early flower
    (6.0, 1.8,  700, 6.1, 2.3, "flip D1 — pistils emergindo"),
    (6.0, 1.9,  700, 6.1, 2.4, ""),
    (6.0, 1.9,  700, 6.0, 2.3, ""),
    (6.1, 2.0,  750, 6.1, 2.5, "stretch visível"),
    (6.0, 2.0,  750, 6.0, 2.4, ""),
    (6.1, 2.1,  750, 6.1, 2.5, ""),
    (6.0, 2.1,  800, 6.0, 2.6, "primeiros calyces"),
]
# fmt: on


def _phase(day: int) -> str:
    log_date = START_DATE + timedelta(days=day - 1)
    return "flower" if log_date >= FLIP_DATE else "veg"


def main() -> None:
    t0 = time.time()

    svc = FirebaseService.init()
    db = svc.db

    project_id = db.project
    print(f"[seed] Firebase OK (project={project_id})")

    # Upsert cycle document
    cycles_ref = db.collection("cycles")
    cycles_ref.document(CYCLE_ID).set(CYCLE_DOC, merge=True)
    print(f"[seed] Cycle upserted: {CYCLE_ID}")

    # Upsert 38 log documents
    logs_ref = cycles_ref.document(CYCLE_ID).collection("logs")
    n = len(_LOG_DATA)
    for i, (ph_in, ec_in, vol, runoff_ph, runoff_ec, notes) in enumerate(_LOG_DATA):
        day = i + 1
        log_date = START_DATE + timedelta(days=i)
        doc = {
            "day": day,
            "date": log_date.isoformat(),
            "phase": _phase(day),
            "ph_in": ph_in,
            "ec_in": ec_in,
            "volume_ml": vol,
            "runoff_ph": runoff_ph,
            "runoff_ec": runoff_ec,
            "notes": notes,
            "coach_report": {
                "alerts": [],
                "actions_24h": [],
                "actions_5d": [],
                "summary": "",
            },
            "created_at": log_date.isoformat(),
        }
        logs_ref.document(f"D{day:02d}").set(doc, merge=True)

    elapsed = time.time() - t0
    print(f"[seed] Logs: {n}/{n} (D1..D{n})")
    print(f"[seed] Done in {elapsed:.1f}s")


if __name__ == "__main__":
    main()
