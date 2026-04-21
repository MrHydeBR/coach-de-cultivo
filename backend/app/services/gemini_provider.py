import google.generativeai as genai


class GeminiProvider:
    _instance: "GeminiProvider | None" = None

    def __init__(self, api_key: str, model_text: str, model_vision: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        genai.configure(api_key=api_key)
        self.model_text = genai.GenerativeModel(model_text)
        self.model_vision = genai.GenerativeModel(model_vision)

    @classmethod
    def init(cls, api_key: str, model_text: str, model_vision: str) -> None:
        cls._instance = cls(api_key, model_text, model_vision)

    @classmethod
    def get(cls) -> "GeminiProvider":
        if cls._instance is None:
            raise RuntimeError("GeminiProvider not initialized. Call GeminiProvider.init() first.")
        return cls._instance

    def generate_coach(self, prompt: str):
        return self.model_text.generate_content(prompt)

    def analyze_photo(self, image_bytes: bytes, prompt: str, mime_type: str = "image/jpeg"):
        image_part = {"mime_type": mime_type, "data": image_bytes}
        return self.model_vision.generate_content([prompt, image_part])

    def research_strain(self, prompt: str):
        model = genai.GenerativeModel(
            model_name=self.model_text.model_name,
            tools="google_search_retrieval",
        )
        response = model.generate_content(prompt)
        search_chunks = []
        if hasattr(response, "candidates") and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, "grounding_metadata") and candidate.grounding_metadata:
                metadata = candidate.grounding_metadata
                if hasattr(metadata, "grounding_chunks"):
                    search_chunks = metadata.grounding_chunks
        response.sources = search_chunks
        return response
