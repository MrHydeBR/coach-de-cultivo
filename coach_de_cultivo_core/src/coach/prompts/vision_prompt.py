def build_vision_prompt(log: dict, cycle: dict) -> str:
    day = log.get("day", "?")
    phase = "floração" if log.get("phase") == "flower" else "vegetativo"
    ph_in = log.get("ph_in", "—")
    ec_in = log.get("ec_in", "—")
    runoff_ph = log.get("runoff_ph") or "não medido"
    runoff_ec = log.get("runoff_ec") or "não medido"
    volume = log.get("volume_ml", "—")
    strain = cycle.get("strain", "desconhecida")

    return f"""Você é um especialista em cultivo indoor de cannabis em substrato de coco.
Analise a foto desta planta ({strain}) no Dia {day} de cultivo, fase de {phase}.

Dados da rega de hoje:
- pH entrada: {ph_in} | pH saída: {runoff_ph}
- EC entrada: {ec_in} | EC saída: {runoff_ec}
- Volume irrigado: {volume} mL

Retorne APENAS um objeto JSON válido (sem markdown, sem crases) com estas chaves:
- "visual_summary": string com 2-3 frases descrevendo a saúde visual geral da planta
- "issues": lista de strings com problemas visuais observados (vazia se não houver)
- "positives": lista de strings com aspectos saudáveis observados
""".strip()
