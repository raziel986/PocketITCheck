// PocketITCheck - Core Logic
// Versión: 2.0 (Externalized & Optimized)

// Manejo de Persistencia
let appData = JSON.parse(localStorage.getItem('pocketITCheckAppV2') || localStorage.getItem('pocketInventoryAppV2')) || [];
let activeOfficeId = null;
let editingIndex = -1;
let editingOfficeId = null;
let diagnosticIndex = -1;
let resultIndex = -1;

const tableState = {
    offices: { currentPage: 1, itemsPerPage: 10, searchQuery: "" },
    equipment: { currentPage: 1, itemsPerPage: 10, searchQuery: "" }
};

// Diccionarios Globales
const techLabelsDict = {
    power: "Energía/Batería", storage: "Almacenamiento", ram: "Memoria RAM",
    temp: "Térmico/Fans", clean: "Limpieza Física",
    os: "Sistema Operativo", security: "Seguridad/AV",
    performance: "Rendimiento/Drivers", license: "Licenciamiento"
};

// DOM Referencias
const viewCreateOfficeSidebar = document.getElementById('viewCreateOfficeSidebar');
const viewAddEquipmentSidebar = document.getElementById('viewAddEquipmentSidebar');
const viewOfficesTable = document.getElementById('viewOfficesTable');
const viewInventoryTable = document.getElementById('viewInventoryTable');
const officeForm = document.getElementById('officeForm');
const inventoryForm = document.getElementById('inventoryForm');
const officesTableBody = document.getElementById('officesTableBody');
const activeOfficeSummary = document.getElementById('activeOfficeSummary');
const tbody = document.getElementById('tableBody');
const countBadge = document.getElementById('itemCount');
const typeSelect = document.getElementById('type');
const dynamicContainer = document.getElementById('dynamicFieldsContainer');
const submitBtnOffice = document.getElementById('submitBtnOffice');
const cancelEditOfficeBtn = document.getElementById('cancelEditOfficeBtn');
const submitBtnEquipment = document.getElementById('submitBtnEquipment');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// =============== UTILIDADES ===============

function saveAppData() {
    localStorage.setItem('pocketITCheckAppV2', JSON.stringify(appData));
    localStorage.removeItem('pocketInventoryAppV2');
}

function getActiveOffice() {
    return appData.find(o => o.id === activeOfficeId);
}

function handleSearch(tableType, query) {
    tableState[tableType].searchQuery = query.toLowerCase();
    tableState[tableType].currentPage = 1;
    if (tableType === 'offices') renderOfficesTable();
    else renderTable();
}

function changeLength(tableType, length) {
    tableState[tableType].itemsPerPage = length === 'all' ? Infinity : parseInt(length);
    tableState[tableType].currentPage = 1;
    if (tableType === 'offices') renderOfficesTable();
    else renderTable();
}

