exports.app = {
    "http": {
        "port": (process.env.HTTP_PORT) ? process.env.MONGO_PORT : "80"
    }
};
