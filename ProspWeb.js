// ============================================================
//  ProspWeb.js — Logica platformei Prosperus-Cons
//  Baza de date: prospwebdb  |  API base: /api
// ============================================================

const API = '/api';          // schimba cu URL-ul real al backend-ului tau

let currentUser = null;
// ── Restaurare sesiune dupa refresh ──
const _saved = localStorage.getItem('prospUser');
if (_saved) { try { currentUser = JSON.parse(_saved); } catch(e) { localStorage.removeItem('prospUser'); } }

// ── Hamburger menu ──
function toggleMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('nav-links-list');
    if (!btn || !nav) return;
    btn.classList.toggle('open');
    nav.classList.toggle('mobile-open');
}
function closeMobileMenu() {
    const btn = document.getElementById('hamburger-btn');
    const nav = document.getElementById('nav-links-list');
    if (btn) btn.classList.remove('open');
    if (nav) nav.classList.remove('mobile-open');
}

// ── Inapoi la site (fara logout) ──
function goBackToSite() {
    document.getElementById('private-dashboard').style.display = 'none';
    document.getElementById('public-platform').style.display  = 'block';
    navigateTo('home');
}


// ============================================================
//  UTILITARE API
// ============================================================

async function apiPost(endpoint, body) {
    const res = await fetch(API + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Eroare server' }));
        throw new Error(err.message || 'Eroare necunoscuta');
    }
    return res.json();
}

async function apiGet(endpoint) {
    const res = await fetch(API + endpoint);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Eroare server' }));
        throw new Error(err.message || 'Eroare necunoscuta');
    }
    return res.json();
}

async function apiPatch(endpoint, body) {
    const res = await fetch(API + endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Eroare server' }));
        throw new Error(err.message || 'Eroare necunoscuta');
    }
    return res.json();
}

async function apiDelete(endpoint) {
    const res = await fetch(API + endpoint, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Eroare server' }));
        throw new Error(err.message || 'Eroare necunoscuta');
    }
    return res.json();
}


// ============================================================
//  SECURITATE FORMULAR CONTRACT
// ============================================================

function checkContractSecurityState() {
    const notice = document.getElementById('contract-security-notice');
    const formInputs = document.querySelectorAll('#publicContractForm input, #publicContractForm select, #publicContractForm button');

    if (!notice || !formInputs.length) return;

    if (currentUser) {
        notice.style.display = 'none';
        formInputs.forEach(i => i.disabled = false);
    } else {
        notice.style.display = 'flex';
        formInputs.forEach(i => i.disabled = true);
    }

    updatePriceCalculator();
}

// ============================================================
//  NAVIGARE
// ============================================================

function handleAuthNavButtonClick() {
    if (currentUser) { openDashboard(); } else { navigateTo('auth'); }
}

function navigateTo(pageId) {
    closeMobileMenu();
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active-page'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const section = document.getElementById(`page-${pageId}`);

    if (section) {
    section.classList.add('active-page');

    section.querySelectorAll('.scroll-animate').forEach(el => {
        setTimeout(() => {
            el.classList.add('animate-visible');
        }, 50);
    });
    }
    const link = document.getElementById(`link-${pageId}`);
    if (link) link.classList.add('active');
    if (pageId === 'auth') updateAuthPageUI();
}

// ============================================================
//  AUTENTIFICARE RAPIDĂ (butoane demo)
//  Trimite credentialele predefinite direct la /api/auth/login
// ============================================================

const QUICK_CREDENTIALS = {
    'client':   { email: 'client@exemplu.com',          pass: '123456'     },
    'andrei_v': { email: 'vasile@prosperus.md',          pass: 'vasile99'   },
    'ion_g':    { email: 'ion.g@prosperus.md',           pass: 'ionteren'   },
    'mihai_s':  { email: 'mihai@prosperus.md',           pass: 'mihai2026'  }
};

async function quickLogin(id) {
    const cred = QUICK_CREDENTIALS[id];
    if (!cred) return;
    try {
        const data = await apiPost('/auth/login', { email: cred.email, password: cred.pass });
        currentUser = data.user;
        syncUIAfterLogin();
        alert(`Autentificat rapid ca ${currentUser.name}! Apasă "Deschide Panou" din meniul de sus.`);
        updateAuthPageUI();
    } catch (err) {
        alert('Eroare autentificare rapidă: ' + err.message);
    }
}

