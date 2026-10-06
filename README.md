# Replay Saver

Client (UI) mod for **Planetary Annihilation: TITANS**.

## Features

- **Auto-save replay at match end.** When a single-player match ends (you win, lose or surrender), the full match is saved as `AI Skirmish <date> AUTO-REPLAY`. When you leave the match, the same file is overwritten so the replay also includes what happened after your defeat (e.g. AIs still fighting in FFA). Quitting a match in progress from the menu counts as a surrender and is saved too.
- **Watch Replay button** in *Load Game*. Opens any local save as a replay, including mid-game saves, without modifying the file. *Resume Game* keeps working as before, except on auto-saves: they are replays and cannot be resumed, so the button is greyed out for them. If the save needs the other game mode, you are asked to confirm the switch first.
- **Setting** in *Settings → Gameplay*: "Auto-save Replay at Match End" (ON by default).

## Limits

- Only runs in matches with a single human player. Never in multiplayer or Galactic War, and not while watching a replay.
- The server refuses to save while another client is connected, so **a spectator watching your match prevents the save** (the same limit as the in-game Save menu). No message is shown.
- Matches with only AI players (you observing) are not saved.

## Install

1. Copy the `modinfo.json`, `README.md` and `ui` files to `%LOCALAPPDATA%\Uber Entertainment\Planetary Annihilation\mods\com.pa.pablo.replaysaver` (the game mounts this folder as `/client_mods/`; `com.pa.pablo.replaysaver` must contain `modinfo.json` directly). If you downloaded the GitHub `main.zip`, its content is inside a `replay-saver-main` folder: copy what is inside it.
2. Enable **Replay Saver** in *Community Mods → Installed* and restart the game.

## How it works

- Uses the game's own `write_replay` message (the same one the in-game *Save* menu uses). The server saves with type `replay`, so the file opens as a replay.
- Scene hooks only (`live_game`, `save_game_browser`, `settings`); no game files are overwritten.
- Texts in English and Spanish.

## License

MIT, see [LICENSE](LICENSE). (c) 2026 Pablo Henriquez.

---

# Replay Saver (español)

Mod de cliente (UI) para **Planetary Annihilation: TITANS**.

## Qué hace

- **Guarda el replay al terminar la partida.** Cuando termina una partida de un solo jugador (ganas, pierdes o te rindes), guarda la partida completa como `AI Skirmish <fecha> AUTO-REPLAY`. Al salir de la partida sobrescribe el mismo archivo, así el replay incluye lo que pasó después de tu derrota (por ejemplo, las IA peleando en FFA). Salir con Menú → Quit en plena partida cuenta como rendirse y también se guarda.
- **Botón "Ver replay"** en *Partidas guardadas*. Abre cualquier guardado local como replay, incluso los guardados a mitad de partida, sin modificar el archivo. *Retomar partida* funciona igual que antes, salvo en los autoguardados: son replays y no se pueden retomar, así que el botón se ve gris. Si el guardado necesita el otro modo de juego, primero te pide confirmar el cambio.
- **Opción** en *Ajustes → Jugabilidad*: "Guardar replay al terminar la partida" (activada por defecto).

## Límites

- Solo funciona en partidas con un único jugador humano. Nunca en multijugador ni Guerra Galáctica, ni viendo un replay.
- El servidor se niega a guardar si hay otro cliente conectado, así que **un espectador en tu partida impide el guardado** (el mismo límite del menú Guardar del juego). No se muestra ningún mensaje.
- Las partidas solo de IA en las que tú observas no se guardan.

## Instalación

1. Copia `modinfo.json`, `README.md` y la carpeta `ui` a `%LOCALAPPDATA%\Uber Entertainment\Planetary Annihilation\mods\com.pa.pablo.replaysaver` (el juego monta esa carpeta como `/client_mods/`; `com.pa.pablo.replaysaver` debe contener `modinfo.json` directamente). Si descargaste el `main.zip` de GitHub, el contenido viene dentro de la carpeta `replay-saver-main`: copia lo que hay dentro.
2. Activa **Replay Saver** en *Community Mods → Instalados* y reinicia el juego.

## Licencia

MIT, ver [LICENSE](LICENSE). (c) 2026 Pablo Henriquez.
