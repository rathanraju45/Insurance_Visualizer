const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/agentController');
const { agentRules, handleValidation } = require('../middleware/validation');

router.post('/import', ctrl.upload.single('file'), ctrl.importFile);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', agentRules, handleValidation, ctrl.create);
router.put('/:id', agentRules, handleValidation, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
