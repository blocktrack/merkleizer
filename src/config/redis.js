module.exports = {
    enabled: true,
    config: {
        socket_keepalive: true,
        "host": (process.env.REDIS_HOST) ? process.env.REDIS_HOST : '127.0.0.1',
        "port": (process.env.REDIS_PORT) ? process.env.REDIS_PORT : "6379",
        "database": (process.env.REDIS_PASS) ? process.env.REDIS_PASS : undefined,
    }
};
