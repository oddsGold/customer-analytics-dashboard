// PM2 - це продакшен-процес менеджер для Node.js додатків з вбудованим балансувальником навантаження.
    module.exports = {
    apps: [
        {
            name: "nextjs-app",
            script: "./node_modules/next/dist/bin/next",
            args: "start -p 3000",
            cwd: "/app",
            interpreter: "node",
            instances: 1, // Використати всі CPU
            exec_mode: "fork", // ОДИН процес на додаток
            watch: false, // Не слідкувати за змінами файлів
            env: {
                NODE_ENV: "production",
                PORT: 3000,
                HOSTNAME: "0.0.0.0"
            },
            error_file: "/app/.pm2/logs/err.log",
            out_file: "/app/.pm2/logs/out.log",
            log_file: "/app/.pm2/logs/combined.log",
            time: true
        },
    ],
};