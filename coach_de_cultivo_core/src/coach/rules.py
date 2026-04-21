"""
Deterministic alert rules for irrigation logs.
No I/O — pure functions only.
"""

from dataclasses import dataclass
from typing import Literal


@dataclass
class Alert:
    code: str
    severity: Literal["info", "warning", "danger"]
    message: str
    actions_24h: list[str]
    actions_5d: list[str]


def check_log(log: dict, setup: dict) -> list[Alert]:
    """Return alerts for a single irrigation log given the cycle setup."""
    alerts: list[Alert] = []

    runoff_ec = log.get("runoff_ec")
    runoff_ph = log.get("runoff_ph")
    ec_min: float = setup.get("runoff_target_ec_min", 1.8)
    ec_max: float = setup.get("runoff_target_ec_max", 2.2)

    if runoff_ec is not None:
        if runoff_ec > ec_max * 1.3:
            alerts.append(Alert(
                code="RUNOFF_EC_HIGH",
                severity="danger",
                message=f"EC saída {runoff_ec:.1f} muito alto (alvo ≤{ec_max}). Acúmulo de sais.",
                actions_24h=["Fazer flush com 2–3× o volume do vaso em água pH 6.0 sem nutrientes."],
                actions_5d=["Reduzir EC de entrada em 20%.", "Monitorar EC saída até voltar abaixo de 2.4."],
            ))
        elif runoff_ec > ec_max:
            alerts.append(Alert(
                code="RUNOFF_EC_HIGH",
                severity="warning",
                message=f"EC saída {runoff_ec:.1f} acima do alvo (≤{ec_max}).",
                actions_24h=["Regar com 10% a mais de volume para aumentar runoff."],
                actions_5d=["Reduzir EC de entrada em 10%."],
            ))
        elif runoff_ec < ec_min:
            alerts.append(Alert(
                code="RUNOFF_EC_LOW",
                severity="warning",
                message=f"EC saída {runoff_ec:.1f} abaixo do alvo (≥{ec_min}). Substrato lavado.",
                actions_24h=["Aumentar EC de entrada em 0.2."],
                actions_5d=["Verificar dose de nutrientes e ajustar conforme tabela."],
            ))

    if runoff_ph is not None:
        if runoff_ph < 5.5:
            alerts.append(Alert(
                code="RUNOFF_PH_LOW",
                severity="danger",
                message=f"pH saída {runoff_ph:.1f} muito baixo (<5.5). Risco de lock-out.",
                actions_24h=["Regar com água pH 6.5 sem nutrientes para tamponar substrato."],
                actions_5d=["Subir pH de entrada para 6.3–6.5 até pH saída estabilizar acima de 5.8."],
            ))
        elif runoff_ph < 5.8:
            alerts.append(Alert(
                code="RUNOFF_PH_LOW",
                severity="warning",
                message=f"pH saída {runoff_ph:.1f} baixo (ideal 5.8–6.2 em coco).",
                actions_24h=["Aumentar pH de entrada em 0.2."],
                actions_5d=["Monitorar pH saída nas próximas 3 regas."],
            ))
        elif runoff_ph > 6.8:
            alerts.append(Alert(
                code="RUNOFF_PH_HIGH",
                severity="danger",
                message=f"pH saída {runoff_ph:.1f} muito alto (>6.8).",
                actions_24h=["Regar com água pH 5.8 para puxar o pH do substrato para baixo."],
                actions_5d=["Diminuir pH de entrada para 5.8–6.0."],
            ))
        elif runoff_ph > 6.5:
            alerts.append(Alert(
                code="RUNOFF_PH_HIGH",
                severity="warning",
                message=f"pH saída {runoff_ph:.1f} alto.",
                actions_24h=["Reduzir pH de entrada em 0.2."],
                actions_5d=["Monitorar pH saída nas próximas regas."],
            ))

    return alerts
