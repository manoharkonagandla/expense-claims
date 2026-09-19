(() => {
  'use strict';

  const PEOPLE = [
    { id:'p1', name:'Ananya Rao', role:'Staff', managerId:'m1', monthlyLimit:15000 },
    { id:'p2', name:'Rahul Mehta', role:'Staff', managerId:'m1', monthlyLimit:18000 },
    { id:'p3', name:'Meera Iyer', role:'Staff', managerId:'m2', monthlyLimit:20000 },
    { id:'p4', name:'Arjun Nair', role:'Staff', managerId:'m2', monthlyLimit:12000 },
    { id:'m1', name:'Vikram Shah', role:'Manager', managerId:'m2', monthlyLimit:30000 },
    { id:'m2', name:'Neha Kapoor', role:'Manager', managerId:null, monthlyLimit:25000 },
    { id:'f1', name:'Priya Menon', role:'Finance', managerId:null, monthlyLimit:null }
  ];
  const CATS = ['Travel','Meals','Supplies','Taxi'];
  const ICONS = { Travel:'✈️', Meals:'☕', Supplies:'📦', Taxi:'🚕' };
  const SAMPLE_RECEIPTS = [
    'METROCAB HYD\n15 Sep 2026 18:42\nOffice to airport\nTotal INR 196',
    'HARBOR VIEW HOTEL\n12 Sep 2026\nRoom - 1 night\nTOTAL 3250',
    'FRESH MART\n11/9/26\nMarkers, notebooks\nAmount due: Rs 4820'
  ];
  const STARTER_CLAIMS = [
    {id:'clm-1048',employeeId:'m1',employeeName:'Vikram Shah',merchant:'Blue Dart Business Lounge',amount:845,category:'Meals',date:'2026-09-14',description:'Client breakfast - BLR',status:'Pending',receiptText:'BLUE DART LOUNGE\n14 Sep 2026 08:42\nClient Breakfast x1\nTotal INR 845.00'},
    {id:'clm-1047',employeeId:'p1',employeeName:'Ananya Rao',merchant:'MetroCab Hyderabad',amount:196,category:'Taxi',date:'2026-09-15',description:'Office to airport',status:'Approved',receiptText:'METROCAB HYD\nTrip 15/09/26\nFare 196\nTotal Rs 196'},
    {id:'clm-1046',employeeId:'p2',employeeName:'Rahul Mehta',merchant:'Harbor View Hotel',amount:3250,category:'Travel',date:'2026-09-12',description:'Client meeting stay',status:'Paid',receiptText:'HARBOR VIEW HOTEL\n12 Sep 2026\nRoom 1 night\nTOTAL: INR 3250'},
    {id:'clm-1045',employeeId:'p3',employeeName:'Meera Iyer',merchant:'FreshMart Office Store',amount:4820,category:'Supplies',date:'2026-09-11',description:'Workshop stationery',status:'Pending',receiptText:'Fresh Mart\n11/9/26\nMarkers + Notebooks\nAmount due: 4,820'},
    {id:'clm-1044',employeeId:'p4',employeeName:'Arjun Nair',merchant:'MetroCab Hyderabad',amount:214,category:'Taxi',date:'2026-09-10',description:'Station to office',status:'Rejected',receiptText:'Metro Cab Hyderabad\n10 Sep 2026\nFare 214\nPayable 214'},
    {id:'clm-1043',employeeId:'p1',employeeName:'Ananya Rao',merchant:'T2 Coffee Co.',amount:610,category:'Meals',date:'2026-09-08',description:'Working breakfast',status:'Paid',receiptText:'T2 COFFEE COMPANY\n08-09-2026\n2 sandwiches / coffee\nGrand total 610.00'},
    {id:'clm-1042',employeeId:'m2',employeeName:'Neha Kapoor',merchant:'CityRide',amount:378,category:'Taxi',date:'2026-09-07',description:'Airport transfer',status:'Pending',receiptText:'CITY RIDE\n07 Sep 2026\nAirport > Office\nTotal: Rs.378'},
    {id:'clm-1041',employeeId:'p3',employeeName:'Meera Iyer',merchant:'Blue Dart Business Lounge',amount:845,category:'Meals',date:'2026-09-14',description:'Client breakfast duplicate copy',status:'Flagged duplicate',receiptText:'BLUE DART BUSINESS LOUNGE\n14/09/2026 08:42\nBreakfast for client\nTOTAL INR 845'}
  ];
  let pendingReceiptPhoto = null;
  const state = {
    userId: localStorage.getItem('claimflow-user') || 'p1',
    view: 'dashboard',
    claims: loadClaims(),
    query: '',
    modal: null,
    notice: ''
  };
  let noticeTimer;
  function loadClaims(){ try { return JSON.parse(localStorage.getItem('claimflow-claims')) || structuredClone(STARTER_CLAIMS); } catch { return structuredClone(STARTER_CLAIMS); } }
  function persist(){ localStorage.setItem('claimflow-claims', JSON.stringify(state.claims)); localStorage.setItem('claimflow-user', state.userId); }
  function user(){ return PEOPLE.find(p=>p.id===state.userId) || PEOPLE[0]; }
  function monthSpendFor(personId){ return state.claims.filter(c=>c.employeeId===personId && c.date.startsWith('2026-09') && c.status!=='Rejected').reduce((s,c)=>s+c.amount,0); }
  function visibleClaims(){ const u=user(); if(u.role==='Staff') return state.claims.filter(c=>c.employeeId===u.id); if(u.role==='Manager') return state.claims.filter(c=>c.employeeId===u.id || PEOPLE.find(p=>p.id===c.employeeId)?.managerId===u.id); return state.claims; }
  function monthClaims(){ return state.claims.filter(c=>c.date.startsWith('2026-09') && c.status!=='Rejected'); }
  function fmt(n){ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n); }
  function dateFmt(d){ return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
  function initials(name){ return name.split(' ').map(x=>x[0]).join('').slice(0,2); }
  function catIcon(c){ return ICONS[c] || '🧾'; }
  function statusClass(s){ return s.toLowerCase().replace(/\s+/g,'-'); }
  function statusPill(s){ return `<span class="status ${statusClass(s)}">${esc(s)}</span>`; }
  function esc(v){ return String(v ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function similarity(a,b){
    const norm=t=>t.toLowerCase().replace(/[₹,.:;!?/\\|()\[\]{}>_-]+/g,' ').replace(/\b(rs|inr|rupees?)\b/g,' ').replace(/\d{1,2}\s*[a-z]{3,9}\s*\d{2,4}/gi,' ').replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,' ').replace(/\d{2}:\d{2}/g,' ').replace(/\s+/g,' ').trim();
    const aa=new Set(norm(a).split(' ').filter(Boolean)), bb=new Set(norm(b).split(' ').filter(Boolean)); if(!aa.size||!bb.size)return 0; let i=0; aa.forEach(x=>{if(bb.has(x))i++}); return i/Math.max(aa.size,bb.size);
  }
  function parseReceipt(text){
    const clean=text.replace(/,/g,'');
    const amtMatch=clean.match(/(?:total|grand total|amount due|fare|payable|amount|inr|rs\.?|₹)\s*[:\-]?\s*(\d+(?:\.\d{1,2})?)/i);
    const nums=[...clean.matchAll(/(?:^|\s)(\d+(?:\.\d{1,2})?)(?:\s|$)/g)].map(m=>Number(m[1])).filter(n=>n>10);
    const amount=amtMatch?Number(amtMatch[1]):(nums.length?nums[nums.length-1]:null);
    const first=text.split(/\n|\r/).map(x=>x.trim()).find(Boolean)||'Unknown merchant';
    const merchant=first.replace(/[^a-zA-Z0-9 &.'-]/g,'').trim().slice(0,45)||'Unknown merchant';
    const l=text.toLowerCase(); let category='Supplies';
    if(/taxi|cab|uber|ola|ride|metro/.test(l))category='Taxi'; else if(/coffee|cafe|lunch|breakfast|dinner|meal|restaurant|food|lounge/.test(l))category='Meals'; else if(/hotel|flight|train|air|room|travel/.test(l))category='Travel';
    const dm=text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})|\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i);
    let date='2026-09-19';
    if(dm){ if(dm[1]){ const y=String(dm[3]).length===2?'20'+dm[3]:dm[3]; date=`${y}-${String(dm[2]).padStart(2,'0')}-${String(dm[1]).padStart(2,'0')}`; } else { const y=String(dm[7]).length===2?'20'+dm[7]:dm[7]; const m=new Date(`${dm[6]} 1, ${y}`).getMonth()+1; date=`${y}-${String(m).padStart(2,'0')}-${String(dm[5]).padStart(2,'0')}`; } }
    return {merchant,amount,category,date};
  }
  function showNotice(msg){ state.notice=msg; clearTimeout(noticeTimer); noticeTimer=setTimeout(()=>{state.notice='';render()},3200); render(); }
  function mutateClaim(id,status){ state.claims=state.claims.map(c=>c.id===id?({...c,status}):c); persist(); state.modal=null; showNotice(status==='Paid'?'Claim marked as paid. Payment is final.':`Claim ${status.toLowerCase()}.`); }
  function render(){ document.getElementById('app').innerHTML=layout(); bind(); }
  function layout(){
    const u=user(), claims=visibleClaims(), unpaid=claims.filter(c=>!['Paid','Rejected'].includes(c.status));
    const pending=claims.filter(c=>['Pending','Flagged duplicate'].includes(c.status));
    return `<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">🧾</div><div><strong>ClaimFlow</strong><span>Expense claims</span></div></div><div class="role-card"><div class="role-label">Viewing as</div><div class="select-wrap"><select id="roleSelect">${['Staff','Manager','Finance'].map(role=>`<optgroup label="${role==='Manager'?'Managers':role}">${PEOPLE.filter(p=>p.role===role).map(p=>`<option value="${p.id}" ${p.id===u.id?'selected':''}>${esc(p.name)}</option>`).join('')}</optgroup>`).join('')}</select><span>⌄</span></div></div><nav>${nav('▦','Overview','dashboard',false)}${nav('▤','Claims','claims',unpaid.length)}${u.role!=='Staff'?nav('👥',u.role==='Manager'?'Team approvals':'All claims','review',pending.length):''}${u.role==='Finance'?nav('▥','Month spend','spend',0):''}</nav><div class="sidebar-footer"><div class="mini-stat">🛡 Rules enforced</div><button class="ghost-button" id="resetBtn">Reset demo data</button></div></aside><main class="main"><header class="topbar"><div><p class="eyebrow">September 2026</p><h1>${state.view==='dashboard'?'Good morning, '+esc(u.name.split(' ')[0]):state.view==='spend'?'Monthly spend':state.view==='review'?(u.role==='Manager'?'Team approvals':'Finance queue'):'Claims'}</h1></div><div class="top-actions"><span class="user-chip"><span class="avatar">${initials(u.name)}</span>${esc(u.name)}</span><button class="primary" data-new-claim>＋ New claim</button></div></header>${state.notice?`<div class="toast">✓ ${esc(state.notice)} <button id="toastClose">×</button></div>`:''}${state.view==='dashboard'?dashboard():state.view==='claims'?claimsView():state.view==='review'?reviewView():spendView()}</main>${state.modal==='new'?newClaimModal():state.modal?.startsWith('detail:')?detailModal(state.modal.slice(7)):''}</div>`;
  }
  function nav(icon,label,view,badge){ return `<button class="nav-item ${state.view===view?'active':''}" data-view="${view}"><span class="nav-ico">${icon}</span><span>${label}</span>${badge?`<b>${badge}</b>`:''}</button>`; }
  function dashboard(){
    const u=user(), claims=visibleClaims(), mc=monthClaims(), spend=mc.reduce((s,c)=>s+c.amount,0), unpaid=claims.filter(c=>!['Paid','Rejected'].includes(c.status)), approved=claims.filter(c=>c.status==='Approved').reduce((s,c)=>s+c.amount,0), total=claims.reduce((s,c)=>s+(c.status!=='Rejected'?c.amount:0),0);
    const cats=CATS.map(category=>({category,amount:mc.filter(c=>c.category===category).reduce((s,c)=>s+c.amount,0)})), max=Math.max(...cats.map(x=>x.amount),1), over=PEOPLE.filter(p=>p.monthlyLimit&&monthSpendFor(p.id)>p.monthlyLimit);
    return `<div class="content"><section class="hero-grid"><div class="hero-card"><div><span class="hero-kicker">Fast filing</span><h2>Paste the receipt.<br>We’ll shape the claim.</h2><p>Skip the six-field form for small spends. Review the extracted details before they reach a manager.</p><button class="primary" data-new-claim>✦ Parse a receipt</button></div><div class="hero-orb">🧾</div></div><div class="summary-card"><div class="summary-top"><span>Still unpaid</span><span>◷</span></div><strong>${fmt(unpaid.reduce((s,c)=>s+c.amount,0))}</strong><p>${unpaid.length} open claim${unpaid.length===1?'':'s'}</p><div class="tiny-bars">${claims.slice(0,8).map(c=>`<span style="height:${Math.max(18,Math.min(74,c.amount/50))}px"></span>`).join('')}</div></div></section><section class="stat-grid">${stat('My claims',claims.length,'▤','neutral')}${stat('Approved',fmt(approved),'✓','green')}${stat(u.role==='Finance'?'September spend':'Visible spend',fmt(u.role==='Finance'?spend:total),'₹','blue')}${stat('Limit alerts',over.length,'!','amber')}</section><section class="lower-grid"><div class="panel"><div class="panel-head"><div><h3>Recent activity</h3><p>Claims that need attention</p></div><button class="text-button" data-view="claims">View all</button></div><div class="activity-list">${claims.slice(0,5).map(c=>`<button class="activity-row" data-detail="${c.id}"><div class="claim-icon ${c.category.toLowerCase()}">${catIcon(c.category)}</div><div class="activity-main"><strong>${esc(c.merchant)}</strong><span>${esc(c.employeeName)} · ${esc(c.description)}</span></div><div class="activity-side"><b>${fmt(c.amount)}</b>${statusPill(c.status)}</div></button>`).join('')}</div></div><div class="panel"><div class="panel-head"><div><h3>Category spend</h3><p>September to date</p></div><span>▥</span></div><div class="bars">${cats.map(x=>`<div class="bar-row"><div class="bar-meta"><span>${catIcon(x.category)} ${x.category}</span><b>${fmt(x.amount)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${x.amount/max*100}%"></div></div></div>`).join('')}</div></div></section>${over.length?`<section class="warning-panel"><div class="warning-icon">!</div><div><strong>Monthly limit alerts</strong><p>${over.map(p=>`${esc(p.name)} is at ${Math.round(monthSpendFor(p.id)/p.monthlyLimit*100)}% of ${fmt(p.monthlyLimit)}`).join(' · ')}</p></div></section>`:''}</div>`;
  }
  function stat(title,value,icon,tone){ return `<div class="stat-card ${tone}"><div class="stat-icon">${icon}</div><span>${title}</span><strong>${value}</strong></div>`; }
  function claimsView(){ const q=state.query.trim().toLowerCase(); const claims=visibleClaims().filter(c=>!q||[c.id,c.merchant,c.employeeName,c.category,c.status].join(' ').toLowerCase().includes(q)); return `<div class="content"><div class="toolbar"><div class="search"><span>⌕</span><input id="searchInput" value="${esc(state.query)}" placeholder="Search merchant, person, claim..." /></div><button class="filter-button" id="clearSearch">Filter ${state.query?'×':''}</button></div><div class="panel table-panel"><div class="panel-head"><div><h3>${user().role==='Staff'?'My claims':'Claims visible to you'}</h3><p>Click a row to review the receipt and audit state.</p></div></div><div class="table-wrap"><table><thead><tr><th>Claim</th><th>Employee</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>${claims.map(c=>`<tr data-detail="${c.id}"><td><strong>${esc(c.merchant)}</strong><span>${c.id}</span></td><td>${esc(c.employeeName)}</td><td><span class="category-tag">${catIcon(c.category)} ${c.category}</span></td><td><b>${fmt(c.amount)}</b></td><td>${dateFmt(c.date)}</td><td>${statusPill(c.status)}</td></tr>`).join('')||`<tr><td colspan="6" class="empty-cell">No claims match your search.</td></tr>`}</tbody></table></div></div></div>`; }
  function reviewView(){
    const u=user(), role=u.role, claims=visibleClaims().filter(c=>!['Paid','Rejected'].includes(c.status));
    const actionable=claims.filter(c=>role==='Finance'?c.status==='Approved':['Pending','Flagged duplicate'].includes(c.status));
    return `<div class="content"><div class="review-banner"><div class="review-icon">${role==='Finance'?'₹':'👥'}</div><div><strong>${role==='Finance'?'Payment queue':'Manager sign-off'}</strong><p>${role==='Finance'?'Pay approved claims. Paid claims are final and cannot move backwards.':'Review your team’s claims. Your own claims stay blocked from self-approval.'}</p></div></div><div class="review-grid">${actionable.map(c=>`<div class="review-card"><div class="review-card-top"><div class="claim-icon ${c.category.toLowerCase()}">${catIcon(c.category)}</div>${statusPill(c.status)}</div><h3>${esc(c.merchant)}</h3><p>${esc(c.employeeName)} · ${esc(c.description)}</p><strong class="amount-lg">${fmt(c.amount)}</strong><div class="review-meta"><span>${c.category}</span><span>${dateFmt(c.date)}</span></div>${c.status==='Flagged duplicate'?'<div class="duplicate-chip">⚠ Possible duplicate receipt</div>':''}<div class="review-actions"><button class="secondary" data-detail="${c.id}">Review</button>${role==='Finance'?'<button class="primary" data-action="pay" data-id="'+c.id+'">Mark paid</button>':`<button class="primary" ${c.employeeId===u.id?'disabled':''} data-action="approve" data-id="${c.id}">${c.employeeId===u.id?'Self-approval blocked':'Approve claim'}</button>`}</div></div>`).join('')||emptyState(role)}</div></div>`;
  }
  function emptyState(role){ return `<div class="empty-state"><div>✓</div><h3>Nothing waiting here</h3><p>${role==='Finance'?'Approved claims will appear here for payment.':'New team claims will appear here for sign-off.'}</p></div>`; }
  function spendView(){ const mc=monthClaims(), spend=mc.reduce((s,c)=>s+c.amount,0), cats=CATS.map(category=>({category,amount:mc.filter(c=>c.category===category).reduce((s,c)=>s+c.amount,0)})), max=Math.max(...cats.map(x=>x.amount),1), people=PEOPLE.filter(p=>p.monthlyLimit).map(p=>({...p,spend:monthSpendFor(p.id)})).sort((a,b)=>b.spend-a.spend), over=people.filter(p=>p.spend>p.monthlyLimit); return `<div class="content"><section class="finance-header"><div><span class="eyebrow">Finance cockpit</span><h2>${fmt(spend)} <small>September spend</small></h2><p>Who spent what, under which category, and who is nearing or over their monthly limit.</p></div><div class="finance-total">▥ ${state.claims.filter(c=>c.status==='Paid').length} paid</div></section><section class="finance-grid"><div class="panel"><div class="panel-head"><div><h3>Spend by category</h3><p>All non-rejected September claims</p></div></div><div class="bars big">${cats.map(x=>`<div class="bar-row"><div class="bar-meta"><span>${catIcon(x.category)} ${x.category}</span><b>${fmt(x.amount)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${x.amount/max*100}%"></div></div></div>`).join('')}</div></div><div class="panel"><div class="panel-head"><div><h3>People & limits</h3><p>Monthly allowance usage</p></div></div><div class="limit-list">${people.map(p=>{const pct=p.spend/p.monthlyLimit*100;return `<div class="limit-row"><div class="person"><span class="avatar small">${initials(p.name)}</span><div><strong>${esc(p.name)}</strong><span>${fmt(p.spend)} / ${fmt(p.monthlyLimit)}</span></div></div><div class="limit-track"><div class="limit-fill ${pct>=100?'over':pct>=80?'near':''}" style="width:${Math.min(100,pct)}%"></div></div><b class="${pct>=80?'limit-alert':''}">${Math.round(pct)}%</b></div>`}).join('')}</div></div></section>${over.length?`<section class="warning-panel"><div class="warning-icon">!</div><div><strong>Over-limit users</strong><p>${over.map(p=>`${esc(p.name)}: ${fmt(p.spend-p.monthlyLimit)} over`).join(' · ')}</p></div></section>`:''}</div>`; }
  function newClaimModal(){ return `<div class="modal-backdrop"><div class="modal wide"><div class="modal-head"><div><h2>New expense claim</h2><p>Paste the receipt and review what ClaimFlow extracted.</p></div><button class="icon-button" data-close>×</button></div><div class="claim-create-grid"><div><div class="input-label-row"><label>Receipt text</label><span>Any messy format is okay</span></div><textarea id="receiptInput" rows="8">${esc(SAMPLE_RECEIPTS[0])}</textarea><div class="sample-row"><span>Try:</span>${SAMPLE_RECEIPTS.map((s,i)=>`<button type="button" data-sample="${i}">Example ${i+1}</button>`).join('')}</div><div class="photo-upload"><div class="input-label-row"><label>Receipt photo <b class="optional-label">Optional</b></label><span>JPG, PNG or WEBP</span></div><input id="receiptPhotoInput" type="file" accept="image/*"/><div id="photoPreview" class="photo-empty">No photo attached. You can still submit with receipt text only.</div></div><button class="secondary parse-button" id="parseBtn">✦ Parse & check duplicates</button></div><div class="preview" id="claimPreview">${claimPreview(parseReceipt(SAMPLE_RECEIPTS[0]),null)}</div></div></div></div>`; }
  function claimPreview(p,dup){ return `<div class="preview-header"><div><span>Review before submit</span><h3>Claim preview</h3></div><span class="ai-badge">✦ Assisted extraction</span></div><div class="field-grid"><label class="field edit-field"><span>Merchant</span><input id="merchantInput" value="${esc(p.merchant)}" /></label><label class="field edit-field"><span>Amount</span><input id="amountInput" inputmode="decimal" value="${p.amount??''}" /></label><label class="field edit-field"><span>Category</span><select id="categoryInput">${CATS.map(c=>`<option value="${c}" ${c===p.category?'selected':''}>${c}</option>`).join('')}</select></label><label class="field edit-field"><span>Date</span><input id="dateInput" type="date" value="${esc(p.date)}" /></label></div>${dup?`<div class="duplicate-alert">⚠ <div><strong>Possible duplicate</strong><p>${esc(dup.reason)}. Existing claim: <b>${esc(dup.c.merchant)}</b> (${dup.c.id}).</p></div></div>`:''}${pendingReceiptPhoto?`<div class="receipt-photo-preview"><div class="receipt-photo-title">Receipt photo attached <span>Optional evidence</span></div><img src="${pendingReceiptPhoto}" alt="Receipt preview" /></div>`:`<div class="photo-note">Receipt photo is optional. Add one above when it helps Finance verify the claim.</div>`}<label class="full-field"><span>Description</span><input id="descriptionInput" placeholder="e.g. Client airport transfer"/></label><div class="preview-footer"><span>Filed by <b>${esc(user().name)}</b> · manager review next</span><button class="primary" id="submitClaim" ${!p.merchant||!p.amount?'disabled':''}>Submit claim ↗</button></div>`; }
  function detailModal(id){ const c=state.claims.find(x=>x.id===id); if(!c)return ''; const u=user(), self=c.employeeId===u.id; return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${esc(c.merchant)}</h2><p>${c.id} · submitted by ${esc(c.employeeName)}</p></div><button class="icon-button" data-close>×</button></div><div class="detail-header"><div class="claim-icon ${c.category.toLowerCase()}">${catIcon(c.category)}</div><div><span class="category-tag">${c.category}</span><div class="detail-amount">${fmt(c.amount)}</div><span>${dateFmt(c.date)}</span></div><div class="detail-status">${statusPill(c.status)}</div></div><div class="receipt-box"><div class="receipt-title">▤ Receipt source</div><pre>${esc(c.receiptText)}</pre>${c.receiptPhoto?`<div class="detail-photo"><div>Optional receipt photo</div><img src="${c.receiptPhoto}" alt="Receipt attachment" /></div>`:''}</div><div class="detail-rule">🛡 Paid claims are terminal. This record cannot return to approval once paid.</div><div class="modal-actions"><button class="secondary" data-close>Close</button>${u.role==='Manager'&&c.status!=='Paid'&&c.status!=='Rejected'?`<button class="danger" data-action="reject" data-id="${c.id}">Reject</button><button class="primary" ${self?'disabled':''} data-action="approve" data-id="${c.id}">${self?'Self-approval blocked':'Approve claim'}</button>`:''}${u.role==='Finance'&&c.status==='Approved'?`<button class="primary" data-action="pay" data-id="${c.id}">Mark paid</button>`:''}</div></div></div>`; }
  async function handleReceiptPhoto(e){
    const file=e.target.files?.[0];
    if(!file){ pendingReceiptPhoto=null; updatePhotoPreview(); parseForm(); return; }
    if(!file.type.startsWith('image/')){ showNotice('Please choose an image file for the receipt photo.'); e.target.value=''; return; }
    if(file.size>8*1024*1024){ showNotice('Receipt photos must be 8 MB or smaller.'); e.target.value=''; return; }
    try{
      pendingReceiptPhoto=await compressReceiptPhoto(file);
      updatePhotoPreview();
      parseForm();
    } catch(err){ pendingReceiptPhoto=null; showNotice('Could not read that receipt photo.'); }
  }
  function compressReceiptPhoto(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(reader.error);
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Invalid image'));
        img.onload=()=>{
          const max=1000;
          const scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
          const canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
          canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
          const ctx=canvas.getContext('2d');
          ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',0.78));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function updatePhotoPreview(){
    const box=document.getElementById('photoPreview');
    if(!box)return;
    box.innerHTML=pendingReceiptPhoto?`<div class="photo-preview-inner"><img src="${pendingReceiptPhoto}" alt="Selected receipt" /><div><strong>Photo attached</strong><span>Optional receipt evidence is ready to submit.</span><button type="button" class="photo-remove" id="removeReceiptPhoto">Remove</button></div></div>`:'No photo attached. You can still submit with receipt text only.';
    const remove=document.getElementById('removeReceiptPhoto');
    if(remove)remove.addEventListener('click',()=>{pendingReceiptPhoto=null;const input=document.getElementById('receiptPhotoInput');if(input)input.value='';updatePhotoPreview();parseForm();});
  }
  function bind(){
    document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>{state.view=el.dataset.view;state.query='';render();}));
    document.querySelectorAll('[data-new-claim]').forEach(el=>el.addEventListener('click',()=>{pendingReceiptPhoto=null;state.modal='new';render();}));
    document.querySelectorAll('[data-detail]').forEach(el=>el.addEventListener('click',()=>{state.modal='detail:'+el.dataset.detail;render();}));
    document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>{pendingReceiptPhoto=null;state.modal=null;render();}));
    const rs=document.getElementById('roleSelect'); if(rs)rs.addEventListener('change',()=>{state.userId=rs.value;state.view='dashboard';persist();render();});
    const rb=document.getElementById('resetBtn'); if(rb)rb.addEventListener('click',()=>{state.claims=structuredClone(STARTER_CLAIMS);persist();showNotice('Demo data restored.');});
    const tc=document.getElementById('toastClose'); if(tc)tc.addEventListener('click',()=>{state.notice='';render();});
    const si=document.getElementById('searchInput'); if(si){si.addEventListener('input',e=>{state.query=e.target.value; render(); const n=document.getElementById('searchInput'); if(n){n.focus();n.setSelectionRange(state.query.length,state.query.length)}});}
    const cs=document.getElementById('clearSearch'); if(cs)cs.addEventListener('click',()=>{state.query='';render();});
    const sample=document.querySelectorAll('[data-sample]'); sample.forEach(b=>b.addEventListener('click',()=>{document.getElementById('receiptInput').value=SAMPLE_RECEIPTS[Number(b.dataset.sample)]; parseForm();}));
    const rp=document.getElementById('receiptPhotoInput'); if(rp&&!rp.dataset.bound){rp.dataset.bound='1';rp.addEventListener('change',handleReceiptPhoto);updatePhotoPreview();}
    const pb=document.getElementById('parseBtn'); if(pb)pb.addEventListener('click',parseForm);
    const submit=document.getElementById('submitClaim'); if(submit)submit.addEventListener('click',createClaim);
    document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.id, action=b.dataset.action, c=state.claims.find(x=>x.id===id); if(!c)return; if(action==='approve'){if(c.employeeId===user().id){showNotice('You cannot sign off your own claim.');return;}mutateClaim(id,'Approved');} else if(action==='pay'){mutateClaim(id,'Paid');} else if(action==='reject'){mutateClaim(id,'Rejected');}}));
  }
  function parseForm(){ const text=document.getElementById('receiptInput')?.value||''; const p=parseReceipt(text); const candidates=state.claims.filter(c=>c.status!=='Rejected'); const hits=candidates.map(c=>({c,score:similarity(text,c.receiptText)})).sort((a,b)=>b.score-a.score); let dup=null; if(hits[0]&&hits[0].score>=0.45&&p.amount&&hits[0].c.amount===p.amount) dup={...hits[0],reason:`Same amount (${fmt(p.amount)}) and ${Math.round(hits[0].score*100)}% receipt-text overlap`}; const prev=document.getElementById('claimPreview'); if(prev)prev.innerHTML=claimPreview(p,dup); const sub=document.getElementById('submitClaim'); if(sub)sub._parsed=p,sub._dup=dup; bind(); }
  function createClaim(){ const sub=document.getElementById('submitClaim'); const text=document.getElementById('receiptInput')?.value||''; if(!sub)return; const merchant=(document.getElementById('merchantInput')?.value||'').trim(); const amount=Number(document.getElementById('amountInput')?.value||0); const category=document.getElementById('categoryInput')?.value||'Supplies'; const date=document.getElementById('dateInput')?.value||'2026-09-19'; const desc=(document.getElementById('descriptionInput')?.value||'').trim(); if(!merchant||!amount||!date)return; const candidates=state.claims.filter(c=>c.status!=='Rejected'); const hits=candidates.map(c=>({c,score:similarity(text,c.receiptText)})).sort((a,b)=>b.score-a.score); const dup=hits[0]&&hits[0].score>=0.45&&hits[0].c.amount===amount?hits[0]:null; const claim={id:`clm-${Math.floor(1050+Math.random()*900)}`,employeeId:user().id,employeeName:user().name,merchant,amount,category,date,description:desc||'Receipt claim',status:dup?'Flagged duplicate':'Pending',receiptText:text,receiptPhoto:pendingReceiptPhoto||null}; state.claims=[claim,...state.claims];persist();state.modal=null;state.view='claims';showNotice(dup?'Claim saved and flagged as a possible duplicate.':'Claim created and sent for manager review.'); }
  render();
})();
