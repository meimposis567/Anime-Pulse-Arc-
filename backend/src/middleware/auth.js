import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Issues a signed access token.
 *
 * The signing key comes from validated config — there is deliberately no
 * `|| 'dev_secret'` fallback, because a publicly known key lets anyone mint
 * a token for any account, including an admin one.
 */
export function signToken(user){
  return jwt.sign(
    { id: String(user._id), username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn, algorithm: config.jwtAlgorithm }
  );
}

export function authRequired(req, res, next){
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if(!token) return res.status(401).json({error:'Missing token'});
  try{
    // Pinning the algorithm blocks "alg" confusion attacks, where a token
    // is presented as `none` or as RS256 with our secret used as a public key.
    const payload = jwt.verify(token, config.jwtSecret, {
      algorithms: [config.jwtAlgorithm],
    });
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  }catch(e){
    return res.status(401).json({error:'Invalid or expired token'});
  }
}

/** Guards routes that only an administrator may reach. */
export function adminRequired(req, res, next){
  if(!req.user || req.user.role !== 'admin'){
    return res.status(403).json({error:'Forbidden'});
  }
  next();
}