// ============================================================
//  ACCES SECRET ADMIN  (Shift + Click pe logo)
// ============================================================

async function checkSecretAdminAccess(event) {
    if (event.shiftKey) {
        try {
            const data = await apiPost('/auth/login', {
                email:    'ing.bors.ion@prosperus.md',
                password: 'admin2026'
            });
            currentUser = data.user;
            syncUIAfterLogin();
            openDashboard();
            alert('Autentificare Administrator executată.');
        } catch (err) {
            alert('Eroare acces admin: ' + err.message);
        }
    } else {
        navigateTo('home');
    }
}

// ============================================================
//  CALCULATOR DEVIZ
// ============================================================

function updatePriceCalculator() {
    const tipEl = document.getElementById('c_tip');
    const lungimeEl = document.getElementById('c_lungime');
    const totalEl = document.getElementById('c_total_pret');
    const breakdown = document.getElementById('price-breakdown');
    const formulaText = document.getElementById('price-formula-text');

    if (!tipEl || !lungimeEl || !totalEl) return;

    const prices = {
        apa: 50,
        canal: 65,
        pachet: 100
    };

    const tip = tipEl.value;
    const lungime = Math.max(parseFloat(lungimeEl.value) || 0, 0);
    const costPerMetru = prices[tip] || prices.apa;
    const total = lungime * costPerMetru;

    totalEl.innerText = `${total.toFixed(0)} EUR`;

    if (breakdown && formulaText) {
        breakdown.style.display = 'block';
        formulaText.innerText = `${lungime} m × ${costPerMetru} EUR/m = ${total.toFixed(0)} EUR`;
    }
}

// ============================================================
//  TAB-URI AUTENTIFICARE
// ============================================================

function switchAuthTab(type) {
    document.getElementById('tab-login').classList.remove('active-tab');
    document.getElementById('tab-register').classList.remove('active-tab');
    document.getElementById('form-auth-login').style.display = 'none';
    document.getElementById('form-auth-register').style.display = 'none';
    if (type === 'login') {
        document.getElementById('tab-login').classList.add('active-tab');
        document.getElementById('form-auth-login').style.display = 'block';
    } else {
        document.getElementById('tab-register').classList.add('active-tab');
        document.getElementById('form-auth-register').style.display = 'block';
    }
}

// ============================================================
//  ÎNREGISTRARE UTILIZATOR NOU
//  POST /api/auth/register  → INSERT INTO users
// ============================================================

async function handleUserRegister(e) {
    e.preventDefault();
    const name  = document.getElementById('reg_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const role  = document.getElementById('reg_role').value;
    const pass  = document.getElementById('reg_pass').value;
    const phone = document.getElementById('reg_phone').value.trim();

    if (!validateEmailLive(document.getElementById('reg_email'))) {
        alert('Email invalid!');
        return;
    }

    if (!validatePasswordLive(document.getElementById('reg_pass'))) {
        alert('Parola trebuie să aibă minim 8 caractere!');
        return;
    }

    if (phone && !/^\+?[0-9\s\-]{7,20}$/.test(phone)) {
    alert('Număr de telefon invalid! Exemplu corect: +373 69 123 456');
    return;
    }

    try {
        const data = await apiPost('/auth/register', { name, email, password: pass, role, phone });
        // Serverul returneaza obiectul user fara parola
        // { id, name, email, role, spec, created_at }
        currentUser = data.user;
        syncUIAfterLogin();
        alert('Contul tău a fost creat și ești conectat!');
        e.target.reset();
        updateAuthPageUI();
    } catch (err) {
        alert('Eroare înregistrare: ' + err.message);
    }
}

// ============================================================
//  AUTENTIFICARE (LOGIN)
//  POST /api/auth/login  → SELECT din users, verifica hash parola
// ============================================================

async function handleUserLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login_email').value.trim().toLowerCase();
    const pass  = document.getElementById('login_pass').value;

    try {
        const data = await apiPost('/auth/login', { email, password: pass });
        // Serverul returneaza: { user: { id, name, email, role, spec } }
        currentUser = data.user;
        syncUIAfterLogin();
        alert('Te-ai conectat cu succes! Panoul îl poți deschide din meniul de sus.');
        updateAuthPageUI();
    } catch (err) {
        alert('Email sau parolă incorectă!');
    }
}

