# ai_service/run_vllm.py
import subprocess
import sys

def main():
    model_name = "Qwen/Qwen3-0.6B"
    
    command = [
        sys.executable, 
        "-m", "vllm.entrypoints.openai.api_server",
        "--model", model_name,
        "--max-model-len", "2048",
        "avx512f"
    ]

    print(f"--- Starting vLLM server for model: {model_name} ---")
    print(f"Running command: {' '.join(command)}")
    print("(Press CTRL+C to stop the server)")

    try:
        # Execute the command
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ An error occurred while trying to start the vLLM server: {e}")
    except FileNotFoundError:
        print("❌ Error: 'vllm' command not found. Make sure vLLM is installed in your Poetry environment.")
        print("   Run: poetry add vllm")
    except KeyboardInterrupt:
        print("\n--- vLLM server shutting down. ---")

if __name__ == "__main__":
    main()

