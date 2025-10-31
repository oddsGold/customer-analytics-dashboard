import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import cors from 'cors';
import { env } from './shared/lib/env';

const PORT = parseInt(env('SOCKET_PORT', '3001'), 10);
const CLIENT_URL = env('CLIENT_URL', 'http://localhost:3000');

const app = express();
app.use(express.json()); // Дозволяємо серверу читати JSON
app.use(cors({ origin: CLIENT_URL }));  // Дозволяємо підключення з вашого Next.js (http://localhost:3000)

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // origin: "*", // Для розробки. В продакшені вкажіть ваш домен
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

// 1. Логіка для підключення фронтенду
io.on('connection', (socket) => {
    console.log(`[Socket] Клієнт підключився: ${socket.id}`);

    // Коли фронтенд підключається, він має сказати "хто він"
    // Ми "підписуємо" його на його власну "кімнату"
    socket.on('subscribe', (userId) => {
        const roomName = `user-${userId}`;
        socket.join(roomName);
        console.log(`[Socket] ${socket.id} підписався на кімнату: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Клієнт відключився: ${socket.id}`);
    });
});

// 2. Логіка для Воркера (куди він стукає)
// Ваш воркер робить сюди POST-запит
app.post('/job-complete', (req, res) => {
    const { userId, reportId, data } = req.body;

    if (!userId) {
        return res.status(400).send('Missing userId');
    }

    const roomName = `user-${userId}`;
    console.log(`[HTTP] Отримано /job-complete для ${roomName}, reportId: ${reportId}`);

    // Ми відправляємо подію 'report-complete' ТІЛЬКИ в кімнату цього юзера
    io.to(roomName).emit('report-complete', { reportId, data });

    res.status(200).send({ message: 'Notification sent' });
});

// 3. Логіка для помилок
app.post('/job-failed', (req, res) => {
    const { userId, reportId, error } = req.body;

    if (!userId) {
        return res.status(400).send('Missing userId');
    }

    const roomName = `user-${userId}`;
    console.log(`[HTTP] Отримано /job-failed для ${roomName}, reportId: ${reportId}`);

    // Відправляємо подію про помилку
    io.to(roomName).emit('report-failed', { reportId, error });

    res.status(200).send({ message: 'Failure notification sent' });
});


server.listen(PORT, () => {
    console.log(`Socket.IO та HTTP сервер запущено на http://127.0.0.1:${PORT}`);
});