function syncUIAfterLogin() {
    document.getElementById('nav-auth-text').innerText = 'Deschide Panou';
    localStorage.setItem('prospUser', JSON.stringify(currentUser));
    checkContractSecurityState();
}

// ============================================================
//  UI PAGINA AUTH
// ============================================================

function updateAuthPageUI() {
    const statusBlock  = document.getElementById('auth-state-status-block');
    const quickArea    = document.getElementById('quick-login-area');
    const navTabs      = document.getElementById('auth-tabs-navigation');
    const loginForm    = document.getElementById('form-auth-login');
    const registerForm = document.getElementById('form-auth-register');

    if (currentUser) {
        quickArea.style.display    = 'none';
        navTabs.style.display      = 'none';
        loginForm.style.display    = 'none';
        registerForm.style.display = 'none';
        statusBlock.style.display  = 'block';
        statusBlock.innerHTML = `
            <div class="auth-success-badge">
                <i class="fa-solid fa-circle-check"></i> Ești conectat ca <strong>${currentUser.name}</strong> (${currentUser.role.toUpperCase()})
            </div>
            <p style="text-align:center; color: var(--text-muted); font-size:0.9rem; margin-bottom:20px;">
                Poți folosi formularele de pe site sau poți intra direct în spațiul tău de lucru securizat.
            </p>
            <button onclick="openDashboard()" class="btn-action btn-orange" style="width:100%; justify-content:center;">
                <i class="fa-solid fa-right-to-bracket"></i> Intră în Panoul Personal Administrativ
            </button>
        `;
    } else {
        quickArea.style.display   = 'none';
        navTabs.style.display     = 'flex';
        statusBlock.style.display = 'none';
        switchAuthTab('login');
    }
}

// ============================================================
//  TRIMITERE CONTRACT / DOSAR TEHNIC
//  POST /api/contracts  → INSERT INTO contracts
// ============================================================

async function submitOnlineContract(e) {
    e.preventDefault();
    if (!currentUser) { alert('Trebuie să fii logat!'); navigateTo('auth'); return; }

    const payload = {
        client_id:    currentUser.id,
        client_email: currentUser.email,
        name:         document.getElementById('c_nume').value,
        address:      document.getElementById('c_adresa').value,
        type:         document.getElementById('c_tip').selectedOptions[0].text,
        price:        document.getElementById('c_total_pret').innerText,
        status:       'Proiectare Tehnică Inițială',
        eta:          'Calculat după avizare',
        progress:     20
    };

    try {
        await apiPost('/contracts', payload);
        // Serverul face: INSERT INTO contracts (...) VALUES (...)
        alert('Fișa tehnică a fost înregistrată cu succes în baza de date!');
        e.target.reset();
        updatePriceCalculator();
        navigateTo('home');
    } catch (err) {
        alert('Eroare la trimiterea dosarului: ' + err.message);
    }
}

// ============================================================
//  DESCHIDERE DASHBOARD
// ============================================================

function openDashboard() {
    document.getElementById('public-platform').style.display  = 'none';
    document.getElementById('private-dashboard').style.display = 'flex';
    buildDashboardView();
}

// ============================================================
//  CONSTRUIRE VIEW DASHBOARD
//  GET /api/contracts?client_id=X  sau  GET /api/contracts (admin)
//  GET /api/users (admin)
// ============================================================

