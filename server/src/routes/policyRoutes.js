const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/policyController');
const { policyRules, handleValidation } = require('../middleware/validation');

router.post('/import', ctrl.upload.single('file'), ctrl.importFile);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', policyRules, handleValidation, ctrl.create);
router.put('/:id', policyRules, handleValidation, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
