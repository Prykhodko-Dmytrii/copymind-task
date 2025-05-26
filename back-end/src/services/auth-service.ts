import { Router, Request, Response } from 'express';
import {db, dbGet, dbRun} from './db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {LoginRequest, RegisterRequest} from "../types";
import {Guid} from "../helpers/guid";

dotenv.config();
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export interface JwtPayload {
    id: string;
    email: string;
    userName: string;
}

const router = Router();

router.post('/register', async (req: Request, res: Response)  : Promise<any> => {
    try {
        const { userName, email, password } = req.body as RegisterRequest
        if (!userName || !email || !password) {
            return res.status(400).json({ error: 'userName, email and password required.' });
        }

        const hash = await bcrypt.hash(password, 10);
        const id = Guid.newGuid();
        await dbRun(
            'INSERT INTO Users(id, userName, email, password) VALUES(?,?,?,?)',
            [id, userName, email, hash]
        );

        res.status(201).json({ id, userName, email });
    } catch (err: any) {
        console.error(err);
        const msg = err.message.includes('UNIQUE') ? 'Email already taken.' : 'Internal error.';
        res.status(500).json({ error: msg });
    }
});

router.post('/login', async (req: Request, res: Response) : Promise<any> => {
    try {
        const { email, password } = req.body as LoginRequest;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required.' });
        }

        const user = await dbGet<{ id: string; email: string; password: string; userName: string }>(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const payload: JwtPayload = { id: user.id, email: user.email, userName: user.userName };
        const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

        await dbRun('INSERT INTO RefreshTokens(token, userId) VALUES(?,?)', [refreshToken, user.id]);

        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' })
            .json({ accessToken, userName: user.userName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/token', async (req: Request, res: Response) : Promise<any> => {
    try {
        const token = req.cookies.refreshToken as string | undefined;
        if (!token) {
            return res.status(401).json({ error: 'No refresh token.' });
        }

        const row = await dbGet<{ token: string; userId: string }>(
            'SELECT * FROM RefreshTokens WHERE token = ?',
            [token]
        );
        if (!row) {
            return res.status(403).json({ error: 'Invalid refresh token.' });
        }

        const user = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, userName: user.userName },
            ACCESS_SECRET,
            { expiresIn: '15m' }
        );

       return  res.json({ accessToken });
    } catch (err) {
        console.error(err);
        return res.status(403).json({ error: 'Invalid refresh token.' });
    }
});

router.post('/logout', async (req: Request, res: Response) : Promise<any> => {
    try {
        const token = req.cookies.refreshToken as string | undefined;
        if (token) {
            await dbRun('DELETE FROM RefreshTokens WHERE token = ?', [token]);
        }
        return res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' }).sendStatus(200).json(true);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.get('/me', async (req: Request, res: Response) : Promise<any> => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload;
        return res.json({ email: payload.email, userName: payload.userName });
    } catch {
        return res.status(401).json({ error: 'Unauthorized' });
    }
});

export { router as authRouter };
