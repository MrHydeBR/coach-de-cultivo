import urllib.request
from app.config import Config
from app.services.gemini_provider import GeminiProvider
from coach.prompts import build_strain_research_prompt

print("--- TEXT TEST ---")
gp = GeminiProvider(api_key=Config.from_env().gemini_api_key, model_text=Config.from_env().gemini_model_text, model_vision=Config.from_env().gemini_model_vision)
result = gp.generate_coach("Diga 'coach ok' em 3 palavras.")
print("Text result:", result.text.strip())

print("\n--- VISION TEST ---")
# Fetch a tiny sample image from Wikipedia (1x1 transparent png)
req = urllib.request.urlopen("https://upload.wikimedia.org/wikipedia/commons/c/ca/1x1.png")
img_bytes = req.read()
out_vision = gp.analyze_photo(img_bytes, prompt="Descreva em uma frase o que é essa imagem.", mime_type="image/png")
print("Vision result:", out_vision.text.strip())

print("\n--- GROUNDING TEST ---")
prompt = build_strain_research_prompt("Kosher Kush x Tangie", "")
out_grounding = gp.research_strain(prompt)
print("chars:", len(out_grounding.text))
print("sources:", len(out_grounding.sources))
print("Grounding preview:", out_grounding.text[:100], "...")
