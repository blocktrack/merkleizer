exports.app = {
    "http": {
        "port": (process.env.HTTP_PORT) ? process.env.HTTP_PORT : "80"
    }
};
