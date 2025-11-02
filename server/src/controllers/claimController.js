const model = require('../models/claimModel');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10_000_000 } });
const importer = require('../utils/importer');
const policyModel = require('../models/policyModel');
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
			const byId = new Map(existing.map(r => [String(r.claim_id), r]));

			// load policies map to validate or create
			const policiesAll = await policyModel.findAll({ page: 1, limit: 1000000 });
			const policies = policiesAll.data || [];
			const policiesById = new Map(policies.map(p => [String(p.policy_id), p]));

			const report = [];
			let inserted = 0, updated = 0, skipped = 0;
			for (const [idx, row] of rows.entries()) {
			const validation = validateRow('claim', row);
			if (!validation.valid) { report.push({ row: idx+1, status: 'invalid', errors: validation.errors }); continue; }
			const payload = validation.data;
			const id = row.claim_id || row.id || null;
			let found = null;
			if (id && byId.has(String(id))) found = byId.get(String(id));

				// ensure the policy exists; if policy_id is provided but not found, create a minimal policy
				if (payload.policy_id) {
					if (!policiesById.has(String(payload.policy_id))) {
						// create a minimal policy so FK constraint is satisfied
						const newPolicyPayload = {
							policy_type: 'imported',
							premium_amount: null,
							coverage_amount: null,
							start_date: null,
							end_date: null,
							customer_name: null,
							customer_id: null
						};
						try {
							const newPid = await policyModel.create(newPolicyPayload);
							payload.policy_id = newPid;
							const newPolicy = await policyModel.findById(newPid);
							policiesById.set(String(newPolicy.policy_id), newPolicy);
						} catch (e) {
							// if creation fails, null out to avoid FK error and let DB return clearer error
							payload.policy_id = null;
						}
					}
				} else {
					// no policy_id provided — create a minimal policy so claim can reference it
					const newPolicyPayload = {
						policy_type: 'imported', premium_amount: null, coverage_amount: null, start_date: null, end_date: null, customer_name: null, customer_id: null
					};
					const newPid = await policyModel.create(newPolicyPayload);
					payload.policy_id = newPid;
					const newPolicy = await policyModel.findById(newPid);
					policiesById.set(String(newPolicy.policy_id), newPolicy);
				}

			if (!found) { const newId = await model.create(payload); inserted++; report.push({ row: idx+1, status: 'inserted', id: newId }); }
			else {
				const same = (String(found.policy_id || '') === String(payload.policy_id || ''))
					&& (String(found.claim_date || '') === String(payload.claim_date || ''))
					&& (String(found.claim_amount || '') === String(payload.claim_amount || ''));
				if (same) { skipped++; report.push({ row: idx+1, status: 'skipped' }); }
				else { await model.update(found.claim_id, payload); updated++; report.push({ row: idx+1, status: 'updated', id: found.claim_id }); }
			}
		}
		res.json({ inserted, updated, skipped, total: rows.length, report });
	} catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports={list,get,create,update,remove,importFile,upload};
