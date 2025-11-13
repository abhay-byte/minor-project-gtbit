# Clinico Mobile App - TODO

Phase 1 — Onboarding & First-run flow (priority)

Status Legend:
- ✅ Completed
- 🔄 In Progress
- ⏳ Pending
- 🚫 Blocked

## Phase 1 (Screens)

- ✅ Splash screen
  - Path (existing): `frontend/clinico_mobile_app/lib/screens/splash/splash_screen.dart`
  - Figma reference: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-8632&t=Z7OXtOt1J5kPOa0m-4

- ✅ Language selection screen
  - Path (existing): `frontend/clinico_mobile_app/lib/screens/onboarding/language_selection_screen.dart`
  - Figma reference: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-8543&t=Z7OXtOt1J5kPOa0m-4

- ✅ Onboarding — Page 1
  - Path (existing): `frontend/clinico_mobile_app/lib/screens/onboarding/onboarding_screen.dart` (page 1 is part of the PageView)
  - Figma reference: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-7221&t=Z7OXtOt1J5kPOa0m-4

- ✅ Onboarding — Page 2
  - Path (existing): `frontend/clinico_mobile_app/lib/screens/onboarding/onboarding_screen.dart` (page 2 is part of the PageView)
  - Figma reference: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-7670&t=Z7OXtOt1J5kPOa0m-4

- ✅ Onboarding — Page 3
  - Path (existing): `frontend/clinico_mobile_app/lib/screens/onboarding/onboarding_screen.dart` (page 3 is part of the PageView)
  - Figma reference: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-8106&t=Z7OXtOt1J5kPOa0m-4

## Notes and Next Steps

- Verified existing files for splash, language selection and onboarding PageView exist in `lib/screens/`.
- Next small tasks (suggested):
  - 🔄 Add unit/widget tests for onboarding flow (PageView navigation, language selection persistence).
  - ⏳ Hook onboarding completion to persistent flag (e.g., shared_preferences) so it doesn't show on subsequent launches.
  - 🔄 Extract design tokens (colors, text styles) into `lib/core/theme/` and replace hardcoded values.

## How I validated

- Checked `frontend/clinico_mobile_app/lib/screens/splash/splash_screen.dart` and onboarding files.

---
Generated: 10 Nov 2025
