const express = require('express');
const router = express.Router();
const dbCtrl = require('../controllers/dbController');

// Tables
router.get('/tables', dbCtrl.listTables);
router.get('/tables/:table/schema', dbCtrl.getSchema);
router.post('/tables', dbCtrl.createTable);
router.delete('/tables/:table', dbCtrl.dropTable);

// Rows
router.get('/tables/:table/rows', dbCtrl.listRows);
router.post('/tables/:table/rows', dbCtrl.insertRow);
router.put('/tables/:table/rows/:pk/:id', dbCtrl.updateRow);
router.delete('/tables/:table/rows/:pk/:id', dbCtrl.deleteRow);

// Import
router.post('/tables/:table/import/preview', dbCtrl.upload.single('file'), dbCtrl.previewImport);
router.post('/tables/:table/import', dbCtrl.upload.single('file'), dbCtrl.importFile);

module.exports = router;
