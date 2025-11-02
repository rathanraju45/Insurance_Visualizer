const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { dashboardRules, handleValidation } = require('../middleware/validation');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', dashboardRules, handleValidation, ctrl.create);
router.put('/:id', dashboardRules, handleValidation, ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/run', ctrl.run);

module.exports = router;
