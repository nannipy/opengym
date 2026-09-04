import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { tempData, writeState, sampleState } from './helpers.mjs';

const DIR = tempData();
const PORT = 3999;
process.env.PORT = String(PORT);
process.env.DATA_DIR = DIR;
process.env.ORIGIN = `http://localhost:${PORT}`;

// Create initial db.json
const dbFile = path.join(DIR, 'db.json');
fs.writeFileSync(dbFile, JSON.stringify({
  users: [
    { id: 'trainer_1', name: 'Trainer Alice', role: 'trainer', created: new Date().toISOString() },
    { id: 'client_1', name: 'Client Bob', role: 'client', trainerId: 'trainer_1', created: new Date().toISOString() }
  ],
  creds: [],
  subs: [],
  invites: [],
  templates: [],
  chats: {}
}, null, 2));

// Give client_1 an initial state
writeState(DIR, 'client_1', sampleState({
  notes: 'Client notes from trainer',
  routines: [{ id: 'r1', name: 'Legs Day', emoji: '🦵', prog: 'double', ex: [] }],
  week: { 1: 'r1' },
  workouts: [{
    id: 'w_1',
    d: '2026-09-01',
    name: 'Legs Day',
    start: Date.now() - 3600000,
    end: Date.now(),
    vol: 1200,
    entries: []
  }]
}));

// Import server
const { server } = await import('../server.js');

// Give server time to listen
await new Promise(r => setTimeout(r, 200));


// Read secret to forge session cookies
const secret = fs.readFileSync(path.join(DIR, 'secret'), 'utf8').trim();
import crypto from 'node:crypto';
function makeCookie(uid) {
  const exp = Date.now() + 90 * 86400000;
  const payload = uid + ':' + exp + ':0';
  const mac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `gymsid=${payload}.${mac}`;
}

async function request(method, pathName, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: pathName,
      method,
      headers
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = {};
        try { json = JSON.parse(data); } catch { json = { raw: data }; }
        resolve({ status: res.statusCode, data: json });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

test('GET /api/me returns user role', async () => {
  const tRes = await request('GET', '/api/me', null, makeCookie('trainer_1'));
  assert.equal(tRes.status, 200);
  assert.equal(tRes.data.user.role, 'trainer');
  assert.equal(tRes.data.user.admin, true);

  const cRes = await request('GET', '/api/me', null, makeCookie('client_1'));
  assert.equal(cRes.status, 200);
  assert.equal(cRes.data.user.role, 'client');
  assert.equal(cRes.data.user.trainerId, 'trainer_1');
});

test('Templates CRUD for trainer', async () => {
  // Create template
  const createRes = await request('POST', '/api/trainer/templates', {
    name: 'Upper Body Blast',
    emoji: '💥',
    prog: 'double',
    routines: [{ id: 'tmpl_r1', name: 'Upper A', ex: [] }],
    week: { 1: 'tmpl_r1' }
  }, makeCookie('trainer_1'));
  assert.equal(createRes.status, 201);
  const tmplId = createRes.data.template.id;
  assert.ok(tmplId);

  // List templates
  const listRes = await request('GET', '/api/trainer/templates', null, makeCookie('trainer_1'));
  assert.equal(listRes.status, 200);
  assert.ok(listRes.data.templates.some(t => t.id === tmplId));

  // Update template
  const updateRes = await request('PUT', `/api/trainer/templates/${tmplId}`, {
    name: 'Upper Body Blast v2',
    emoji: '🔥'
  }, makeCookie('trainer_1'));
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data.template.name, 'Upper Body Blast v2');
  assert.equal(updateRes.data.template.emoji, '🔥');

  // Delete template
  const delRes = await request('DELETE', `/api/trainer/templates/${tmplId}`, null, makeCookie('trainer_1'));
  assert.equal(delRes.status, 200);

  // Verify deletion
  const afterList = await request('GET', '/api/trainer/templates', null, makeCookie('trainer_1'));
  assert.ok(!afterList.data.templates.some(t => t.id === tmplId));
});