function updatePagination(tableType, totalItems, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const state = tableState[tableType];
    container.innerHTML = '';
    if (state.itemsPerPage === Infinity || totalItems <= state.itemsPerPage) return;

    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn'; prevBtn.innerHTML = '‹';
    prevBtn.disabled = (state.currentPage === 1);
    prevBtn.onclick = () => { state.currentPage--; if (tableType === 'offices') renderOfficesTable(); else renderTable(); };
    container.appendChild(prevBtn);

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Página ${state.currentPage} de ${totalPages}`;
    container.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn'; nextBtn.innerHTML = '›';
    nextBtn.disabled = (state.currentPage === totalPages);
    nextBtn.onclick = () => { state.currentPage++; if (tableType === 'offices') renderOfficesTable(); else renderTable(); };
    container.appendChild(nextBtn);
}

// =============== GESTOR DE OFICINAS ===============

function renderOfficesTable() {
    if (!officesTableBody) return;
    officesTableBody.innerHTML = '';
    const state = tableState.offices;
    let filtered = appData.filter(o =>
        o.company.toLowerCase().includes(state.searchQuery) ||
        o.depto.toLowerCase().includes(state.searchQuery) ||
        o.location.toLowerCase().includes(state.searchQuery) ||
        o.auditor.toLowerCase().includes(state.searchQuery)
    );

    if (filtered.length === 0) {
        officesTableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><div style="font-size: 2rem; margin-bottom: 1rem;">🏢</div>${state.searchQuery ? 'No se encontraron resultados.' : 'No hay oficinas registradas.'}</td></tr>`;
        const pag = document.getElementById('officePagination'); if (pag) pag.innerHTML = '';
    } else {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        paged.forEach(office => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="Empresa / Cliente"><strong class="text-primary">${office.company}</strong><br /><span class="text-secondary">Depto: ${office.depto}</span></td>
                <td data-label="Ubicación">${office.location}</td>
                <td data-label="Auditor">${office.auditor}</td>
                <td data-label="Equipos" class="text-center"><span class="badge-count">${office.inventory.length}</span></td>
                <td data-label="Acciones" class="action-col">
                    <div class="action-icons">
                        <button class="icon-btn icon-btn-info" title="Seleccionar" onclick="selectOffice('${office.id}')">📂</button>
                        <button class="icon-btn icon-btn-edit" title="Editar" onclick="editOffice('${office.id}')">✏️</button>
                        <button class="icon-btn icon-btn-danger" title="Borrar" onclick="deleteOffice('${office.id}')">🗑️</button>
                    </div>
                </td>`;
            officesTableBody.appendChild(tr);
        });
        updatePagination('offices', filtered.length, 'officePagination');
    }
    const badge = document.getElementById('officeCountBadge');
    if (badge) badge.textContent = `${filtered.length} oficina${filtered.length !== 1 ? 's' : ''}`;
}

officeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (editingOfficeId) {
        const o = appData.find(o => o.id === editingOfficeId);
        if (o) {
            o.company = document.getElementById('officeCompany').value.trim();
            o.depto = document.getElementById('officeDepto').value.trim();
            o.location = document.getElementById('officeLocation').value.trim();
            o.auditor = document.getElementById('officeAuditor').value.trim();
            o.auditorCompany = document.getElementById('officeAuditorCompany').value.trim();
            o.auditDate = document.getElementById('officeDate').value;
            o.manager = document.getElementById('officeManager').value.trim();
            o.managerTitle = document.getElementById('officeManagerTitle').value.trim();
        }
        editingOfficeId = null;
        submitBtnOffice.innerHTML = '📝 Registrar Oficina';
        cancelEditOfficeBtn.style.display = 'none';
    } else {
        appData.push({
            id: Date.now().toString(),
            company: document.getElementById('officeCompany').value.trim(),
            depto: document.getElementById('officeDepto').value.trim(),
            location: document.getElementById('officeLocation').value.trim(),
            auditor: document.getElementById('officeAuditor').value.trim(),
            auditorCompany: document.getElementById('officeAuditorCompany').value.trim(),
            auditDate: document.getElementById('officeDate').value,
            manager: document.getElementById('officeManager').value.trim(),
            managerTitle: document.getElementById('officeManagerTitle').value.trim(),
            inventory: []
        });
    }
    saveAppData(); renderOfficesTable(); officeForm.reset();
});

function editOffice(id) {
    const o = appData.find(o => o.id === id);
    if (!o) return;
    editingOfficeId = id;
    document.getElementById('officeCompany').value = o.company;
    document.getElementById('officeDepto').value = o.depto;
    document.getElementById('officeLocation').value = o.location;
    document.getElementById('officeAuditor').value = o.auditor;
    document.getElementById('officeAuditorCompany').value = o.auditorCompany || '';
    document.getElementById('officeDate').value = o.auditDate || '';
    document.getElementById('officeManager').value = o.manager || '';
    document.getElementById('officeManagerTitle').value = o.managerTitle || '';
    submitBtnOffice.innerHTML = '💾 Guardar Cambios';
    cancelEditOfficeBtn.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEditOffice() {
    editingOfficeId = null; officeForm.reset();
    submitBtnOffice.innerHTML = '📝 Registrar Oficina';
    cancelEditOfficeBtn.style.display = 'none';
}

async function deleteOffice(id) {
    const res = await Swal.fire({
        title: '¿Estás seguro?', text: "Se perderán todos los equipos de esta oficina.", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Sí, eliminar'
    });
    if (res.isConfirmed) {
        appData = appData.filter(o => o.id !== id);
        saveAppData(); renderOfficesTable();
        Swal.fire({ title: '¡Eliminado!', icon: 'success', timer: 1500, showConfirmButton: false });
    }
}

function selectOffice(id) {
    const o = appData.find(o => o.id === id);
    if (!o) return;
    activeOfficeId = id;
    viewCreateOfficeSidebar.style.display = 'none';
    viewOfficesTable.style.display = 'none';
    viewAddEquipmentSidebar.style.display = 'block';
    viewInventoryTable.style.display = 'block';
    activeOfficeSummary.innerHTML = `
        <div style="font-weight: 600; margin-bottom:0.3rem;">🏢 ${o.company}</div>
        <div style="color: #475569;">Depto: ${o.depto}</div>
        <div style="color: #475569;">📍 ${o.location}</div>
        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e2e8f0;">
            <span style="color: #475569;">👤 <b>Auditor:</b> ${o.auditor}</span><br />
            <span style="color: #475569;">👔 <b>Resp. Oficina:</b> ${o.manager} - <em>${o.managerTitle}</em></span>
        </div>`;

    // Para el print oculto
    const pComp = document.getElementById('print_company'); if (pComp) pComp.textContent = o.company;
    const pDept = document.getElementById('print_depto'); if (pDept) pDept.textContent = o.depto;
    const pLoc = document.getElementById('print_location'); if (pLoc) pLoc.textContent = o.location;
    const pAud = document.getElementById('print_auditor'); if (pAud) pAud.textContent = o.auditor;

    renderTable();
}

function goBackToOffices() {
    activeOfficeId = null; cancelEdit();
    viewCreateOfficeSidebar.style.display = 'block';
    viewOfficesTable.style.display = 'block';
    viewAddEquipmentSidebar.style.display = 'none';
    viewInventoryTable.style.display = 'none';
    renderOfficesTable();
}

// =============== GESTOR DE EQUIPOS ===============

const categoryFields = {
    "Laptop": [
        { id: "dyn_os", label: "Sistema Operativo", type: "text", placeholder: "Ej: Windows 11 Pro" },
        { id: "dyn_cpu", label: "Procesador (CPU)", type: "text", placeholder: "Ej: Intel i5" },
        { id: "dyn_ram", label: "Memoria RAM", type: "text", placeholder: "Ej: 16GB" },
        { id: "dyn_storage", label: "Almacenamiento", type: "text", placeholder: "Ej: 512GB SSD" },
        { id: "dyn_mac", label: "MAC Address", type: "text", placeholder: "Ej: 00:1A:..." }
    ],
    "Desktop": [
        { id: "dyn_os", label: "Sistema Operativo", type: "text", placeholder: "Ej: Windows 11 Pro" },
        { id: "dyn_cpu", label: "Procesador (CPU)", type: "text", placeholder: "Ej: Intel i7" },
        { id: "dyn_ram", label: "Memoria RAM", type: "text", placeholder: "Ej: 32GB" },
        { id: "dyn_storage", label: "Almacenamiento", type: "text", placeholder: "Ej: 1TB SSD" },
        { id: "dyn_mac", label: "MAC Address", type: "text", placeholder: "Ej: A1:B2:..." }
    ],
    "Monitor": [
        { id: "dyn_size", label: "Tamaño (Pulgadas)", type: "number", placeholder: "Ej: 27" },
        { id: "dyn_res", label: "Resolución", type: "text", placeholder: "Ej: 2560x1440" },
        { id: "dyn_panel", label: "Tipo de Panel", type: "text", placeholder: "Ej: IPS" },
        { id: "dyn_conn", label: "Conectividad", type: "text", placeholder: "Ej: HDMI" }
    ],
    "Periférico": [
        { id: "dyn_type", label: "Tipo Específico", type: "text", placeholder: "Ej: Teclado" },
        { id: "dyn_conn", label: "Interfaz", type: "text", placeholder: "Ej: USB" }
    ],
    "Impresora": [
        { id: "dyn_type", label: "Tecnología", type: "text", placeholder: "Ej: Láser" },
        { id: "dyn_ip", label: "Dirección IP", type: "text", placeholder: "Ej: 192.168.1.50" },
        { id: "dyn_mac", label: "MAC Address", type: "text", placeholder: "Ej: 00:1A:..." },
        { id: "dyn_consum", label: "Consumible", type: "text", placeholder: "Ej: HP 85A" }
    ],
    "Red": [
        { id: "dyn_role", label: "Rol / Función", type: "text", placeholder: "Ej: Switch" },
        { id: "dyn_ip", label: "IP Admin", type: "text", placeholder: "Ej: 10.0.0.1" },
        { id: "dyn_firm", label: "Firmware", type: "text", placeholder: "Ej: Cisco IOS" },
        { id: "dyn_ports", label: "Puertos", type: "number", placeholder: "Ej: 24" }
    ]
};

if (typeSelect) {
    typeSelect.addEventListener('change', function () {
        const fields = categoryFields[this.value];
        dynamicContainer.innerHTML = '';
        if (fields) {
            fields.forEach(f => {
                const div = document.createElement('div'); div.className = 'form-group';
                div.innerHTML = `<label>${f.label}</label><input type="${f.type}" id="${f.id}" placeholder="${f.placeholder}">`;
                dynamicContainer.appendChild(div);
            });
        }
    });
}

function renderTable() {
    if (!tbody) return;
    tbody.innerHTML = '';
    const o = getActiveOffice(); if (!o) return;
    const state = tableState.equipment;
    let filtered = o.inventory.map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => {
            const q = state.searchQuery;
            return item.assetTag.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) ||
                item.model.toLowerCase().includes(q) || item.serial.toLowerCase().includes(q) ||
                item.user.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q);
        });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state"><div style="font-size: 2rem; margin-bottom: 1rem;">📭</div>${state.searchQuery ? 'No se encontraron equipos.' : 'No hay equipos registrados.'}</td></tr>`;
        const pag = document.getElementById('equipmentPagination'); if (pag) pag.innerHTML = '';
    } else {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        paged.forEach(item => {
            const tr = document.createElement('tr');
            const sb = item.status === 'Activo' ? '<span class="status-badge status-active">Activo</span>' :
                item.status === 'Stock' ? '<span class="status-badge status-stock">Stock</span>' :
                    item.status === 'Reparación' ? '<span class="status-badge status-repair">Reparo</span>' :
                        '<span class="status-badge status-off">Baja</span>';
            const hasIssues = item.diagnostics && (Object.values(item.diagnostics.hardware).includes(false) || Object.values(item.diagnostics.software).includes(false));
            tr.innerHTML = `
                <td data-label="ID Activo"><strong>${item.assetTag}</strong></td>
                <td data-label="Info General"><div class="font-bold">${item.type}</div><div class="text-secondary">${item.model}</div><div class="serial-tag">S/N: ${item.serial}</div></td>
                <td data-label="Estado & Asignación"><div style="margin-bottom:0.3rem;">${sb}</div><div>${item.user}</div></td>
                <td data-label="Especificaciones">
                    <div class="line-height-14">${item.notes.replace(/ \| /g, '<br />')}</div>
                    ${item.hasWarranty === 'No' ? '<div class="warranty-over"><strong>Garantía:</strong> Vencida</div>' :
                    (item.purchaseDate || item.warrantyDate) ? `<div class="warranty-info">${item.purchaseDate ? `<strong>Compra:</strong> ${item.purchaseDate}` : ''}${item.warrantyDate ? ` <strong>Garantía:</strong> ${item.warrantyDate}` : ''}</div>` : ''}
                </td>
                <td data-label="Acciones" class="action-col">
                    <div class="action-icons">
                        <button class="icon-btn icon-btn-diagnostic" title="Diagnóstico" onclick="openDiagnostic(${item.originalIndex})">🩺</button>
                        ${hasIssues ? `<button class="icon-btn icon-btn-info" title="Resultado" onclick="openMaintenanceResult(${item.originalIndex})" style="background: #d1fae5; border-color: #059669;">✅</button>` : ''}
                        <button class="icon-btn icon-btn-edit" title="Editar" onclick="editItem(${item.originalIndex})">✏️</button>
                        <button class="icon-btn icon-btn-danger" title="Borrar" onclick="deleteItem(${item.originalIndex})">🗑️</button>
                    </div>
                </td>`;
            tbody.appendChild(tr);
        });
        updatePagination('equipment', filtered.length, 'equipmentPagination');
    }
    if (countBadge) countBadge.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
}

