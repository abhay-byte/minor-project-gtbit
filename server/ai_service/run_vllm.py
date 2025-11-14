# ai_service/run_vllm.py
import subprocess
import sys
import torch

def detect_gpu():
    """Detects GPU type and total VRAM (in GB)."""
    if not torch.cuda.is_available():
        return None, 0

    device = torch.cuda.get_device_name(0)
    total_vram = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
    return device, round(total_vram, 2)

def get_vllm_config(vram_gb: float):
    """
    Auto-selects conservative, balanced, or aggressive vLLM settings
    based on available GPU VRAM.
    """
    if vram_gb <= 4:
        # GTX 1650 / 1050 Ti / similar
        return {
            "gpu_memory_utilization": "0.75",
            "max_num_seqs": "32",
            "max_model_len": "512"
        }
    elif vram_gb <= 8:
        return {
            "gpu_memory_utilization": "0.7",
            "max_num_seqs": "32",
            "max_model_len": "1024"
        }
    else:
        # For GPUs like 3090 / 4090 / A100
        return {
            "gpu_memory_utilization": "0.9",
            "max_num_seqs": "64",
            "max_model_len": "2048"
        }

def main():
    model_name = "Qwen/Qwen3-0.6B"

    # Detect GPU and memory
    gpu_name, vram_gb = detect_gpu()
    if gpu_name:
        print(f"🧠 Detected GPU: {gpu_name} ({vram_gb} GB VRAM)")
    else:
        print("⚠️ No CUDA GPU detected — running on CPU (expect slow performance).")
        vram_gb = 0

    # Select settings automatically
    cfg = get_vllm_config(vram_gb)

    # Construct vLLM command
    command = [
        sys.executable,
        "-m", "vllm.entrypoints.openai.api_server",
        "--model", model_name,
        "--max-model-len", cfg["max_model_len"],
        "--gpu-memory-utilization", cfg["gpu_memory_utilization"],
        "--max-num-seqs", cfg["max_num_seqs"],
        "--tensor-parallel-size", "1",       # Force single GPU
        "--disable-log-requests"             # Reduce console spam
    ]

    print(f"\n--- 🚀 Starting vLLM server for {model_name} ---")
    print(f"GPU memory utilization: {cfg['gpu_memory_utilization']}")
    print(f"Max sequences: {cfg['max_num_seqs']}")
    print(f"Max model length: {cfg['max_model_len']}")
    print(f"Command: {' '.join(command)}")
    print("(Press CTRL+C to stop the server)\n")

    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting vLLM server: {e}")
    except KeyboardInterrupt:
        print("\n🛑 vLLM server stopped manually.")
    except FileNotFoundError:
        print("❌ 'vllm' module not found. Install it via:")
        print("   poetry add vllm")

if __name__ == "__main__":
    main()
