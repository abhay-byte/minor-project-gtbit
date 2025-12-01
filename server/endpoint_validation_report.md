## POST /api/signaling/room
- **Status:** ✅ Tested & Validated
- **Date:** 2025-12-01
- **Unit Tests:** Pass
- **Runtime Test:** Pass
- **Database Impact:** Updates `appointments.consultation_link`
- **Notes:** Generates UUID-based room IDs and constructs consultation links

## GET /api/signaling/validate/:roomId
- **Status:** ✅ Tested & Validated
- **Date:** 2025-12-01
- **Unit Tests:** Pass
- **Runtime Test:** Pass
- **Database Impact:** Reads from `appointments`, `patients`, `doctors`, `users`
- **Notes:** Validates room access and returns user role and identity