function toggleDates() {
    const hasW = document.getElementById('hasWarranty').value;
    const dContainer = document.getElementById('datesContainer');
    if (dContainer) dContainer.style.display = hasW === 'Sí' ? 'grid' : 'none';
}

inventoryForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let dynNotes = []; let dynData = {};
    dynamicContainer.querySelectorAll('input').forEach(input => {
        if (input.value.trim()) {
            dynNotes.push(`${input.previousElementSibling.innerText}: ${input.value.trim()}`);
            dynData[input.id] = input.value.trim();
        }
    });
    const base = document.getElementById('notes').value.trim();
    const finalN = dynNotes.length > 0 ? (base ? `${dynNotes.join(' | ')} | Notas: ${base}` : dynNotes.join(' | ')) : (base || '-');
    const newItem = {
        assetTag: document.getElementById('assetTag').value.trim(),
        status: document.getElementById('status').value,
        hasWarranty: document.getElementById('hasWarranty').value,
        purchaseDate: document.getElementById('purchaseDate').value,
        warrantyDate: document.getElementById('warrantyDate').value,
        type: typeSelect.options[typeSelect.selectedIndex].text,
        typeValue: typeSelect.value,
        model: document.getElementById('model').value.trim(),
        serial: document.getElementById('serial').value.trim(),
        user: document.getElementById('user').value.trim(),
        notes: finalN, baseNotes: base, dynamicData: dynData
    };
    const o = getActiveOffice();
    if (editingIndex > -1) { o.inventory[editingIndex] = newItem; editingIndex = -1; submitBtnEquipment.innerHTML = '➕ Añadir Equipo'; cancelEditBtn.style.display = 'none'; }
    else { o.inventory.push(newItem); }
    saveAppData(); renderTable(); inventoryForm.reset();
    document.getElementById('status').value = 'Activo'; document.getElementById('hasWarranty').value = 'Sí';
    toggleDates(); dynamicContainer.innerHTML = '';
});

