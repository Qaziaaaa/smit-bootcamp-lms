const https = require('https');
const BASE = 'https://smit-bootcamp-lms-seven.vercel.app/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({ hostname: url.hostname, path: url.pathname + url.search, method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } },
      res => { let b=''; res.on('data',c=>b+=c); res.on('end',()=>{ try{resolve(JSON.parse(b))}catch{resolve(b)} }); });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

// All 37 students from xlsx - clean names
const students = [
  {n:'Qazi Farhan',r:'001'},{n:'Shafqatullah',r:'002'},{n:'Aariz',r:'003'},{n:'Azlan',r:'004'},
  {n:'Shaheer Ali',r:'005'},{n:'Junaid',r:'006'},{n:'Ali Jan',r:'007'},{n:'Abu Talha Ali',r:'008'},
  {n:'Shah Faisal',r:'009'},{n:'M Umar',r:'010'},{n:'M Younus',r:'011'},{n:'Nabeel Ahmed',r:'012'},
  {n:'Moeenuddin',r:'013'},{n:'Hamid Nawaz',r:'014'},{n:'Zaid Shaheen',r:'015'},{n:'M Mohsin',r:'016'},
  {n:'Hamkimullah',r:'017'},{n:'M Asad',r:'018'},{n:'Shayan',r:'019'},{n:'Faizan Jahangir',r:'020'},
  {n:'Abdullah',r:'021'},{n:'Idreesuddin',r:'022'},{n:'Abdul Wahab',r:'023'},{n:'Habil',r:'024'},
  {n:'M Usman',r:'025'},{n:'Hamza',r:'026'},{n:'Sanaullah',r:'027'},{n:'Qazi Zaid',r:'028'},
  {n:'Muzammail Ali',r:'029'},{n:'Shehzad Habib',r:'030'},{n:'Farman',r:'031'},{n:'Mustafa',r:'032'},
  {n:'Faizurrehman',r:'033'},{n:'Saifullah',r:'034'},{n:'Hasnain',r:'035'},{n:'Bahadar Ali',r:'036'},
  {n:'Hashim',r:'037'},
];

// Attendance per date: maps xlsx key -> present/absent/leave
// 1=present, 0=absent, -1=leave, null=not marked (absent)
const dates = [
  '2026-07-24','2026-07-27','2026-07-28','2026-07-29','2026-07-30',
  '2026-08-01','2026-08-03','2026-08-04','2026-08-05','2026-08-06',
  '2026-08-07','2026-08-08','2026-08-10','2026-08-11','2026-08-13',
  '2026-08-17','2026-08-18','2026-08-19','2026-08-20',
];

// xlsxKey -> index in students array (0-based)
const nameMap = {
  'qazi farhan':0,'shafqatullah':1,'aariz AI':2,'azlan':3,'shaheer ali':4,
  'junaid':5,'ali jan':6,'abu talha ali':7,'shah faisal':8,'m umar':9,
  'm younus':10,'nabeel ahmed':11,'moeenuddin AI':12,'hamid nawaz AI':13,
  'zaid shaheen AI':14,'m mohsin':15,'hamkimullah':16,'m asad':17,'shayan':18,
  'faizan jahangir(aqleem)':19,'abdullah':20,'idreesuddin':21,'abdul wahab':22,
  'habil':23,'m usman GD':24,'hamza':25,'sanaullah':26,'qazi zaid':27,
  'muzammail ali (aqleem)':28,'shehzad habib (aqleem)':29,'farman':30,
  'mustafa':31,'faizurrehman':32,' saifullah AI':33,'hasnain':34,'bahadar ali':35,
  'hashim (aqleem)':36,
};

