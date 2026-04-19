def build_strain_research_prompt(strain_name: str, env_details: str) -> str:
    """
    Constrói o prompt focado em pesquisa aterrada (grounding) para uma genética.
    Retorna JSON puro sem formatação markdown.
    """
    prompt = f"""
Você é um especialista em cultivo indoor de cannabis.
Faça uma pesquisa detalhada sobre a genética: {strain_name}

{env_details}

Retorne um objeto JSON puro, com as seguintes chaves (sem crases ou markdown na resposta inteira):
- "name": Nome da strain
- "type": (indica, sativa, hybrid)
- "flowering_weeks": Semanas de floração
- "yield_potential": (low, medium, high)
- "terpenes": Lista de strings
- "effects": Lista de strings
- "grow_difficulty": (easy, medium, hard)
- "tips": Lista de strings com dicas de cultivo
"""
    return prompt.strip()