function editItem(idx) {
    const o = getActiveOffice(); const item = o.inventory[idx]; editingIndex = idx;
    document.getElementById('assetTag').value = item.assetTag;
    document.getElementById('status').value = item.status;
    document.getElementById('hasWarranty').value = item.hasWarranty || 'Sí'; toggleDates();
    document.getElementById('purchaseDate').value = item.purchaseDate || '';
    document.getElementById('warrantyDate').value = item.warrantyDate || '';
    document.getElementById('model').value = item.model;
    document.getElementById('serial').value = item.serial;
    document.getElementById('user').value = item.user;
    document.getElementById('notes').value = item.baseNotes || '';
    typeSelect.value = item.typeValue || ""; typeSelect.dispatchEvent(new Event('change'));
    setTimeout(() => {
        if (item.dynamicData) Object.keys(item.dynamicData).forEach(id => { const el = document.getElementById(id); if (el) el.value = item.dynamicData[id]; });
    }, 10);
    submitBtnEquipment.innerHTML = '💾'; document.getElementById('equipmentFormTitle').innerHTML = '📋 Editar Equipo';
    cancelEditBtn.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editingIndex = -1; inventoryForm.reset();
    document.getElementById('status').value = 'Activo'; document.getElementById('hasWarranty').value = 'Sí';
    toggleDates(); dynamicContainer.innerHTML = '';
    if (submitBtnEquipment) submitBtnEquipment.innerHTML = '➕ Añadir Equipo';
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
}

