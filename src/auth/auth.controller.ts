import { Request, Response } from 'express';
import prisma from '../prisma';
import { hash, compare } from '../utils';
import {
  createAccessToken,
  createRefreshToken,
  saveRefreshTokenForUser,
  verifyRefreshToken,
} from './auth.service';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already used' });

    const hashed = await hash(password);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    await saveRefreshTokenForUser(user.id, refreshToken);

    return res.json({ user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    await saveRefreshTokenForUser(user.id, refreshToken);

    return res.json({ user: { id: user.id, email: user.email, name: user.name }, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Missing token' });
    const user = await verifyRefreshToken(refreshToken);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    const accessToken = createAccessToken(user.id);
    const newRefresh = createRefreshToken(user.id);
    await saveRefreshTokenForUser(user.id, newRefresh);

    return res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body; // optional: accept userId or use auth
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};