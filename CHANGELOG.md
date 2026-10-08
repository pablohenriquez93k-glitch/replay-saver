# Changelog

## 1.0.3 - 2026-10-08
- Exit save: leaving after the match ends now waits until the replay file is updated instead of a fixed delay. If the game never confirms the write, it leaves after 15 s anyway (the replay may then be missing the last part).
- Fixed a leftover timer that could make the game leave before the exit save finished.
- Resume Game is only blocked for auto-saved replays, not for manual saves with "AUTO-REPLAY" in the name.
- The Load Game button layout no longer overrides the bar's CSS.

## 1.0.2 - 2026-10-06
- Updated for Planetary Annihilation build 124683. Internal maintenance.

## 1.0.1 - 2026-09-30
- Resumes the sim after saving, saves on Quit, asks before switching modes, blocks Resume Game on auto-saves. MIT license.

## 1.0.0 - 2026-09-27
- First release: auto-saves a replay at match end; Watch Replay button in Load Game; setting in Gameplay.
