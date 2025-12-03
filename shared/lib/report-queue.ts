import { Queue } from 'bullmq';
import { env } from "@/shared/lib/env";

const globalForRedis = global as unknown as { reportQueue: Queue };

const REDIS_CONNECTION = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: parseInt(env('REDIS_PORT', '6379'), 10)
};

export const getReportQueue = () => {
    if (globalForRedis.reportQueue) {
        return globalForRedis.reportQueue;
    }

    const queue = new Queue('report-generation', {
        connection: REDIS_CONNECTION,
        defaultJobOptions: {
            attempts: parseInt(env('BULLMQ_JOB_ATTEMPTS', '3'), 10) || 3,
            backoff: {
                type: 'exponential',
                delay: 10000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        globalForRedis.reportQueue = queue;
    }

    return queue;
};