import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AccessToken } from 'livekit-server-sdk';

const {
  LIVEKIT_API_KEY = 'devkey',
  LIVEKIT_API_SECRET = 'secret',
  LIVEKIT_URL = 'ws://localhost:7880',
  PORT = 3001,
} = process.env;

const app = express();
app.use(cors());

// Mint a join token for a given room + participant identity.
// GET /token?room=my-room&identity=alice&name=Alice
app.get('/token', async (req, res) => {
  const room = String(req.query.room || '').trim();
  const identity = String(req.query.identity || '').trim();
  const name = String(req.query.name || identity).trim();

  if (!room || !identity) {
    return res.status(400).json({ error: 'room and identity are required' });
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name,
    // token is valid for 6 hours; plenty for a demo session
    ttl: '6h',
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  // toJwt() is async in livekit-server-sdk v2+
  const token = await at.toJwt();
  res.json({ token, url: LIVEKIT_URL });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Token server listening on http://localhost:${PORT}`);
  console.log(`  SFU URL handed to clients: ${LIVEKIT_URL}`);
});
