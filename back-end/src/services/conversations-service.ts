import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {db, dbAll, dbGet, dbRun} from './db';
import {Guid} from "../helpers/guid";
import {CreateConversationRequest} from "../types";

dotenv.config();
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const router = Router();

function authenticate(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth) return null;
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, ACCESS_SECRET) as { id: string };
        return payload.id;
    } catch {
        return null;
    }
}

router.post('/', async (req: Request, res: Response) : Promise<any> => {
    const userId = authenticate(req);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title } = req.body as CreateConversationRequest;
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
    }
    try {
        const conversationId = Guid.newGuid();
        await dbRun(
            'INSERT INTO Conversations(id, title, userId) VALUES(?,?,?)',
            [conversationId, title, userId]
        );
        res.status(201).json({ conversationId });
    } catch (err) {
        console.error('DB error creating conversation:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

 router.get('/', async (req: Request, res: Response) : Promise<any> => {
    const userId = authenticate(req);
    if (!Guid.isValid(userId)) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const rows = await dbAll<{ id: string; title: string; createdDateTime: string }>(
            'SELECT id, title, createdDateTime FROM Conversations WHERE userId = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

interface MessageWithResponse {
    id: string;
    parentMessageId: string | null;
    status: 'error' | 'success' | 'pending';
    description: string;
    decision: string;
    considerations: any[];
    createdDateTime: string;
    aiResponse: {
        id: string;
        decisionCategory: string;
        cognitiveBiases: any[];
        version: number;
        missingAlternatives: any[];
        createdDateTime: string;
    } | null;
}

router.get('/:conversationId', async (req: Request, res: Response) : Promise<any> => {
    const userId = authenticate(req);
    const { conversationId } = req.params;
    if (!Guid.isValid(userId)) return res.status(401).json({ error: 'Unauthorized' });
    if(!Guid.isValid(conversationId)) return res.status(404).json({ error: 'Conversation Not Found' });

    try {

        const convo = await dbGet<{ id: string }>(
            'SELECT id FROM Conversations WHERE id = ? AND userId = ?',
            [conversationId, userId]
        );
        if (!convo) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const rows = await dbAll<{
            id: string;
            parentMessageId: string | null;
            status: string;
            description: string;
            decision: string;
            considerations: string;
            messageCreatedDateTime: string;
            responseId: string | null;
            decisionCategory: string | null;
            cognitiveBiases: string | null;
            version: number | null;
            missingAlternatives: string | null;
            responseCreatedDateTime: string | null;
        }>(
            `  SELECT
         m.id,
         m.parentMessageId,
         m.status,
         m.description,
         m.decision,
         m.considerations,
         m.createdDateTime AS messageCreatedDateTime,
         a.id AS responseId,
         a.decisionCategory,
         a.cognitiveBiases,
         a.version,
         a.missingAlternatives,
         a.createdDateTime AS responseCreatedDateTime
       FROM Messages m
       LEFT JOIN (
         SELECT * FROM AiResponses
         WHERE (messageId, version) IN (
           SELECT messageId, MAX(version) FROM AiResponses GROUP BY messageId
         )
       ) a ON a.messageId = m.id
       WHERE m.userId = ? AND m.conversationId = ?
       ORDER BY m.createdDateTime ASC`,
            [userId, conversationId]
        );

        const result: MessageWithResponse[] = rows.map(r => ({
            id: r.id,
            parentMessageId: r.parentMessageId,
            status: r.status as any,
            description: r.description,
            decision: r.decision,
            considerations: JSON.parse(r.considerations),
            createdDateTime: r.messageCreatedDateTime,
            aiResponse: r.responseId
                ? {
                    id: r.responseId,
                    decisionCategory: r.decisionCategory!,
                    cognitiveBiases: JSON.parse(r.cognitiveBiases!),
                    version: r.version!,
                    missingAlternatives: JSON.parse(r.missingAlternatives!),
                    createdDateTime: r.responseCreatedDateTime!
                }
                : null
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


router.get('/:messageId/responses', async (req: Request, res: Response) : Promise<any> => {
    const userId = authenticate(req);
    const { messageId } = req.params;
    if (!Guid.isValid(userId)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if(!Guid.isValid(messageId)){
        return res.status(404).json({ error: 'Message not found' });
    }

    try {

        const msg = await dbAll<{ id: string }>(
            'SELECT id FROM Messages WHERE id = ? AND userId = ?',
            [messageId, userId]
        );
        if (!msg.length) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const rows = await dbAll<{
            id: string;
            decisionCategory: string;
            cognitiveBiases: string;
            version: number;
            missingAlternatives: string;
            createdDateTime: string;
        }>(
            `SELECT
         id,
         decisionCategory,
         cognitiveBiases,
         version,
         missingAlternatives,
         createdDateTime
       FROM AiResponses
       WHERE messageId = ?
       ORDER BY version ASC`,
            [messageId]
        );

        const result = rows.map(r => ({
            id: r.id,
            decisionCategory: r.decisionCategory,
            cognitiveBiases: JSON.parse(r.cognitiveBiases),
            version: r.version,
            missingAlternatives: JSON.parse(r.missingAlternatives),
            createdDateTime: r.createdDateTime
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export { router as conversationRouter };