// Raw attendance from xlsx: each entry = { dateKey, records: {xlsxKey: rawStatus} }
const rawAtt = [
  { dk:46227, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'absent','idreesuddin':'absent','abdul wahab':'absent','habil':'yes','m usman GD':'yes','hamza':'absent','sanaullah':'yes','qazi zaid':'absent','muzammail ali (aqleem)':'absent','faizurrehman':'yes'} },
  { dk:46230, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'ys','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','hamza':'yes','sanaullah':'yes','qazi zaid':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46231, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','hamza':'yes','sanaullah':'yes','qazi zaid':'absent','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46232, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'absent','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','hamza':'absent','sanaullah':'yes','qazi zaid':'absent','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46233, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'absnt','junaid':'yes','ali jan':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46235, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46237, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','m younus':'yes','nabeel ahmed':'yes','zaid shaheen AI':'yes','hamkimullah':'yes','m asad':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46238, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes'} },
  { dk:46239, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','m usman GD':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes','hasnain':'yes'} },
  { dk:46240, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','habil':'yes','m usman GD':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','hasnain':'yes','bahadar ali':'yes'} },
  { dk:46241, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'leave','azlan':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','nabeel ahmed':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','hasnain':'yes'} },
  { dk:46242, rec:{'qazi farhan':'yes','shafqatullah':'yes','shaheer ali':'yes','junaid':'yes','ali jan':'yes','shah faisal':'yes','m umar':'yes','nabeel ahmed':'yes','m mohsin':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes',' saifullah AI':'yes','hasnain':'yes'} },
  { dk:46244, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','nabeel ahmed':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','idreesuddin':'yes','abdul wahab':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','bahadar ali':'yes'} },
  // 46245 = 11-Aug-26 (the unnamed row)
  { dk:46245, rec:{'qazi farhan':'yes','shafqatullah':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','moeenuddin AI':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','hasnain':'yes','bahadar ali':'yes'} },
  { dk:46247, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','hasnain':'yes','bahadar ali':'yes'} },
  { dk:46251, rec:{'qazi farhan':'yes','shafqatullah':'yes','aariz AI':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','faizurrehman':'yes','bahadar ali':'yes','hashim (aqleem)':'yes'} },
  { dk:46252, rec:{'qazi farhan':'yes','shafqatullah':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','abdullah':'yes','idreesuddin':'yes','habil':'yes','muzammail ali (aqleem)':'yes','shehzad habib (aqleem)':'yes','farman':'yes','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','hasnain':'yes','bahadar ali':'yes','hashim (aqleem)':'yes'} },
  { dk:46253, rec:{'qazi farhan':'yes','shafqatullah':'yes','azlan':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','hamid nawaz AI':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','shayan':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','habil':'yes','hamza':'yes','sanaullah':'yes','muzammail ali (aqleem)':'yes','farman':'leave','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','hasnain':'yes','hashim (aqleem)':'yes'} },
  { dk:46254, rec:{'qazi farhan':'yes','shafqatullah':'yes','azlan':'yes','shaheer ali':'yes','junaid':'yes','abu talha ali':'yes','shah faisal':'yes','m umar':'yes','m younus':'yes','nabeel ahmed':'yes','zaid shaheen AI':'yes','m mohsin':'yes','hamkimullah':'yes','m asad':'yes','faizan jahangir(aqleem)':'yes','abdullah':'yes','idreesuddin':'yes','abdul wahab':'yes','hamza':'yes','sanaullah':'yes','shehzad habib (aqleem)':'yes','farman':'leave','mustafa':'yes','faizurrehman':'yes',' saifullah AI':'yes','bahadar ali':'yes','hashim (aqleem)':'yes'} },
];

function normalizeStatus(s) {
  if (!s) return 'absent';
  s = s.toLowerCase().trim();
  if (s === 'yes' || s === 'ys' || s === 'present') return 'present';
  if (s === 'absent' || s === 'absnt' || s === 'no') return 'absent';
  if (s === 'leave' || s === 'l') return 'leave';
  return 'absent';
}

function statusToMark(s) {
  if (s === 'present') return 'present';
  if (s === 'leave') return 'present'; // treat leave as present for marking
  return 'absent';
}

async function main() {
  // 1. Login as admin
  console.log('Logging in...');
  const login = await req('POST', '/auth/login', { email: 'admin@lms.com', password: 'admin12345' });
  const token = login.data.token;
  console.log('Admin logged in');

  // 2. Get existing students and delete them
  const existing = await req('GET', '/students?limit=500', null, token);
  const existList = existing.data?.students || [];
  console.log(`Deleting ${existList.length} existing students...`);
  for (const s of existList) {
    try { await req('DELETE', `/students/${s._id}`, null, token); } catch {}
  }
  console.log('All existing students deleted');

  // 3. Create all 37 students
  console.log(`Creating ${students.length} students...`);
  const createdIds = [];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const email = s.n.toLowerCase().replace(/[^a-z0-9]/g, '') + '@lms.com';
    try {
      const res = await req('POST', '/students', { name: s.n, email, password: 'student123', rollNo: s.r }, token);
      createdIds.push({ name: s.n, _id: res.data._id });
      process.stdout.write(`  [${i+1}/${students.length}] ${s.n}\n`);
    } catch (e) {
      console.log(`  [${i+1}/${students.length}] FAILED ${s.n}: ${e.message || e}`);
    }
  }
  console.log(`Created ${createdIds.length} students`);

  // 4. Mark attendance
  const idByName = {};
  for (const c of createdIds) idByName[c.name] = c._id;

  console.log(`Marking attendance for ${rawAtt.length} dates...`);
  for (let di = 0; di < rawAtt.length; di++) {
    const att = rawAtt[di];
    const dateStr = dates[di];
    const records = [];
    for (const [xlsxKey, rawStatus] of Object.entries(att.rec)) {
      const idx = nameMap[xlsxKey];
      if (idx === undefined) continue;
      const studentName = students[idx].n;
      const studentId = idByName[studentName];
      if (!studentId) continue;
      const status = statusToMark(normalizeStatus(rawStatus));
      records.push({ studentId, date: dateStr, status });
    }
    if (records.length === 0) continue;
    try {
      await req('POST', '/attendance', { records }, token);
      console.log(`  ${dateStr}: marked ${records.length} students`);
    } catch (e) {
      console.log(`  ${dateStr}: FAILED - ${e.message || e}`);
    }
    await sleep(50);
  }

  // 5. Assign Idreesuddin to Team A
  const idreesId = idByName['Idreesuddin'];
  if (idreesId) {
    try {
      await req('POST', '/teams', { name: 'Team A', members: [idreesId] }, token);
      console.log('Created Team A with Idreesuddin');
    } catch (e) {
      console.log(`Team A failed: ${e.message || e}`);
    }
  }

  console.log('\n=== IMPORT COMPLETE ===');
}

main().catch(console.error);
