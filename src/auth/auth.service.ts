import prisma from '../prisma';
import jwt from 'jsonwebtoken';
import { hash as bcryptHash, compare as bcryptCompare } from '../utils';

if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("Missing JWT_ACCESS_SECRET");
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("Missing JWT_REFRESH_SECRET");
  }


const ACCESS_EXPIRES_IN: string = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN: string = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const createAccessToken = (userId: string) => {
    return jwt.sign(
      { userId },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    );
  };


  export const createRefreshToken = (userId: string) => {
    return jwt.sign(
      { userId },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );
  };  


export const saveRefreshTokenForUser = async (userId: string, token: string) => {
// store a hashed refresh token for safety
const hashed = await bcryptHash(token);
await prisma.user.update({ where: { id: userId }, data: { refreshToken: hashed } });
};


export const verifyRefreshToken = async (token: string) => {
try {
const payload = jwt.verify(token, REFRESH_SECRET) as { userId: string };
const user = await prisma.user.findUnique({ where: { id: payload.userId } });
if (!user || !user.refreshToken) return null;
const ok = await bcryptCompare(token, user.refreshToken);
if (!ok) return null;
return user;
} catch (err) {
return null;
}
};