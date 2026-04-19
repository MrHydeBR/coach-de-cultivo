import google.generativeai as genai
from google.generativeai.types import Tool

class GeminiProvider:
    def __init__(self, api_key: str, model_text: str, model_vision: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        
        genai.configure(api_key=api_key)
        self.model_text = genai.GenerativeModel(model_text)
        self.model_vision = genai.GenerativeModel(model_vision)

    def generate_coach(self, prompt: str):
        """Generates text from a prompt for coaching."""
        return self.model_text.generate_content(prompt)

    def analyze_photo(self, image_bytes: bytes, prompt: str, mime_type: str = "image/jpeg"):
        """Analyzes a photo along with a prompt."""
        image_parts = [
            {
                "mime_type": mime_type,
                "data": image_bytes
            }
        ]
        return self.model_vision.generate_content([prompt, image_parts[0]])

    def research_strain(self, prompt: str):
        """Performs strain research using Google Search grounding."""
        # Using Google Search Grounding tool
        model = genai.GenerativeModel(
            model_name=self.model_text.model_name,
            tools='google_search_retrieval'
        )
        response = model.generate_content(prompt)
        # Using a minimal patch since 'sources' depends on the exact API response shape
        # The test asserts `len(out.sources)`, let's attach the grounding metadata if present
        
        # Monkey patch 'sources' into response for the smoke test expectation
        search_chunks = []
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                metadata = candidate.grounding_metadata
                if hasattr(metadata, 'grounding_chunks'):
                    search_chunks = metadata.grounding_chunks

        response.sources = search_chunks
        return response
