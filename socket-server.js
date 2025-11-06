import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import { env } from './shared/lib/env';

const PORT = parseInt(env('SOCKET_PORT', '3001'), 10);
const CLIENT_URL = env('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');

const app = express();
app.use(express.json());
app.use(cors({ origin: CLIENT_URL }));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "*", // Для розробки. В продакшені вкажіть ваш домен
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {

    // підписуємо користувача на його власну "кімнату"
    socket.on('subscribe', (userId) => {
        const roomName = `user-${userId}`;
        socket.join(roomName);
        console.log(`[Socket] ${socket.id} підписався на кімнату: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Клієнт відключився: ${socket.id}`);
    });
});

app.post('/job-complete', (req, res) => {
    const { userId, reportId, data } = req.body;

    if (!userId) {
        return res.status(400).send('Missing userId');
    }

    const roomName = `user-${userId}`;

    io.to(roomName).emit('report-complete', { reportId, data });

    res.status(200).send({ message: 'Notification sent' });
});

app.post('/job-failed', (req, res) => {
    const { userId, reportId, error } = req.body;

    if (!userId) {
        return res.status(400).send('Missing userId');
    }

    const roomName = `user-${userId}`;

    io.to(roomName).emit('report-failed', { reportId, error });

    res.status(200).send({ message: 'Failure notification sent' });
});

app.post('/job-progress', (req, res) => {
    const { userId, reportId, progress } = req.body;
    if (!userId || !reportId || progress === undefined) {
        return res.status(400).send('Missing parameters');
    }

    const roomName = `user-${userId}`;

    io.to(roomName).emit('report-progress', { reportId, progress });
    res.status(200).send({ message: 'Progress updated' });
});


server.listen(PORT, () => {
    console.log(`Socket.IO та HTTP сервер запущено на http://127.0.0.1:${PORT}`);
});