import chromadb
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
import shutil

# --- Configuration ---
KNOWLEDGE_BASE_DIR = "knowledge_base"
COLLECTION_NAME = "clinico_knowledge_base"
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
    Processes all .txt files, generates embeddings using SentenceTransformers,
    and saves them to a ChromaDB database.
    """
    print("--- Starting Knowledge Base Ingestion ---")

    try:
        print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'...")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME, device='cuda')
        print("Embedding model loaded.")
    except Exception as e:
        print(f"Failed to load the SentenceTransformer model: {e}")
        return

    try:
        if os.path.exists(DB_PATH):
            print(f"Removing old database at '{DB_PATH}'...")
            shutil.rmtree(DB_PATH)
        
        client = chromadb.PersistentClient(path=DB_PATH)
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"} 
        )
        print("ChromaDB client initialized and collection is ready.")
    except Exception as e:
        print(f"Failed to initialize ChromaDB: {e}")
        return

    try:
        knowledge_files = get_text_files(KNOWLEDGE_BASE_DIR)
        if not knowledge_files:
            print(f"No .txt files found in '{KNOWLEDGE_BASE_DIR}'.")
            return
            
        print(f"\nFound {len(knowledge_files)} files to process.")
        
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
        print(f"\nTotal chunks to ingest: {total_chunks}")

        # --- BATCH PROCESSING ---
        print("\nEmbedding chunks and adding to the vector database in batches...")
        for i in tqdm(range(0, total_chunks, BATCH_SIZE), desc="Embedding Batches"):
            batch_chunks = all_chunks[i:i + BATCH_SIZE]
            
            batch_embeddings = embedding_model.encode(batch_chunks).tolist()

            batch_ids = [f"{all_metadatas[j]['source']}_{j}" for j in range(i, i + len(batch_chunks))]
            batch_metadatas = all_metadatas[i:i + BATCH_SIZE]

            collection.add(
                documents=batch_chunks,
                embeddings=batch_embeddings,
                ids=batch_ids,
                metadatas=batch_metadatas
            )
        
        print("\nAll chunks have been embedded and stored successfully!")

    except Exception as e:
        print(f"\nAn error occurred during the ingestion process: {e}")

    print("\n--- Ingestion Process Finished ---")

if __name__ == "__main__":
    main()

