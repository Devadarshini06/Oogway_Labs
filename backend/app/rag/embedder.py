import logging
from typing import List
import numpy as np

logger = logging.getLogger(__name__)

class Embedder:
    """Provides vector embeddings using sentence-transformers or local lightweight encoder."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._model = None
        self._dimension = 384

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading embedding model: {self.model_name}")
                self._model = SentenceTransformer(self.model_name)
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer ({e}). Using deterministic fallback encoder.")
                self._model = "fallback"

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        self._load_model()
        if self._model != "fallback":
            try:
                embeddings = self._model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
                return [e.tolist() for e in embeddings]
            except Exception as e:
                logger.error(f"Error encoding embeddings: {e}")

        # Fallback hash-based normalized vector for testing/offline environments
        vectors = []
        for text in texts:
            np.random.seed(abs(hash(text)) % (2**32))
            v = np.random.randn(self._dimension)
            v = v / np.linalg.norm(v)
            vectors.append(v.tolist())
        return vectors

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]

embedder = Embedder()