async function buildDashboardView() {
    if (!currentUser) return;

    document.getElementById('db-user-name').innerText  = currentUser.name;
    document.getElementById('db-user-role').innerText  = currentUser.role.toUpperCase();
    document.getElementById('db-user-subtitle').innerText = '-';

    document.getElementById('view-client-zone').style.display   = 'none';
    document.getElementById('view-lucrator-zone').style.display  = 'none';
    document.getElementById('view-admin-zone').style.display    = 'none';

    if (currentUser.role === 'client') {
        document.getElementById('view-client-zone').style.display = 'block';
        document.getElementById('db-user-subtitle').innerText = 'Fișe de monitorizare pentru dosarele tale tehnice';

        try {
            const data = await apiGet(`/contracts?client_id=${encodeURIComponent(currentUser.id)}`);
            renderClientContracts(data.contracts || []);
        } catch (err) {
            console.error('Eroare incarcare contracte client:', err.message);
            renderClientContracts([]);
        }
    }
    else if (currentUser.role === 'lucrator') {
        document.getElementById('view-lucrator-zone').style.display = 'block';
        document.getElementById('db-user-subtitle').innerText = 'Sarcini de execuție mecanică și manuală în teren';
    }
    else if (currentUser.role === 'inginer') {
        document.getElementById('view-admin-zone').style.display = 'block';
        document.getElementById('db-user-subtitle').innerText = 'Sistem centralizat de management al resurselor și fluxurilor tehnice';

        try {
            const [usersData, contractsData] = await Promise.all([
                apiGet('/users'),
                apiGet('/contracts')
            ]);

            const allUsers     = usersData.users     || [];
            const allContracts = contractsData.contracts || [];

            document.getElementById('db-count-users').innerText     = allUsers.length;
            document.getElementById('db-count-contracte').innerText = allContracts.length;

            const editTableBody = document.getElementById('adminEditContractsTableBody');
            editTableBody.innerHTML = '';

            if (!allContracts.length) {
                editTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:24px;">Nu există dosare tehnice în baza de date.</td></tr>';
            }

            allContracts.forEach((c, index) => {
                editTableBody.innerHTML += `
                    <tr>
                        <td><input type="text" id="adm-name-${index}" value="${escHtml(c.name)}" class="admin-inline-input" style="font-weight:700;" data-id="${c.id}"></td>
                        <td><input type="text" id="adm-addr-${index}" value="${escHtml(c.address)}" class="admin-inline-input"></td>
                        <td><input type="text" id="adm-type-${index}" value="${escHtml(c.type)}" class="admin-inline-input"></td>
                        <td><input type="text" id="adm-price-${index}" value="${escHtml(c.price)}" class="admin-inline-input" style="color:var(--success); font-weight:700;"></td>
                        <td>
                            <div class="admin-progress-container">
                                <input type="range" id="adm-prog-${index}" value="${Number(c.progress) || 0}" min="0" max="100" step="5" style="width:90px;" oninput="document.getElementById('prog-val-${index}').innerText = this.value + '%'">
                                <span class="admin-progress-text" id="prog-val-${index}">${Number(c.progress) || 0}%</span>
                            </div>
                        </td>
                        <td>
                            <select id="adm-stat-${index}" class="admin-inline-input">
                                <option value="Proiectare Tehnică Inițială"  ${c.status === 'Proiectare Tehnică Inițială'  ? 'selected' : ''}>Proiectare Tehnică Inițială</option>
                                <option value="În Curs de Avizare"           ${c.status === 'În Curs de Avizare'           ? 'selected' : ''}>În Curs de Avizare</option>
                                <option value="Săpături Teren Deschise"      ${c.status === 'Săpături Teren Deschise'      ? 'selected' : ''}>Săpături Teren Deschise</option>
                                <option value="Montaj Conductă PEHD"         ${c.status === 'Montaj Conductă PEHD'         ? 'selected' : ''}>Montaj Conductă PEHD</option>
                                <option value="Probe de Presiune active"     ${c.status === 'Probe de Presiune active'     ? 'selected' : ''}>Probe de Presiune active</option>
                                <option value="Finalizat și Conectat"        ${c.status === 'Finalizat și Conectat'        ? 'selected' : ''}>Finalizat și Conectat</option>
                            </select>
                        </td>
                        <td><input type="text" id="adm-eta-${index}" value="${escHtml(c.eta)}" class="admin-inline-input"></td>
                        <td>
                            <div class="admin-actions">
                                <button class="btn-table-save" onclick="adminSaveChanges(${index}, ${c.id})">
                                    <i class="fa-solid fa-floppy-disk"></i> Salvează
                                </button>
                                <button class="btn-table-delete" onclick="adminDeleteContract(${c.id})">
                                    <i class="fa-solid fa-trash"></i> Șterge
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            const workersTableBody = document.getElementById('adminWorkersCredentialsTableBody');
            workersTableBody.innerHTML = '';

            const workers = allUsers.filter(u => u.role === 'lucrator');
            if (!workers.length) {
                workersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:24px;">Nu există lucrători înregistrați.</td></tr>';
            }

            workers.forEach(w => {
                workersTableBody.innerHTML += `
                    <tr>
                        <td><strong style="color: var(--primary-blue);"><i class="fa-solid fa-user-gear"></i> ${escHtml(w.name)}</strong></td>
                        <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius:4px; font-weight:600;">${escHtml(w.email)}</code></td>
                        <td><span style="font-family: monospace; color: var(--danger); font-weight: 700; background: #fee2e2; padding: 3px 8px; border-radius:4px;">••••••••</span></td>
                        <td><span class="badge badge-blue">${escHtml(String(w.role || '').toUpperCase())}</span></td>
                        <td><span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">${escHtml(w.spec || '')}</span></td>
                        <td><i class="fa-solid fa-phone" style="color: var(--success); margin-right:5px;"></i>${escHtml(w.phone || '—')}</td>
                    </tr>
                `;
            });

        } catch (err) {
            console.error('Eroare incarcare date admin:', err.message);
            document.getElementById('db-count-users').innerText = '0';
            document.getElementById('db-count-contracte').innerText = '0';
            const editTableBody = document.getElementById('adminEditContractsTableBody');
            if (editTableBody) {
                editTableBody.innerHTML = `<tr><td colspan="8"><div class="admin-error-box">Eroare la încărcarea datelor din MySQL/Railway: ${escHtml(err.message)}</div></td></tr>`;
            }
        }
    }
}

function renderClientContracts(contracts) {
    const noContract = document.getElementById('client-no-contract');
    const list = document.getElementById('client-contracts-list');

    if (!list || !noContract) return;

    list.innerHTML = '';

    if (!contracts.length) {
        noContract.style.display = 'block';
        return;
    }

    noContract.style.display = 'none';

    contracts.forEach((c, index) => {
        const progress = Math.max(0, Math.min(100, parseInt(c.progress) || 0));
        list.innerHTML += `
            <article class="client-contract-card">
                <div class="client-contract-head">
                    <div>
                        <h3>Dosar tehnic #${escHtml(c.id || index + 1)} — ${escHtml(c.name)}</h3>
                        <div class="client-contract-meta">
                            <i class="fa-solid fa-location-dot"></i> ${escHtml(c.address || 'Adresă necompletată')}
                        </div>
                    </div>
                    <span class="badge badge-blue">${progress}%</span>
                </div>

                <div class="client-progress-line">
                    <div class="client-progress-fill" style="width:${progress}%"></div>
                </div>

                <div class="client-contract-grid">
                    <div class="client-contract-field">
                        <span>Beneficiar contract</span>
                        <strong>${escHtml(c.name || '—')}</strong>
                    </div>
                    <div class="client-contract-field">
                        <span>Adresă</span>
                        <strong>${escHtml(c.address || '—')}</strong>
                    </div>
                    <div class="client-contract-field">
                        <span>Tip lucrare</span>
                        <strong>${escHtml(c.type || '—')}</strong>
                    </div>
                    <div class="client-contract-field">
                        <span>Deviz</span>
                        <strong>${escHtml(c.price || '—')}</strong>
                    </div>
                    <div class="client-contract-field">
                        <span>Status</span>
                        <strong>${escHtml(c.status || '—')}</strong>
                    </div>
                    <div class="client-contract-field">
                        <span>Predare estimată</span>
                        <strong>${escHtml(c.eta || '—')}</strong>
                    </div>
                </div>
            </article>
        `;
    });
}

// ============================================================
//  SALVARE MODIFICARI CONTRACT (ADMIN)
//  PATCH /api/contracts/:id  → UPDATE contracts SET ... WHERE id = :id
// ============================================================

async function adminSaveChanges(index, contractId) {
    const payload = {
        name:     document.getElementById(`adm-name-${index}`).value,
        address:  document.getElementById(`adm-addr-${index}`).value,
        type:     document.getElementById(`adm-type-${index}`).value,
        price:    document.getElementById(`adm-price-${index}`).value,
        progress: parseInt(document.getElementById(`adm-prog-${index}`).value),
        status:   document.getElementById(`adm-stat-${index}`).value,
        eta:      document.getElementById(`adm-eta-${index}`).value
    };

    try {
        // PATCH /api/contracts/42  → UPDATE contracts SET name=?, address=?, ... WHERE id=42
        await apiPatch(`/contracts/${contractId}`, payload);
        alert('Toate modificările pe dosarul tehnic au fost salvate cu succes!');
        buildDashboardView();
    } catch (err) {
        alert('Eroare la salvare: ' + err.message);
    }
}

async function adminDeleteContract(contractId) {
    if (!confirm('Sigur vrei să ștergi acest dosar tehnic? Acțiunea nu poate fi anulată.')) return;

    try {
        await apiDelete(`/contracts/${contractId}`);
        alert('Dosarul tehnic a fost șters.');
        buildDashboardView();
    } catch (err) {
        alert('Eroare la ștergere: ' + err.message);
    }
}


// ============================================================
//  LOGOUT
// ============================================================

function logoutSession() {
    localStorage.removeItem('prospUser');
    currentUser = null;
    document.getElementById('nav-auth-text').innerText           = 'Contul Meu';
    document.getElementById('private-dashboard').style.display   = 'none';
    document.getElementById('public-platform').style.display     = 'block';
    navigateTo('home');
}

// ============================================================
//  UTILITAR: escapeaza HTML pentru a preveni XSS la randare
// ============================================================

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
        const area = document.getElementById('quick-login-area');
        area.style.display = area.style.display === 'none' ? 'block' : 'none';
    }
});
// Restaurare UI dupa refresh
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) { syncUIAfterLogin(); }
});
function initScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-animate');

    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('animate-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', initScrollAnimations);

// ============================================================
//  VALIDARE CLIENT-SIDE IN TIMP REAL
// ============================================================

function validateEmailLive(input) {
    const hint = document.getElementById('email-hint');
    if (!hint) return true;

    const value = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    hint.className = 'field-hint ' + (valid ? 'hint-ok' : 'hint-err');
    hint.textContent = value.length === 0
        ? ''
        : (valid ? 'Email valid.' : 'Email invalid. Exemplu: nume@email.com');

    return valid;
}

function validatePasswordLive(input) {
    const hint = document.getElementById('pass-hint');
    const fill = document.getElementById('pass-strength-fill');
    if (!hint || !fill) return true;

    const pass = input.value;
    let score = 0;

    if (pass.length >= 8) score++;
    if (/[A-ZĂÂÎȘȚ]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9ĂÂÎȘȚăâîșț]/.test(pass)) score++;

    const width = [0, 30, 55, 80, 100][score];
    fill.style.width = width + '%';

    if (score <= 1) {
        fill.style.background = '#dc2626';
        hint.className = 'field-hint hint-err';
        hint.textContent = 'Parola trebuie să aibă minim 8 caractere.';
    } else if (score === 2) {
        fill.style.background = '#f59e0b';
        hint.className = 'field-hint hint-err';
        hint.textContent = 'Parolă acceptabilă, dar slabă.';
    } else {
        fill.style.background = '#16a34a';
        hint.className = 'field-hint hint-ok';
        hint.textContent = 'Parolă bună.';
    }

    return pass.length >= 8;
}

// ============================================================
//  SCROLL TO TOP BUTTON
// ============================================================

function initScrollTopButton() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;

    function toggleScrollButton() {
        btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    }

    window.addEventListener('scroll', toggleScrollButton);
    toggleScrollButton();
}


// ============================================================
//  BOOTSTRAP UI
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) {
        syncUIAfterLogin();
    }

    updatePriceCalculator();
    initScrollAnimations();
    initScrollTopButton();

    document.querySelectorAll('.page-section.active-page .scroll-animate').forEach(el => {
        el.classList.add('animate-visible');
    });
});
