import subprocess
import sys

# Define all the models required by the AI service in a single list.
# This makes it easy to add or change models in the future.
MODELS_TO_PULL = [
    "qwen3:0.6b",    # For text generation and orchestration
    "qwen2.5vl:3b",         # For vision/image-related tasks
]

def run_command(command: list[str]) -> bool:
    """Runs a command and streams its output, returning True on success."""
    try:
        with subprocess.Popen(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True, 
            bufsize=1
        ) as proc:
            for line in proc.stdout:
                sys.stdout.write(line)
        
        return proc.returncode == 0
            
    except FileNotFoundError:
        print(f"\nError: Command '{command[0]}' not found.")
        print("Please ensure Ollama is installed and in your system's PATH.")
        print("Installation guide: https://ollama.com/download")
        return False
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        return False

def main():
    """
    Ensures all required Ollama models are downloaded and available.
    """
    print("--- Ensuring all required Ollama models are available ---")
    
    all_successful = True
    for model_name in MODELS_TO_PULL:
        print(f"\n--- Pulling model: '{model_name}' ---")
        print("This may take a while the first time...")
        
        command = ["ollama", "pull", model_name]
        
        if not run_command(command):
            print(f"\nFailed to pull model: '{model_name}'.")
            all_successful = False
    
    if all_successful:
        print("\nAll required models are ready!")
        print("The Ollama server is running in the background.")
        print("Your API is available at: http://localhost:11434")
    else:
        print("\nSome models failed to download. Please check the errors above.")

if __name__ == "__main__":
    main()

