// src/api/middleware/upload.middleware.js
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB file size limit
    },
});

module.exports = upload;
