const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/claimController');
const { claimRules, handleValidation } = require('../middleware/validation');

router.post('/import', ctrl.upload.single('file'), ctrl.importFile);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', claimRules, handleValidation, ctrl.create);
router.put('/:id', claimRules, handleValidation, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
