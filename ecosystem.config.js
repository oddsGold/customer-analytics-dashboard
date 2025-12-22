// PM2 - це продакшен-процес менеджер для Node.js додатків з вбудованим балансувальником навантаження.
module.exports = {
    apps: [
        {
            // --- 1. NEXT.JS ДОДАТОК ---
            name: "nextjs-data",
            script: "./node_modules/next/dist/bin/next",
            args: "start -p 3002",
            // Замініть '/app' на ваш реальний шлях з README
            // cwd: "/var/www/nextjs-app",
            cwd: process.cwd(),
            interpreter: "node",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "production",
                PORT: 3002,
            },
            error_file: "/var/www/vhosts/data/logs/next-err.log",
            out_file: "/var/www/vhosts/data/logs/next-out.log",
            log_file: "/var/www/vhosts/data/logs/next-combined.log",
            // error_file: '/Users/oddsgold/nextjs-logs/next-err.log',
            // out_file: '/Users/oddsgold/nextjs-logs/next-out.log',
            // log_file: '/Users/oddsgold/nextjs-logs/next-combined.log',
            time: true
        },
        {
            // --- 2. SOCKET.IO СЕРВЕР ---
            name: "socket-server",
            script: "./node_modules/.bin/tsx", // Використовуємо 'tsx' як скрипт
            args: "socket-server.ts",
            // cwd: "/var/www/nextjs-app",
            cwd: process.cwd(),
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
            error_file: "/var/www/vhosts/data/logs/socket-err.log",
            out_file: "/var/www/vhosts/data/logs/socket-out.log",
            log_file: "/var/www/vhosts/data/logs/socket-combined.log",
            // error_file: '/Users/oddsgold/nextjs-logs/socket-err.log',
            // out_file: '/Users/oddsgold/nextjs-logs/socket-out.log',
            // log_file: '/Users/oddsgold/nextjs-logs/socket-combined.log',
            time: true
        },
        {
            // --- 3. ВОРКЕР ГЕНЕРАЦІЇ ЗВІТІВ ---
            name: "worker",
            script: "./node_modules/.bin/tsx",
            args: "worker.ts",
            // cwd: "/var/www/nextjs-app",
            cwd: process.cwd(),
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
            error_file: "/var/www/vhosts/data/logs/worker-err.log",
            out_file: "/var/www/vhosts/data/logs/worker-out.log",
            log_file: "/var/www/vhosts/data/logs/worker-combined.log",
            // error_file: '/Users/oddsgold/data/worker-err.log',
            // out_file: '/Users/oddsgold/nextjs-logs/worker-out.log',
            // log_file: '/Users/oddsgold/nextjs-logs/worker-combined.log',
            time: true
        },
        {
            // --- 4. ВОРКЕР ОЧИЩЕННЯ ---
            name: "cleanup-worker",
            script: "./node_modules/.bin/tsx",
            args: "cleanup-worker.ts",
            // cwd: "/var/www/nextjs-app",
            cwd: process.cwd(),
            instances: 1,
            exec_mode: "fork",
            watch: false,
            env: {
                NODE_ENV: "production",
            },
            error_file: "/var/www/vhosts/data/logs/cleanup-err.log",
            out_file: "/var/www/vhosts/data/logs/cleanup-out.log",
            log_file: "/var/www/vhosts/data/logs/cleanup-combined.log",
            // error_file: '/Users/oddsgold/nextjs-logs/cleanup-err.log',
            // out_file: '/Users/oddsgold/nextjs-logs/cleanup-out.log',
            // log_file: '/Users/oddsgold/nextjs-logs/cleanup-combined.log',
            time: true
        }
    ],
};