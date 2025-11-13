# Clinico Mobile App — Frontend TODO

Phase 1 — Onboarding & First-run flow (priority)

Status Legend:
- ✅ Completed
- 🔄 In Progress
- ⏳ Pending
- 🚫 Blocked

## Phase 1 (Screens)

- 🔄 Splash screen
  - Path: `frontend/clinico_mobile_app/lib/screens/splash/splash_screen.dart`
  - Figma: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-8632&t=Z7OXtOt1J5kPOa0m-4

- 🔄 Language selection screen
  - Path: `frontend/clinico_mobile_app/lib/screens/onboarding/language_selection_screen.dart`
  - Figma: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-8543&t=Z7OXtOt1J5kPOa0m-4

- 🔄 Onboarding — Page 1
  - Path: `frontend/clinico_mobile_app/lib/screens/onboarding/onboarding_screen.dart` (PageView: page 1)
  - Figma: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-7221&t=Z7OXtOt1J5kPOa0m-4

- 🔄 Onboarding — Page 2
  - Path: `frontend/clinico_mobile_app/lib/screens/onboarding/onboarding_screen.dart` (PageView: page 2)
  - Figma: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-7670&t=Z7OXtOt1J5kPOa0m-4

- 🔄 Onboarding — Page 3
  - Path: `frontend/clinico_mobile_app/lib/screens/onboarding/onboarding_screen.dart` (PageView: page 3)
  - Figma: https://www.figma.com/design/dFDrEe30gtdNb1QFVKWNv2/Clinico---UI-UX?node-id=1-8106&t=Z7OXtOt1J5kPOa0m-4

## Phase 1 Implementation checklist

- ✅ Confirm app starts at `SplashScreen` (already wired in `lib/main.dart`)
- 🔄 Validate navigation: Splash -> Language -> Onboarding (current files use Navigator and PageView)
- ✅ Persist onboarding completion — implemented using `shared_preferences` (`seenOnboarding` flag)

  Implementation notes:
  - Added `shared_preferences: ^2.1.0` to `pubspec.yaml`.
  - `SplashScreen` now checks `seenOnboarding` and skips to signup if true.
  - `OnboardingScreen` sets `seenOnboarding = true` when the user taps "Get Started".

## Next tasks (suggested order)

1. Implement persistent first-run flag (shared_preferences).
2. Extract `AppColors`, `AppTextStyles`, and `AppDimensions` into `lib/core/theme/` and refactor hard-coded values.
3. Add widget tests for Splash navigation, language selection persistence, and onboarding PageView.

## Notes

- Files for Phase 1 were already present; this `todo.md` centralizes the plan and next steps as required.

---
Generated: 10 Nov 2025
