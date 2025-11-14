# This tests if the system can find a specific piece of information that should be in your disease dataset.
# This tests the system's ability to pull structured information from your large medicines dataset.
# This is a more complex query that mimics a real user. It tests if the system can find relevant case-study information from your student depression and healthcare datasets.
# This tests how the system handles a query with common but non-specific symptoms. A good RAG system should retrieve several possibilities.

import chromadb
from sentence_transformers import SentenceTransformer
import os

DB_PATH = "db"
COLLECTION_NAME = "clinico_knowledge_base"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

def main():
    """
    Connects to the local ChromaDB and provides an interactive prompt to
    perform semantic search queries on the stored data.
    """
    print("--- ChromaDB Interactive RAG Test Script ---")
    
    try:
        print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'...")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME, device='cpu')
        print("✅ Embedding model loaded.")
    except Exception as e:
        print(f"❌ Failed to load the SentenceTransformer model: {e}")
        return

    # --- 2. Connect to ChromaDB ---
    try:
        if not os.path.exists(DB_PATH):
            print(f"\n❌ Database path '{DB_PATH}' not found. Run 'ingest.py' first.")
            return

        client = chromadb.PersistentClient(path=DB_PATH)
        collection = client.get_collection(name=COLLECTION_NAME)
        count = collection.count()

        if count == 0:
            print("\n❌ The collection is empty. Run 'ingest.py' first.")
            return
            
        print(f"\n✅ Connected to collection '{collection.name}' with {count} entries.")
        print("You can now perform semantic search queries.")
        print("Type your question and press Enter. Type 'exit' to quit.")

        while True:
            user_query = input("\nQuery> ")
            if user_query.lower() == 'exit':
                break
            
            if not user_query:
                continue

            print("\n-> Generating embedding for your query...")
            query_embedding = embedding_model.encode(user_query).tolist()

            print("-> Searching the vector database for relevant documents...")
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=3,
                include=["documents", "distances", "metadatas"]
            )
            
            print("\n--- Top 3 Matching Documents ---")
            if not results or not results['ids'][0]:
                print("No relevant documents found.")
            else:
                for i in range(len(results['ids'][0])):
                    distance = results['distances'][0][i]
                    document = results['documents'][0][i]
                    metadata = results['metadatas'][0][i]
                    source = metadata.get('source', 'N/A') if metadata else 'N/A'
                    
                    relevance_score = 1 - distance
                    
                    print(f"\n---------------- Result {i+1} (Relevance Score: {relevance_score:.2f}) ----------------")
                    print(f"Source: {source}")
                    print("\nContent:")
                    print(document)
                    print("-----------------------------------------------------------------")

    except Exception as e:
        print(f"\n❌ An error occurred: {e}")

if __name__ == "__main__":
    main()

