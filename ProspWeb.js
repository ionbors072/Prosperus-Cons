// ============================================================
//  ProspWeb.js — Logica platformei Prosperus-Cons
//  Baza de date: prospwebdb  |  API base: /api
// ============================================================

const API = '/api';          // schimba cu URL-ul real al backend-ului tau

let currentUser = null;

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

// ============================================================
//  SECURITATE FORMULAR CONTRACT
// ============================================================

function checkContractSecurityState() {
    const notice = document.getElementById('contract-security-notice');
    const formInputs = document.querySelectorAll('#publicContractForm input, #publicContractForm select, #publicContractForm button');
    if (currentUser) {
        notice.style.display = 'none';
        formInputs.forEach(i => i.disabled = false);
    } else {
        notice.style.display = 'flex';
        formInputs.forEach(i => i.disabled = true);
    }
}

// ============================================================
//  NAVIGARE
// ============================================================

function handleAuthNavButtonClick() {
    if (currentUser) { openDashboard(); } else { navigateTo('auth'); }
}

function navigateTo(pageId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active-page'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const section = document.getElementById(`page-${pageId}`);
    if (section) section.classList.add('active-page');
    const link = document.getElementById(`link-${pageId}`);
    if (link) link.classList.add('active');
    if (pageId === 'contract') checkContractSecurityState();
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
    const tip = document.getElementById('c_tip').value;
    const lungime = parseFloat(document.getElementById('c_lungime').value) || 0;
    const costPerMetru = tip === 'canal' ? 65 : (tip === 'pachet' ? 100 : 50);
    document.getElementById('c_total_pret').innerText = `${(lungime * costPerMetru) + 740} EUR`;
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
    document.getElementById('db-user-name').innerText  = currentUser.name;
    document.getElementById('db-user-role').innerText  = currentUser.role.toUpperCase();
    document.getElementById('db-user-subtitle').innerText = '-';

    document.getElementById('view-client-zone').style.display   = 'none';
    document.getElementById('view-lucrator-zone').style.display  = 'none';
    document.getElementById('view-admin-zone').style.display    = 'none';

    if (currentUser.role === 'client') {
        document.getElementById('view-client-zone').style.display = 'block';
        document.getElementById('db-user-subtitle').innerText = 'Fișa de monitorizare a conexiunii la utilități';

        try {
            // GET /api/contracts?client_id=X
            // Serverul face: SELECT * FROM contracts WHERE client_id = X LIMIT 1
            const data = await apiGet(`/contracts?client_id=${currentUser.id}`);
            const c = data.contracts[0];
            if (c) {
                document.getElementById('client-progress-bar').style.width = c.progress + '%';
                document.getElementById('info-det-nume').innerText   = c.name;
                document.getElementById('info-det-adresa').innerText = c.address;
                document.getElementById('info-det-tip').innerText    = c.type;
                document.getElementById('info-det-pret').innerText   = c.price;
                document.getElementById('info-det-status').innerText = c.status;
                document.getElementById('info-det-eta').innerText    = c.eta;
                const p = parseInt(c.progress);
                document.getElementById('step-1').className = p >= 20 ? 'active-step' : '';
                document.getElementById('step-2').className = p >= 45 ? 'active-step' : '';
                document.getElementById('step-3').className = p >= 70 ? 'active-step' : '';
                document.getElementById('step-4').className = p >= 95 ? 'active-step' : '';
            }
        } catch (err) {
            console.error('Eroare incarcare contract client:', err.message);
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
            // GET /api/users       → SELECT * FROM users
            // GET /api/contracts   → SELECT * FROM contracts
            const [usersData, contractsData] = await Promise.all([
                apiGet('/users'),
                apiGet('/contracts')
            ]);

            const allUsers     = usersData.users     || [];
            const allContracts = contractsData.contracts || [];

            document.getElementById('db-count-users').innerText     = allUsers.length;
            document.getElementById('db-count-contracte').innerText = allContracts.length;

            // 1. Tabel dosare/santiere (editabil)
            const editTableBody = document.getElementById('adminEditContractsTableBody');
            editTableBody.innerHTML = '';
            allContracts.forEach((c, index) => {
                editTableBody.innerHTML += `
                    <tr>
                        <td><input type="text" id="adm-name-${index}" value="${escHtml(c.name)}" class="admin-inline-input" style="font-weight:700;" data-id="${c.id}"></td>
                        <td><input type="text" id="adm-addr-${index}" value="${escHtml(c.address)}" class="admin-inline-input"></td>
                        <td><input type="text" id="adm-type-${index}" value="${escHtml(c.type)}" class="admin-inline-input"></td>
                        <td><input type="text" id="adm-price-${index}" value="${escHtml(c.price)}" class="admin-inline-input" style="color:var(--success); font-weight:700;"></td>
                        <td>
                            <div class="admin-progress-container">
                                <input type="range" id="adm-prog-${index}" value="${c.progress}" min="0" max="100" step="5" style="width:90px;" oninput="document.getElementById('prog-val-${index}').innerText = this.value + '%'">
                                <span class="admin-progress-text" id="prog-val-${index}">${c.progress}%</span>
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
                            <button class="btn-table-save" onclick="adminSaveChanges(${index}, ${c.id})">
                                <i class="fa-solid fa-floppy-disk"></i> Salvează
                            </button>
                        </td>
                    </tr>
                `;
            });

            // 2. Tabel credentiale lucratori
            const workersTableBody = document.getElementById('adminWorkersCredentialsTableBody');
            workersTableBody.innerHTML = '';
            allUsers.filter(u => u.role === 'lucrator').forEach(w => {
                workersTableBody.innerHTML += `
                    <tr>
                            <td><strong style="color: var(--primary-blue);"><i class="fa-solid fa-user-gear"></i> ${escHtml(w.name)}</strong></td>
                            <td><code style="background: #f1f5f9; padding: 4px 8px; border-radius:4px; font-weight:600;">${escHtml(w.email)}</code></td>
                            <td><span style="font-family: monospace; color: var(--danger); font-weight: 700; background: #fee2e2; padding: 3px 8px; border-radius:4px;">••••••••</span></td>
                            <td><span class="badge badge-blue">${w.role.toUpperCase()}</span></td>
                            <td><span style="font-size: 0.9rem; font-weight: 600; color: var(--text-muted);">${escHtml(w.spec || '')}</span></td>
                            <td><i class="fa-solid fa-phone" style="color: var(--success); margin-right:5px;"></i>${escHtml(w.phone || '—')}</td>
                    </tr>
                `;
                });

        } catch (err) {
            console.error('Eroare incarcare date admin:', err.message);
        }
    }
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

// ============================================================
//  LOGOUT
// ============================================================

function logoutSession() {
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