test('Client creation with onboarding token and info check', async () => {
  // Trainer creates a client
  const createClientRes = await request('POST', '/api/trainer/clients', {
    name: 'Mario Rossi'
  }, makeCookie('trainer_1'));
  assert.equal(createClientRes.status, 201);
  assert.ok(createClientRes.data.invite.token.startsWith('tkn_'));
  assert.ok(createClientRes.data.invite.inviteLink.includes('onboard=tkn_'));

  const token = createClientRes.data.invite.token;

  // Check onboarding info
  const infoRes = await request('GET', `/api/onboarding/info?token=${token}`);
  assert.equal(infoRes.status, 200);
  assert.equal(infoRes.data.name, 'Mario Rossi');
  assert.equal(infoRes.data.role, 'client');
  assert.equal(infoRes.data.trainerName, 'Trainer Alice');
});

test('Trainer client monitoring & plan update', async () => {
  // List clients
  const listRes = await request('GET', '/api/trainer/clients', null, makeCookie('trainer_1'));
  assert.equal(listRes.status, 200);
  const client1 = listRes.data.clients.find(c => c.id === 'client_1');
  assert.ok(client1);
  assert.equal(client1.workoutsCount, 1);
  assert.equal(client1.totalVolume, 1200);

  // Client detail
  const detailRes = await request('GET', '/api/trainer/client/client_1', null, makeCookie('trainer_1'));
  assert.equal(detailRes.status, 200);
  assert.equal(detailRes.data.client.id, 'client_1');
  assert.equal(detailRes.data.workouts.length, 1);

  // Update client plan
  const updatePlanRes = await request('PUT', '/api/trainer/client/client_1/plan', {
    routines: [{ id: 'new_r1', name: 'Push Day', ex: [] }],
    week: { 1: 'new_r1', 3: 'new_r1' },
    notes: 'Focus on form this week.'
  }, makeCookie('trainer_1'));
  assert.equal(updatePlanRes.status, 200);
  assert.equal(updatePlanRes.data.ok, true);

  // Verify client detail has updated plan
  const verifyDetail = await request('GET', '/api/trainer/client/client_1', null, makeCookie('trainer_1'));
  assert.equal(verifyDetail.data.notes, 'Focus on form this week.');
  assert.equal(verifyDetail.data.routines[0].id, 'new_r1');
});

test('Chat 1-a-1 between trainer and client', async () => {
  // Client sends message
  const msg1 = await request('POST', '/api/chat/client_1', {
    text: 'Ciao Coach, posso fare panca inclinata invece che piana?'
  }, makeCookie('client_1'));
  assert.equal(msg1.status, 201);
  assert.equal(msg1.data.message.sender, 'client');

  // Trainer replies
  const msg2 = await request('POST', '/api/chat/client_1', {
    text: 'Certamente Mario, mantieni lo stesso carico o -10%.'
  }, makeCookie('trainer_1'));
  assert.equal(msg2.status, 201);
  assert.equal(msg2.data.message.sender, 'trainer');

  // Both can read chat
  const chatForClient = await request('GET', '/api/chat/client_1', null, makeCookie('client_1'));
  assert.equal(chatForClient.status, 200);
  assert.equal(chatForClient.data.messages.length, 2);
  assert.equal(chatForClient.data.messages[0].text, 'Ciao Coach, posso fare panca inclinata invece che piana?');
  assert.equal(chatForClient.data.messages[1].text, 'Certamente Mario, mantieni lo stesso carico o -10%.');

  const chatForTrainer = await request('GET', '/api/chat/client_1', null, makeCookie('trainer_1'));
  assert.equal(chatForTrainer.status, 200);
  assert.equal(chatForTrainer.data.messages.length, 2);

  // Close server cleanly
  await new Promise(resolve => server.close(resolve));
});