async function deleteItem(idx) {
    const res = await Swal.fire({
        title: '¿Eliminar?', text: "¿Estás seguro?", icon: 'question',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Sí, eliminar'
    });
    if (res.isConfirmed) {
        const o = getActiveOffice(); o.inventory.splice(idx, 1);
        if (editingIndex === idx) cancelEdit(); else if (editingIndex > idx) editingIndex--;
        saveAppData(); renderTable();
        Swal.fire({ title: '¡Hecho!', icon: 'success', timer: 1500, showConfirmButton: false });
    }
}

// =============== MÓDULO DE DIAGNÓSTICO INTEGRADO ===============

function closeIntegratedDiagnostic() {
    document.getElementById('diag-integrated-section').style.display = 'none';
    const viewInv = document.getElementById('viewInventoryTable');
    if (viewInv) { viewInv.style.display = 'block'; viewInv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

function toggleSubItems(key, checked) {
    const container = document.getElementById(`sub-${key}`);
    if (container) container.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = checked);
}

function checkParentStatus(key) {
    const container = document.getElementById(`sub-${key}`);
    const parent = document.getElementById(`main-${key}`);
    if (container && parent) parent.checked = Array.from(container.querySelectorAll('input[type="checkbox"]')).every(c => c.checked);
}

function openDiagnostic(index) {
    diagnosticIndex = index;
    const item = getActiveOffice().inventory[index];
    const diag = item.diagnostics || { hardware: {}, software: {}, notes: '' };

    document.getElementById('diag-title').innerText = `🩺 Diagnóstico: ${item.assetTag}`;
    document.getElementById('diag-subtitle').innerText = `${item.type} - ${item.model}`;
    document.getElementById('diag-notes-input').value = diag.notes || '';

    const pdfBtn = document.getElementById('diag-pdf-btn');
    if (item.diagnostics) {
        pdfBtn.style.display = 'block';
        pdfBtn.onclick = () => generateMaintenancePlanPDF(index);
    } else {
        pdfBtn.style.display = 'none';
    }

    const container = document.getElementById('diag-grid-container');
    const sections = [
        { id: 'power', l: 'Energía', i: '🔌', isH: true, sub: [{ id: 'cable', l: 'Cables' }, { id: 'bat', l: 'Batería' }] },
        { id: 'storage', l: 'Disco', i: '💽', isH: true, sub: [{ id: 'smart', l: 'S.M.A.R.T.' }, { id: 'speed', l: 'Velocidad' }] },
        { id: 'ram', l: 'RAM', i: '🧠', isH: true, sub: [{ id: 'test', l: 'MemTest' }, { id: 'clean', l: 'Contactos' }] },
        { id: 'temp', l: 'Térmico', i: '🌡️', isH: true, sub: [{ id: 'paste', l: 'Pasta' }, { id: 'fan', l: 'Fans' }] },
        { id: 'clean', l: 'Limpieza', i: '扫', isH: true, sub: [{ id: 'int', l: 'Interna' }, { id: 'ext', l: 'Externa' }] },
        { id: 'os', l: 'Sistema', i: '🖥️', isH: false, sub: [{ id: 'upd', l: 'Updates' }, { id: 'sfc', l: 'Integridad' }] },
        { id: 'security', l: 'Seguridad', i: '🛡️', isH: false, sub: [{ id: 'av', l: 'Antivirus' }, { id: 'fw', l: 'Firewall' }] },
        { id: 'performance', l: 'Rendimiento', i: '🚀', isH: false, sub: [{ id: 'drv', l: 'Drivers' }, { id: 'bg', l: 'Carga Rec.' }] },
        { id: 'license', l: 'Licencia', i: '🔑', isH: false, sub: [{ id: 'win', l: 'Windows' }, { id: 'off', l: 'Office' }] }
    ];

    let html = '';
    sections.forEach(s => {
        const diagRef = s.isH ? diag.hardware : diag.software;
        const cur = (diagRef && diagRef[s.id] !== undefined) ? diagRef[s.id] : true;
        const subData = diag.subItems ? (diag.subItems[s.id] || {}) : {};
        html += `
        <div class="diag-section" style="background:#f8fafc; padding:1rem; border-radius:12px; border:1px solid #e2e8f0;">
            <div style="font-weight:700; color:var(--primary); margin-bottom:0.8rem; display:flex; align-items:center; gap:0.5rem;">${s.i} ${s.l}</div>
            <div style="display:flex; align-items:center; gap:0.6rem; padding:0.5rem; background:white; border-radius:8px; border:1px solid #f1f5f9; margin-bottom:0.5rem;">
                <input type="checkbox" id="main-${s.id}" ${cur ? 'checked' : ''} onchange="toggleSubItems('${s.id}', this.checked)">
                <label for="main-${s.id}" style="font-weight:600; cursor:pointer;">OK</label>
            </div>
            <div class="sub-item-list" id="sub-${s.id}">
                ${s.sub.map(subItem => {
            const isChecked = subData[subItem.id] !== undefined ? subData[subItem.id] : true;
            return `
                    <div class="sub-check">
                        <input type="checkbox" id="${s.id}-${subItem.id}" ${isChecked ? 'checked' : ''} onchange="checkParentStatus('${s.id}')">
                        <label for="${s.id}-${subItem.id}">${subItem.l}</label>
                    </div>`;
        }).join('')}
            </div>
        </div>`;
    });
    container.innerHTML = html;
    document.getElementById('diag-integrated-section').style.display = 'block';
    const viewInv = document.getElementById('viewInventoryTable'); if (viewInv) viewInv.style.display = 'none';
    document.getElementById('diag-integrated-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveIntegratedDiagnosticFlow() {
    const o = getActiveOffice(); const item = o.inventory[diagnosticIndex];
    const hwKeys = ['power', 'storage', 'ram', 'temp', 'clean'];
    const swKeys = ['os', 'security', 'performance', 'license'];
    const hardware = {}; const software = {}; const subItems = {};

    hwKeys.forEach(k => {
        hardware[k] = document.getElementById(`main-${k}`).checked;
        const sub = {}; document.getElementById(`sub-${k}`).querySelectorAll('input').forEach(c => sub[c.id.split('-')[1]] = c.checked);
        subItems[k] = sub;
    });
    swKeys.forEach(k => {
        software[k] = document.getElementById(`main-${k}`).checked;
        const sub = {}; document.getElementById(`sub-${k}`).querySelectorAll('input').forEach(c => sub[c.id.split('-')[1]] = c.checked);
        subItems[k] = sub;
    });

    item.diagnostics = { hardware, software, subItems, notes: document.getElementById('diag-notes-input').value };
    if (Object.values(hardware).includes(false) || Object.values(software).includes(false)) item.status = "Reparación";
    else if (item.status === 'Reparación') item.status = "Activo";

    saveAppData(); renderTable(); closeIntegratedDiagnostic();
    Swal.fire({ title: 'Guardado', icon: 'success', timer: 1500, showConfirmButton: false });
}

// =============== MÓDULO DE RESULTADOS INTEGRADO ===============

function openMaintenanceResult(index) {
    resultIndex = index;
    const item = getActiveOffice().inventory[index];
    const diag = item.diagnostics;
    if (!diag) return Swal.fire({ title: 'Sin Diagnóstico', icon: 'warning' });

    document.getElementById('result-title').innerText = `✅ Resultado: ${item.assetTag}`;
    document.getElementById('result-subtitle').innerText = `${item.type} - ${item.model}`;
    const prev = item.maintenanceResult || {};
    document.getElementById('result-status').value = prev.status || 'Pendiente';
    document.getElementById('result-date').value = prev.date || new Date().toISOString().split('T')[0];
    document.getElementById('result-notes-input').value = prev.techNotes || '';

    const container = document.getElementById('result-items-container');
    const allKeys = [...Object.keys(diag.hardware), ...Object.keys(diag.software)];
    const failedKeys = allKeys.filter(k => (diag.hardware[k] === false || diag.software[k] === false));

    if (failedKeys.length === 0) {
        container.innerHTML = '<p style="color:#059669;">Mantenimiento preventivo de rutina.</p>';
    } else {
        const resPrev = prev.resolvedItems || {};
        container.innerHTML = failedKeys.map(k => `
            <div style="display:flex; align-items:center; gap:0.6rem; padding:0.5rem; background:white; border-radius:8px; border:1px solid #f1f5f9;">
                <input type="checkbox" id="res-${k}" ${resPrev[k] ? 'checked' : ''}>
                <label for="res-${k}">${techLabelsDict[k] || k}</label>
            </div>`).join('');
    }

    document.getElementById('result-integrated-section').style.display = 'block';
    const viewInv = document.getElementById('viewInventoryTable'); if (viewInv) viewInv.style.display = 'none';
    document.getElementById('result-integrated-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeMaintenanceResult() {
    document.getElementById('result-integrated-section').style.display = 'none';
    const viewInv = document.getElementById('viewInventoryTable'); if (viewInv) viewInv.style.display = 'block';
}

function saveMaintenanceResult() {
    const item = getActiveOffice().inventory[resultIndex];
    const diag = item.diagnostics;
    const resolvedItems = {};
    const allKeys = [...Object.keys(diag.hardware), ...Object.keys(diag.software)];

    allKeys.forEach(k => {
        if (diag.hardware[k] === false || diag.software[k] === false) {
            const cb = document.getElementById(`res-${k}`);
            resolvedItems[k] = cb ? cb.checked : false;
        }
    });

    const status = document.getElementById('result-status').value;
    item.maintenanceResult = { status, date: document.getElementById('result-date').value, techNotes: document.getElementById('result-notes-input').value, resolvedItems };

    if (status === 'Completado') item.status = 'Activo';
    else if (status === 'Parcial') item.status = 'Reparación';

    saveAppData(); renderTable(); closeMaintenanceResult();
    Swal.fire({ title: 'Guardado', icon: 'success', timer: 2000, showConfirmButton: false });
}

// =============== EXPORTACIÓN PDF / EXCEL ===============

function exportToCSV() {
    const o = getActiveOffice(); if (!o || !o.inventory.length) return;
    const heads = ["ID", "Estado", "Cat", "Mod", "Serie", "Usu", "Notas"];
    const rows = o.inventory.map(i => [i.assetTag, i.status, i.type, i.model, i.serial, i.user, i.notes.replace(/,/g, " ")]);
    const csvContent = "\uFEFF" + heads.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `PocketIT_${o.company}.csv`;
    link.click();
}

function exportToPDF() {
    const o = getActiveOffice(); if (!o || !o.inventory.length || !window.jspdf) return;
    const { jsPDF } = window.jspdf; const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFont("helvetica", "bold"); doc.setFontSize(28); doc.setTextColor(79, 70, 229);
    doc.text("Inventario de Equipos IT", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text(`Cliente: ${o.company} | Auditor: ${o.auditor} | Fecha: ${o.auditDate || new Date().toLocaleDateString()}`, 14, 28);

    doc.autoTable({
        head: [['ID', 'Estado', 'Categoría / Modelo', 'S/N / Asignación', 'Especificaciones']],
        body: o.inventory.map(i => [i.assetTag, i.status, `${i.type}\n${i.model}`, `S/N: ${i.serial}\nUsu: ${i.user}`, i.notes]),
        startY: 35, theme: 'grid', headStyles: { fillColor: [79, 70, 229] }, margin: { bottom: 20 },
        didDrawPage: (data) => {
            doc.setFontSize(8); doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        }
    });

    const sigY = doc.lastAutoTable.finalY + 30;
    if (sigY < 200) {
        doc.line(20, sigY, 100, sigY); doc.text("AUDITOR TÉCNICO", 60, sigY + 6, null, null, "center");
        doc.line(190, sigY, 270, sigY); doc.text("APROBACIÓN CLIENTE", 230, sigY + 6, null, null, "center");
    }
    doc.save(`PocketIT_${o.company}.pdf`);
}

async function generateMaintenancePlanPDF(idx) {
    const item = getActiveOffice().inventory[idx]; const d = item.diagnostics; if (!d) return;
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.text("Plan de Mantenimiento", 15, 20);
    doc.setTextColor(15, 23, 42); doc.setFontSize(10);
    doc.text(`Activo: ${item.assetTag} | Modelo: ${item.model} | Usuario: ${item.user}`, 15, 40);
    let y = 55;
    const all = [...Object.keys(d.hardware), ...Object.keys(d.software)];
    all.forEach(k => {
        const s = (d.hardware[k] !== undefined) ? d.hardware[k] : d.software[k];
        doc.setTextColor(s ? [16, 185, 129] : [239, 68, 68]);
        doc.text(s ? "√ " : "X ", 15, y); doc.setTextColor(15, 15, 15); doc.text(techLabelsDict[k] || k, 20, y);
        y += 7;
    });
    doc.save(`Plan_${item.assetTag}.pdf`);
}

async function generateMasterMaintenancePlanPDF() {
    const o = getActiveOffice(); if (!o) return;
    const items = o.inventory.filter(i => i.status === 'Reparación' || (i.diagnostics && (Object.values(i.diagnostics.hardware).includes(false) || Object.values(i.diagnostics.software).includes(false))));
    if (!items.length) return Swal.fire('Sin Pendientes', '', 'info');
    const { jsPDF } = window.jspdf; const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFillColor(5, 150, 105); doc.rect(0, 0, 297, 25, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("Plan Maestro de Mantenimiento", 15, 17);
    doc.autoTable({
        head: [['ID', 'Equipo', 'Asignación', 'Diagnóstico Pendiente']],
        body: items.map(i => [i.assetTag, `${i.type} ${i.model}`, i.user, i.notes]),
        startY: 30, theme: 'striped', headStyles: { fillColor: [5, 150, 105] }
    });
    doc.save(`MasterPlan_${o.company}.pdf`);
}

async function generateResultsReportPDF() {
    const o = getActiveOffice(); const items = o.inventory.filter(i => i.maintenanceResult);
    if (!items.length) return Swal.fire('Sin Resultados', '', 'info');
    const { jsPDF } = window.jspdf; const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFillColor(5, 150, 105); doc.rect(0, 0, 297, 25, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text("Informe de Resultados IT", 15, 17);
    doc.autoTable({
        head: [['ID', 'Equipo', 'Acciones Realizadas', 'Estado Final', 'Fecha']],
        body: items.map(i => [i.assetTag, i.model, i.maintenanceResult.techNotes, i.maintenanceResult.status, i.maintenanceResult.date]),
        startY: 30, theme: 'grid', headStyles: { fillColor: [5, 150, 105] }
    });
    doc.save(`Resultados_${o.company}.pdf`);
}

// =============== INICIALIZACIÓN ===============

function handleNetworkStatus() {
    const btn = document.getElementById('pdfBtn');
    if (btn) {
        btn.disabled = !navigator.onLine;
        btn.innerHTML = navigator.onLine ? "📄 Generar PDF Oficina" : "❌ PDF (Sin Conexión)";
    }
}

window.addEventListener('online', handleNetworkStatus);
window.addEventListener('offline', handleNetworkStatus);
window.addEventListener('load', () => {
    const s = document.getElementById('splash-screen');
    if (s) setTimeout(() => { s.classList.add('splash-hidden'); setTimeout(() => s.remove(), 500); }, 600);
});

handleNetworkStatus();
renderOfficesTable();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW failed', err));
        }, 1000);
    });
}
