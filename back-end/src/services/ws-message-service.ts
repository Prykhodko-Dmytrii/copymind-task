import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import {Guid} from "../helpers/guid";
import {db, dbGet, dbRun} from './db';
import dotenv from 'dotenv';
import {analyzeWithOpenAI} from "./llm-service";

dotenv.config();
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export function initWebSocket(server: http.Server) {
    const io = new IOServer(server, { cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true } });

    // Auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const payload = jwt.verify(token, ACCESS_SECRET) as { id: string };
            (socket as any).userId = payload.id;
            next();
        } catch {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId as string;
        console.log(`WS: user connected ${userId}`);

        socket.on('conversation:join', room => socket.join(room));
        socket.on('conversation:leave', room => socket.leave(room));

        socket.on('message:send', async ({ conversationId, description, decision, considerations }) => {
            const messageId = Guid.newGuid();
            try {
                await dbRun(
                    `INSERT INTO Messages(id,userId,conversationId,status,description,decision,considerations,createdDateTime)
           VALUES(?,?,?,?,?,?,?,datetime('now'))`,
                    [messageId, userId, conversationId, 'pending', description, decision, JSON.stringify(considerations)]
                );
                io.to(conversationId).emit('message:pending', { id:messageId, description, decision, considerations });

                const analysis = await analyzeWithOpenAI(description, decision, considerations);
                const responseId = Guid.newGuid();
                await dbRun(
                    `INSERT INTO AiResponses(id,messageId,decisionCategory,cognitiveBiases,version,missingAlternatives,createdDateTime)
           VALUES(?,?,?,?,?,?,datetime('now'))`,
                    [responseId, messageId, analysis.decisionCategory, JSON.stringify(analysis.cognitiveBiases), 0, JSON.stringify(analysis.missingAlternatives)]
                );
                await dbRun('UPDATE Messages SET status = ? WHERE id = ?', ['success', messageId]);
                io.to(conversationId).emit('message:processed', { messageId, analysis, responseId,version:0 });
            } catch (err) {
                console.error(err);
                await dbRun('UPDATE Messages SET status = ? WHERE id = ?', ['error', messageId]);
                io.to(conversationId).emit('message:error', { messageId, error: (err as Error).message });
            }
        });

        socket.on('message:retry', async ({ conversationId, messageId }) => {
            try {
                const row = await dbGet<{ description:string; decision:string; considerations:string }>(
                    'SELECT description,decision,considerations FROM Messages WHERE id = ?', [messageId]
                );
                if (!row) throw new Error('Message not found');
                const considerations = JSON.parse(row.considerations);
                const analysis = await analyzeWithOpenAI(row.description, row.decision, considerations);
                const verRow = await dbGet<{ maxVer:number }>(
                    'SELECT MAX(version) as maxVer FROM AiResponses WHERE messageId = ?', [messageId]
                );
                const version = verRow?.maxVer ?? 0;
                const responseId = Guid.newGuid();
                await dbRun(
                    `INSERT INTO AiResponses(id,messageId,decisionCategory,cognitiveBiases,version,missingAlternatives,createdDateTime)
           VALUES(?,?,?,?,?,?,datetime('now'))`,
                    [responseId, messageId, analysis.decisionCategory, JSON.stringify(analysis.cognitiveBiases), version, JSON.stringify(analysis.missingAlternatives)]
                );
                await dbRun('UPDATE Messages SET status = ? WHERE id = ?', ['success', messageId]);
                io.to(conversationId).emit('message:retrySuccess', { messageId, analysis, responseId,version:0 });
            } catch (err) {
                console.error(err);
                io.to(conversationId).emit('message:retryError', { messageId, error: (err as Error).message });
            }
        });

        socket.on('message:regenerate', async ({ conversationId, messageId }) => {
            try {
                const row = await dbGet<{ description:string; decision:string; considerations:string }>(
                    'SELECT description,decision,considerations FROM Messages WHERE id = ?', [messageId]
                );
                if (!row) throw new Error('Message not found');
                const considerations = JSON.parse(row.considerations);
                const analysis = await analyzeWithOpenAI(row.description, row.decision, considerations);
                const verRow = await dbGet<{ maxVer:number }>('SELECT MAX(version) as maxVer FROM AiResponses WHERE messageId = ?', [messageId]);
                const nextVersion = (verRow?.maxVer ?? 0) + 1;
                const responseId =Guid.newGuid();

                await dbRun(
                    `INSERT INTO AiResponses(id,messageId,decisionCategory,cognitiveBiases,version,missingAlternatives,createdDateTime)
           VALUES(?,?,?,?,?,?,datetime('now'))`,
                    [responseId, messageId, analysis.decisionCategory, JSON.stringify(analysis.cognitiveBiases), nextVersion, JSON.stringify(analysis.missingAlternatives)]
                );

                await dbRun('UPDATE Messages SET status = ? WHERE id = ?', ['success', messageId]);
                io.to(conversationId).emit('message:regenerateSuccess', { messageId, analysis, responseId,version:nextVersion });
            } catch (err) {
                console.error(err);
                io.to(conversationId).emit('message:regenerateError', { messageId, error: (err as Error).message });
            }
        });
    });
}