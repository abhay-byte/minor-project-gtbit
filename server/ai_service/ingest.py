import chromadb
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import shutil

KNOWLEDGE_BASE_DIR = "knowledge_base"
DB_PATH = "db"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
BATCH_SIZE = 64 

def get_text_files(directory: str) -> list[str]:
    """Finds all .txt files in the specified directory and its subdirectories."""
    text_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".txt"):
                text_files.append(os.path.join(root, file))
    return text_files

def main():
    """
    Processes .txt files from subdirectories into separate ChromaDB collections,
    using a specialized embedding model.
    """
    print("--- Starting Knowledge Base Ingestion (Multi-Collection) ---")

    try:
        print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'...")
        # Try to use CUDA, but fall back to CPU if not available
        import torch
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"Using device: {device}")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME, device=device)
        print("Embedding model loaded.")
    except Exception as e:
        print(f"Failed to load the SentenceTransformer model: {e}")
        print("Trying to load with CPU only...")
        try:
            embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME, device='cpu')
            print("Embedding model loaded on CPU.")
        except Exception as e2:
            print(f"Failed to load the SentenceTransformer model on CPU: {e2}")
            return

    try:
        if os.path.exists(DB_PATH):
            print(f"Removing old database at '{DB_PATH}'...")
            shutil.rmtree(DB_PATH)
        
        client = chromadb.PersistentClient(path=DB_PATH)
        print("ChromaDB client initialized.")
    except Exception as e:
        print(f"Failed to initialize ChromaDB: {e}")
        return

    subdirectories = [d for d in os.listdir(KNOWLEDGE_BASE_DIR) if os.path.isdir(os.path.join(KNOWLEDGE_BASE_DIR, d))]
    if not subdirectories:
        print(f"No subdirectories found in '{KNOWLEDGE_BASE_DIR}'. Please organize your .txt files into subfolders.")
        return

    collections = {}
    for subdir in subdirectories:
        collection_name = f"clinico_{subdir}"
        try:
            collections[subdir] = client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            print(f"  -> Collection '{collection_name}' is ready.")
        except Exception as e:
            print(f"Failed to get or create collection for '{subdir}': {e}")
            return

    try:
        for subdir, collection in collections.items():
            subdir_path = os.path.join(KNOWLEDGE_BASE_DIR, subdir)
            knowledge_files = get_text_files(subdir_path)
            
            if not knowledge_files:
                print(f"\n[Info] No .txt files found in '{subdir_path}'. Skipping.")
                continue

            print(f"\nProcessing {len(knowledge_files)} files for collection '{collection.name}'...")
            
            all_chunks = []
            all_metadatas = []

            for file_path in knowledge_files:
                relative_path = os.path.relpath(file_path, KNOWLEDGE_BASE_DIR)
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()

                text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
                file_chunks = text_splitter.split_text(text)
                
                file_metadatas = [{"source": relative_path}] * len(file_chunks)
                all_chunks.extend(file_chunks)
                all_metadatas.extend(file_metadatas)

            total_chunks = len(all_chunks)
            if total_chunks == 0: continue

            print(f"  -> Total chunks to ingest for this collection: {total_chunks}")

            for i in tqdm(range(0, total_chunks, BATCH_SIZE), desc=f"Embedding '{subdir}'"):
                batch_chunks = all_chunks[i:i + BATCH_SIZE]
                batch_metadatas = all_metadatas[i:i + BATCH_SIZE]
                
                batch_embeddings = embedding_model.encode(batch_chunks).tolist()

                batch_ids = [f"{meta['source']}_{j}" for j, meta in zip(range(i, i + len(batch_chunks)), batch_metadatas)]

                collection.add(
                    documents=batch_chunks,
                    embeddings=batch_embeddings,
                    ids=batch_ids,
                    metadatas=batch_metadatas
                )
            
            print(f"Successfully ingested {total_chunks} chunks into '{collection.name}'.")

    except Exception as e:
        print(f"\nAn error occurred during the ingestion process: {e}")

    print("\n--- Ingestion Process Finished ---")

if __name__ == "__main__":
    main()

