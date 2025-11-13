# Design System Rules — Clinico Mobile App

This document describes the design system integration rules and how to map Figma Phase 7 designs into the Clinico Flutter frontend.

## 1. Token Definitions

Where tokens live
- Colors, text styles and spacing live in `frontend/clinico_mobile_app/lib/core/theme/`.
- If missing, create:
  - `app_colors.dart` — color constants
  - `app_text_styles.dart` — TextStyle presets
  - `app_dimensions.dart` — spacing and size constants

Format
- Use Dart `const` values and classes (e.g. `AppColors.kPrimary`) so tokens are compile-time constants.
- Keep tokens grouped by category: colors, textSizes, radii, elevations, spacing.

Transformation
- Token values should map 1:1 from Figma design tokens. If changes are needed, document them with a rationale in this file.

## 2. Component Library

Where components live
- Reusable widgets: `frontend/clinico_mobile_app/lib/shared/widgets/`.
- Feature-specific components: each feature under `lib/features/<feature>/presentation/widgets/`.

Component architecture
- Keep presentational widgets stateless and small. Use composition to build complex layouts.
- Provide `factory` constructors for variants when helpful and `const` constructors where possible.

Documentation
- For each atomic component, add a small README comment with usage examples.

## 3. Frameworks & Libraries

- Flutter (stable channel recommended for this project)
- State management: `flutter_bloc`
- WebRTC: `flutter_webrtc`
- Networking: `http`, `socket_io_client`

## 4. Asset Management

Where to store assets
- Figma-sourced images for Phase 7 should be placed in `frontend/clinico_mobile_app/assets/figma/phase7/`.
- Icons remain in `frontend/clinico_mobile_app/assets/icons/`.

Referencing assets
- Add asset directories to `pubspec.yaml` under the `flutter/assets:` section.
- Example:
  assets:
    - assets/figma/phase7/

Optimization
- Prefer SVG for vector assets (icons) and PNG/WebP for raster images.
- Keep image sizes scaled for the largest target density; runtime downscaling is acceptable.

CDN
- Not used in mobile app; keep assets bundled in the app.

## 5. Icon System

- Put icons under `assets/icons/` and name them kebab-case (e.g., `ic-profile.svg`).
- Load icons with `SvgPicture.asset('assets/icons/ic-profile.svg')`.

## 6. Styling Approach

- Centralized theme in `lib/core/theme/`:
  - `app_theme.dart` exposes `ThemeData` using `AppColors` and `AppTextStyles`.
- No global CSS; use themes and widget-level styling.
- Responsive rules: use `MediaQuery` breakpoints in helper utils.

## 7. Project Structure

High-level summary (already present):
```
lib/
├── core/
│   ├── theme/
│   ├── utils/
│   └── network/
├── features/
│   └── <feature>/
└── shared/
```

## How to use Figma MCP assets in this repo
1. I will fetch screenshots for each Phase 7 node using the MCP Figma API.
2. Place images in `frontend/clinico_mobile_app/assets/figma/phase7/` and add the folder to `pubspec.yaml`.
3. For each screen, create a placeholder widget under `lib/features/profile_phase7/` (or appropriate feature) using the Figma image as a design reference.

## Files to add (recommended)
- `frontend/clinico_mobile_app/lib/core/theme/app_colors.dart`
- `frontend/clinico_mobile_app/lib/core/theme/app_text_styles.dart`
- `frontend/clinico_mobile_app/lib/core/theme/app_theme.dart`
- `frontend/clinico_mobile_app/assets/figma/phase7/` (images downloaded from Figma)
- `documentation/design_system_rules.md` (this file)

## Example token code snippets

app_colors.dart
```dart
class AppColors {
  static const Color kPrimary = Color(0xFF0A6CF5);
  static const Color kTextPrimary = Color(0xFF1F1F1F);
  static const Color kSurface = Color(0xFFF7F8FA);
}
```

app_text_styles.dart
```dart
class AppTextStyles {
  static final TextStyle headline = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: AppColors.kTextPrimary,
  );
}
```

## Next steps I will take
- Download Phase 7 screenshots into `frontend/clinico_mobile_app/assets/figma/phase7/` and update `pubspec.yaml`.
- Create minimal placeholder widgets for each Phase 7 screen and wire routes.

If you want me to follow a different token/component layout, tell me and I will adapt this doc.
