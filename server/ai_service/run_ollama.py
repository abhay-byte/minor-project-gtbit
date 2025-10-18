# ai_service/run_ollama.py
import subprocess
import sys

def main():

    # The model you want to use with Ollama.
    model_name = "qwen3:8b"
    
    command = [
        "ollama",
        "pull",
        model_name
    ]

    print(f"--- Ensuring Ollama model '{model_name}' is available ---")
    print("This may take a while the first time you run it...")
    print(f"Running command: {' '.join(command)}")

    try:
        with subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1) as proc:
            for line in proc.stdout:
                sys.stdout.write(line)
        
        if proc.returncode == 0:
            print("\n✅ Model is ready!")
            print("The Ollama server is running in the background.")
            print("Your API is available at: http://localhost:11434")
        else:
            print(f"\n❌ Ollama command failed with exit code {proc.returncode}.")

    except FileNotFoundError:
        print("\n❌ Error: 'ollama' command not found.")
        print("   Please make sure you have installed Ollama and that it is in your system's PATH.")
        print("   Installation guide: https://ollama.com/download")
    except Exception as e:
        print(f"\n❌ An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()
