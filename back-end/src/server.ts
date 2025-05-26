import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './services';
import { initWebSocket } from './services';
import {conversationRouter} from "./services/conversations-service";

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;
const CORS = process.env.CORS_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: CORS, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter);
app.use('/conversations', conversationRouter);

initWebSocket(server);

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));