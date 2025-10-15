import os
import google.generativeai as genai
import chromadb
from dotenv import load_dotenv
from langchain_text_splitters import CharacterTextSplitter

# Load environment variables
load_dotenv()

# --- Configuration ---
# Configure the Google API key for embedding
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")
genai.configure(api_key=GOOGLE_API_KEY)

# --- ChromaDB Client Setup ---
# This will create a local, file-based vector database in the 'db' directory.
client = chromadb.PersistentClient(path="db")

# Get or create a collection (like a table in a traditional DB)
# The embedding function will be handled by Google's model
collection = client.get_or_create_collection(
    name="clinico_knowledge_base"
)

def main():
    """
    Main function to process and embed the knowledge base.
    """
    print("--- Starting Knowledge Base Ingestion ---")

    # 1. Read the knowledge base file
    try:
        with open("knowledge_base.txt", "r", encoding="utf-8") as f:
            knowledge_base_text = f.read()
        print("Knowledge base file read successfully.")
    except FileNotFoundError:
        print("ERROR: knowledge_base.txt not found. Please create this file.")
        return

    # 2. Split the text into manageable chunks
    text_splitter = CharacterTextSplitter(
        separator="\n\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(knowledge_base_text)
    print(f"✅ Text split into {len(chunks)} chunks.")

    # 3. Embed the chunks and store them in ChromaDB
    print("Embedding chunks and adding to the vector database...")
    try:
        # Use Google's embedding model
        # The model's name for text embedding is 'embedding-001'
        result = genai.embed_content(
            model="models/embedding-001",
            content=chunks,
            task_type="RETRIEVAL_DOCUMENT",
            title="Clinico Knowledge Base"
        )
        embeddings = result['embedding']

        # Add the documents and their embeddings to the collection
        collection.add(
            embeddings=embeddings,
            documents=chunks,
            ids=[f"chunk_{i}" for i in range(len(chunks))] # Create a unique ID for each chunk
        )
        print(f"Successfully embedded and stored {len(chunks)} chunks in ChromaDB.")

    except Exception as e:
        print(f"An error occurred during embedding or database insertion: {e}")

    print("--- Ingestion Process Finished ---") 

if __name__ == "__main__":
    main()
