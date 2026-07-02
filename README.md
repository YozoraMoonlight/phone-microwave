# Phone Microwave — FGL Comms Link

> Steins;Gate-themed group video call built with React, Vite & LiveKit. **El Psy Kongroo.**

A retro *Future Gadget Lab* interface sitting on top of real WebRTC. Worldlines are
rooms, lab members are participants, and "attempting convergence" is a live media
handshake — not a mockup.

<!-- Add a screenshot/GIF here -->
<!-- ![screenshot](docs/screenshot.png) -->

## Features

- **Group video & audio** — real multi-party calls over a LiveKit SFU
- **Steins;Gate aesthetic** — worldline IDs, lab member numbers, convergence sequences
- **Live controls** — mic, camera, and disconnect all wired to real tracks
- **Draggable self-view** and a responsive gallery grid
- **Zero raw WebRTC** — handled by `livekit-client` + `@livekit/components-react`

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind, Framer Motion |
| Media | LiveKit (SFU + client SDK) |
| Token backend | Express + `livekit-server-sdk` |

## How it maps

| In the UI | Under the hood |
|---|---|
| Worldline ID (`1.048596`) | Room name |
| Lab Member No. | Participant identity |
| OPEN WORLDLINE | Create + join a room |
| CONVERGE | Join an existing room |
| ATTEMPTING CONVERGENCE | The real connect + track publish |
| Mic / Cam / END | Live track toggles + disconnect |

## Architecture

```
client (React) ──GET /token──► token backend (Express)
      │  connect(wss, jwt)
      ▼
   LiveKit SFU  ← relays media between all lab members
```

The backend's only job is minting join tokens. The client fetches `/token`, then
connects straight to the SFU.

## Quick start (local)

Requires Node 18+. From the repo root:

```bash
npm install     # installs root + client + server deps
npm run dev     # starts the SFU, token backend, and client together
```

Then open **http://localhost:5174**.

`npm run dev` uses [`concurrently`](https://www.npmjs.com/package/concurrently) to
launch all three (LIVEKIT / SERVER / CLIENT). Prefer separate terminals?

```bash
npm run livekit   # local LiveKit SFU (dev mode)
npm start         # token backend on :3001
npm run client    # Vite dev server on :5174
```

> The bundled `livekit-server.exe` is Windows-only and git-ignored. Grab the build
> for your OS from the [LiveKit releases](https://github.com/livekit/livekit/releases).

### Trying a call

1. Click **OPEN WORLDLINE**, allow camera + mic, and note the 7-digit worldline in
   the header (e.g. `1.048596`).
2. In another tab or device, click **CONVERGE** and enter those digits.
3. You'll appear in each other's grid. Mic / Cam toggle live; END leaves the worldline.

## Deployment

Ship it with two services — no database or extra backend host required:

- **[LiveKit Cloud](https://cloud.livekit.io)** — the media SFU
- **[Vercel](https://vercel.com)** — hosts the frontend **and** the token endpoint (serverless function)

**1. LiveKit Cloud** — create a project and copy your `LIVEKIT_URL` (`wss://…`),
`LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.

**2. Token endpoint** — the local Express server (`server/index.js`) becomes a Vercel
serverless function so the frontend's `/token` fetch works in production.

**3. Vercel project settings**

| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**4. Environment variables** (Vercel → Settings → Environment Variables)

```
LIVEKIT_API_KEY      = your key
LIVEKIT_API_SECRET   = your secret
LIVEKIT_URL          = wss://yourproject.livekit.cloud
VITE_LIVEKIT_URL     = wss://yourproject.livekit.cloud
```

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `VITE_LIVEKIT_URL` | client build | SFU URL the browser connects to |
| `LIVEKIT_URL` | server | SFU URL handed back with each token |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | server | Signing credentials for join tokens |

For local dev these default to LiveKit's dev-mode values (`ws://localhost:7880`,
`devkey` / `secret`) — fine for testing, **never** for production.

## Key files

- `client/src/App.tsx` — phase state (`lobby → connecting → call`) + room lifecycle
- `client/src/hooks/useRoomConnection.ts` — owns the LiveKit `Room`
- `client/src/lib/livekit.ts` — SFU URL + token fetch
- `client/src/components/ParticipantView.tsx` — gallery grid + self PiP
- `client/src/components/CallControls.tsx` — mic / camera / disconnect
- `server/index.js` — the `GET /token` endpoint

## License

MIT

---