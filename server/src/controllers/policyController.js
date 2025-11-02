const model = require('../models/policyModel');
const customerModel = require('../models/customerModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10_000_000 } });
const importer = require('../utils/importer');
const { validateRow } = require('../utils/rowValidator');

async function list(req,res){
	try{
		const page = req.query.page || 1;
		const limit = req.query.limit || 25;
		const result = await model.findAll({ page, limit });
		res.json(result);
	}catch(e){res.status(500).json({error:e.message})}
}
async function get(req,res){try{const r=await model.findById(req.params.id);if(!r)return res.status(404).json({error:'Not found'});res.json(r);}catch(e){res.status(500).json({error:e.message})}}
async function create(req,res){try{const id=await model.create(req.body);const created=await model.findById(id);res.status(201).json(created);}catch(e){res.status(500).json({error:e.message})}}
async function update(req,res){try{const id=await model.update(req.params.id,req.body);if(!id)return res.status(400).json({error:'No fields to update'});const u=await model.findById(id);res.json(u);}catch(e){res.status(500).json({error:e.message})}}
async function remove(req,res){try{await model.remove(req.params.id);res.json({deleted:true});}catch(e){res.status(500).json({error:e.message})}}

async function importFile(req, res) {
	try {
		if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
		const rows = importer.parseFile(req.file.buffer, req.file.originalname || req.file.filename);
				const existingAll = await model.findAll({ page: 1, limit: 1000000 });
				const existing = existingAll.data || [];
				const byId = new Map(existing.map(r => [String(r.policy_id), r]));

				// load customers to validate customer_id or create by name
				const customersAll = await customerModel.findAll({ page: 1, limit: 1000000 });
				const customers = customersAll.data || [];
				const customersById = new Map(customers.map(c => [String(c.customer_id), c]));
				const customersByName = new Map(customers.filter(c => c.full_name).map(c => [String(c.full_name).toLowerCase(), c]));

				const report = [];
				let inserted = 0, updated = 0, skipped = 0;
				for (const [idx, row] of rows.entries()) {
					const validation = validateRow('policy', row);
					if (!validation.valid) { report.push({ row: idx+1, status: 'invalid', errors: validation.errors }); continue; }
					const payload = validation.data;
					const id = row.policy_id || row.id || null;
					let found = null;
					if (id && byId.has(String(id))) found = byId.get(String(id));


				// ensure customer_id is valid; if not present but customer_name is provided, try find or create
				if (payload.customer_id) {
					if (!customersById.has(String(payload.customer_id))) {
						// invalid id, try to find by name
						if (payload.customer_name) {
							const foundCust = customersByName.get(String(payload.customer_name).toLowerCase());
							if (foundCust) payload.customer_id = foundCust.customer_id;
							else {
								// create minimal customer record
								const newCustId = await customerModel.create({ full_name: payload.customer_name });
								payload.customer_id = newCustId;
								// update local maps
								const newCust = await customerModel.findById(newCustId);
								customersById.set(String(newCust.customer_id), newCust);
								if (newCust.full_name) customersByName.set(String(newCust.full_name).toLowerCase(), newCust);
							}
						} else {
							// cannot resolve, set to null to avoid FK error
							payload.customer_id = null;
						}
					}
				} else if (payload.customer_name) {
					const foundCust = customersByName.get(String(payload.customer_name).toLowerCase());
					if (foundCust) payload.customer_id = foundCust.customer_id;
					else {
						const newCustId = await customerModel.create({ full_name: payload.customer_name });
						payload.customer_id = newCustId;
						const newCust = await customerModel.findById(newCustId);
						customersById.set(String(newCust.customer_id), newCust);
						if (newCust.full_name) customersByName.set(String(newCust.full_name).toLowerCase(), newCust);
					}
				}

						if (!found) { const newId = await model.create(payload); inserted++; report.push({ row: idx+1, status: 'inserted', id: newId }); }
						else {
							const same = (String(found.policy_type || '') === String(payload.policy_type || ''))
								&& (String(found.premium_amount || '') === String(payload.premium_amount || ''))
								&& (String(found.coverage_amount || '') === String(payload.coverage_amount || ''))
								&& (String(found.start_date || '') === String(payload.start_date || ''))
								&& (String(found.end_date || '') === String(payload.end_date || ''))
								&& (String(found.customer_id || '') === String(payload.customer_id || ''));
							if (same) { skipped++; report.push({ row: idx+1, status: 'skipped' }); }
							else { await model.update(found.policy_id, payload); updated++; report.push({ row: idx+1, status: 'updated', id: found.policy_id }); }
						}
					}
					res.json({ inserted, updated, skipped, total: rows.length, report });
	} catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports={list,get,create,update,remove,importFile,upload};
