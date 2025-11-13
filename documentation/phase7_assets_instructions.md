# Phase 7 Figma Assets — Download Instructions

This project includes a helper script to download Phase 7 screenshots/assets from Figma and save them into the Flutter app's assets folder.

Steps:

1. Get a Figma Personal Access Token (PAT)
   - Go to https://www.figma.com/developers/api and create a personal access token.

2. Export node list
   - The manifest is already prepared at `scripts/figma_phase7_manifest.json`. It maps Figma node IDs to filenames.

3. Run the downloader

```bash
# from the repo root
export FIGMA_TOKEN=your_token_here
python3 scripts/download_figma_assets.py
```

4. Verify files are saved in `frontend/clinico_mobile_app/assets/figma/phase7/`.

5. Run `flutter pub get` and `flutter analyze` in the Flutter project directory to ensure assets are picked up.

Notes:
- The script uses Figma's images API to get direct PNG URLs. You must have access to the Figma file referenced in the manifest.
- If you prefer to manually download images from the Figma UI, save them with the filenames in the manifest and put them in the assets folder.
