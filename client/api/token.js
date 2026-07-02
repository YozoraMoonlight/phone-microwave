// Vercel serverless version of the token endpoint (mirrors server/index.js).
// Deployed at /api/token; vercel.json rewrites /token -> /api/token so the
// frontend's existing fetch('/token') works unchanged in production.
import { AccessToken } from 'livekit-server-sdk';

const {
  LIVEKIT_API_KEY = 'devkey',
  LIVEKIT_API_SECRET = 'secret',
  LIVEKIT_URL = 'ws://localhost:7880',
} = process.env;

export default async function handler(req, res) {
  const room = String(req.query.room || '').trim();
  const identity = String(req.query.identity || '').trim();
  const name = String(req.query.name || identity).trim();

  if (!room || !identity) {
    return res.status(400).json({ error: 'room and identity are required' });
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
    name,
    // token is valid for 6 hours; plenty for a session
    ttl: '6h',
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  res.status(200).json({ token, url: LIVEKIT_URL });
}
