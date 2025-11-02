const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/customerController');
const { customerRules, handleValidation } = require('../middleware/validation');

// import route (upload)
router.post('/import', ctrl.upload.single('file'), ctrl.importFile);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', customerRules, handleValidation, ctrl.create);
router.put('/:id', customerRules, handleValidation, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
