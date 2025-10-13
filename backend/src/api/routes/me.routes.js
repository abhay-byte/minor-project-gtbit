const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const recordController = require('../controllers/record.controller');

router.get('/me', auth, userController.getMe);
router.put('/me', auth, userController.updateMe);

router.post('/me/records', auth, recordController.uploadRecord);
router.get('/me/records', auth, recordController.getRecords);
router.delete('/me/records/:id', auth, recordController.deleteRecord);

module.exports = router;
