# Replay Saver

Client (UI) mod for **Planetary Annihilation: TITANS** (build 124674).

## Features

- **Auto-save replay at match end.** When a single-player match ends (you win, lose or surrender), the full match is saved as `AI Skirmish <date> AUTO-REPLAY`. When you leave the match, the same file is overwritten so the replay also includes what happened after your defeat (e.g. AIs still fighting in FFA).
- **Watch Replay button** in *Load Game*. Opens any local save as a replay, including mid-game saves, without modifying the file. *Resume Game* keeps working as before.
- **Setting** in *Settings → Gameplay*: "Auto-save Replay at Match End" (ON by default).

Auto-save only runs in matches with a single human player. It never runs in multiplayer, Galactic War or while watching a replay.

## Install

1. Copy this folder to `%LOCALAPPDATA%\Uber Entertainment\Planetary Annihilation\mods\com.pa.pablo.replaysaver`.
2. Enable **Replay Saver** in *Community Mods → Installed* and restart the game.

## How it works

- Uses the game's own `write_replay` message (the same one the in-game *Save* menu uses). The server saves with type `replay`, so the file opens as a replay.
- Scene hooks only (`live_game`, `save_game_browser`, `settings`); no game files are overwritten.
- Texts in English and Spanish.

---

# Replay Saver (español)

Mod de cliente (UI) para **Planetary Annihilation: TITANS** (build 124674).

## Qué hace

- **Guarda el replay al terminar la partida.** Cuando termina una partida de un solo jugador (ganas, pierdes o te rindes), guarda la partida completa como `AI Skirmish <fecha> AUTO-REPLAY`. Al salir de la partida sobrescribe el mismo archivo, así el replay incluye lo que pasó después de tu derrota (por ejemplo, las IA peleando en FFA).
- **Botón "Ver replay"** en *Partidas guardadas*. Abre cualquier guardado local como replay, incluso los guardados a mitad de partida, sin modificar el archivo. *Retomar partida* funciona igual que antes.
- **Opción** en *Ajustes → Jugabilidad*: "Guardar replay al terminar la partida" (activada por defecto).

Solo guarda en partidas con un único jugador humano. Nunca en multijugador, Guerra Galáctica ni viendo un replay.

## Instalación

1. Copia esta carpeta a `%LOCALAPPDATA%\Uber Entertainment\Planetary Annihilation\mods\com.pa.pablo.replaysaver`.
2. Activa **Replay Saver** en *Community Mods → Instalados* y reinicia el juego.
