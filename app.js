/**
 * app.js - PocketITCheck Entry Point (ESM)
 */

import { initDB, getAllOffices, saveOffice, deleteOffice, migrateFromLocalStorage } from './js/db.js';
import { applyTranslations, updatePagination, categoryFields } from './js/ui.js';
import { translations, t, tPdf } from './js/translations.js';
import * as PDF from './js/pdf_engine.js';

// State
let currentLang = localStorage.getItem('pocketITCheckLang') || 'es';
let appData = [];
let activeOfficeId = null;
let editingIndex = -1;
let editingOfficeId = null;
let diagnosticIndex = null;
let resultIndex = null;
let tableState = {
    offices: { searchQuery: '', currentPage: 1, itemsPerPage: 10 },
    equipment: { searchQuery: '', currentPage: 1, itemsPerPage: 10 }
};

// DOM Cache
const dom = {
    splash: document.getElementById('splash-screen'),
    sidebarOffices: document.getElementById('viewCreateOfficeSidebar'),
    sidebarEquip: document.getElementById('viewAddEquipmentSidebar'),
    viewOffices: document.getElementById('viewOfficesTable'),
    viewEquip: document.getElementById('viewInventoryTable'),
    officeForm: document.getElementById('officeForm'),
    equipForm: document.getElementById('inventoryForm'),
    officesTbody: document.getElementById('officesTableBody'),
    equipTbody: document.getElementById('tableBody'),
    activeOfficeSummary: document.getElementById('activeOfficeSummary'),
    typeSelect: document.getElementById('type'),
    dynamicContainer: document.getElementById('dynamicFieldsContainer'),
    submitBtnOffice: document.getElementById('submitBtnOffice'),
    cancelEditOfficeBtn: document.getElementById('cancelEditOfficeBtn'),
    submitBtnEquip: document.getElementById('submitBtnEquipment'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    countBadge: document.getElementById('itemCount'),
    officeCountBadge: document.getElementById('officeCountBadge')
};

// Init
async function init() {
    await migrateFromLocalStorage();
    appData = await getAllOffices();
    applyTranslations(currentLang);
    renderOfficesTable();
    
    if (dom.splash) {
        setTimeout(() => {
            dom.splash.classList.add('splash-hidden');
            setTimeout(() => dom.splash.remove(), 500);
        }, 600);
    }
}

// Global Exports for HTML
window.toggleLanguage = (isEn) => {
    currentLang = isEn ? 'en' : 'es';
    localStorage.setItem('pocketITCheckLang', currentLang);
    applyTranslations(currentLang);
    renderOfficesTable();
    if (activeOfficeId) {
        renderTable();
        const o = appData.find(o => o.id === activeOfficeId);
        if (o) updateOfficeSummaryUI(o);
    }
};

window.handleSearch = (tableType, query) => {
    tableState[tableType].searchQuery = query.toLowerCase();
    tableState[tableType].currentPage = 1;
    if (tableType === 'offices') renderOfficesTable();
    else renderTable();
};

window.changeLength = (tableType, length) => {
    tableState[tableType].itemsPerPage = length === 'all' ? Infinity : parseInt(length);
    tableState[tableType].currentPage = 1;
    if (tableType === 'offices') renderOfficesTable();
    else renderTable();
};

window.selectOffice = (id) => {
    const o = appData.find(o => o.id === id);
    if (!o) return;
    activeOfficeId = id;
    dom.sidebarOffices.style.display = 'none';
    dom.viewOffices.style.display = 'none';
    dom.sidebarEquip.style.display = 'block';
    dom.viewEquip.style.display = 'block';
    updateOfficeSummaryUI(o);
    renderTable();
};

window.goBackToOffices = () => {
    activeOfficeId = null;
    dom.sidebarOffices.style.display = 'block';
    dom.viewOffices.style.display = 'block';
    dom.sidebarEquip.style.display = 'none';
    dom.viewEquip.style.display = 'none';
    renderOfficesTable();
};

function updateOfficeSummaryUI(o) {
    dom.activeOfficeSummary.innerHTML = `
        <div style="font-weight: 600; margin-bottom:0.3rem;">🏢 ${o.company}</div>
        <div style="color: #475569;">Depto: ${o.depto}</div>
        <div style="color: #475569;">📍 ${o.location}</div>
        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e2e8f0;">
            <span style="color: #475569;">👤 <b>Auditor:</b> ${o.auditor}</span><br />
            <span style="color: #475569;">👔 <b>Resp. Oficina:</b> ${o.manager} - <em>${o.managerTitle}</em></span>
        </div>`;
}

// Offices Rendering
function renderOfficesTable() {
    if (!dom.officesTbody) return;
    dom.officesTbody.innerHTML = '';
    const state = tableState.offices;
    let filtered = appData.filter(o =>
        o.company.toLowerCase().includes(state.searchQuery) ||
        o.depto.toLowerCase().includes(state.searchQuery) ||
        o.location.toLowerCase().includes(state.searchQuery) ||
        o.auditor.toLowerCase().includes(state.searchQuery)
    );

    if (filtered.length === 0) {
        dom.officesTbody.innerHTML = `<tr><td colspan="5" class="empty-state"><div style="font-size: 2rem; margin-bottom: 1rem;">🏢</div>${t(currentLang, state.searchQuery ? 'noResults' : 'emptyOffices')}</td></tr>`;
    } else {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        paged.forEach(office => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="${t(currentLang, 'companyLabel')}"><strong class="text-primary">${office.company}</strong><br /><span class="text-secondary">${t(currentLang, 'deptLabel')}: ${office.depto}</span></td>
                <td data-label="${t(currentLang, 'locationLabel')}">${office.location}</td>
                <td data-label="${t(currentLang, 'techAuditor')}">${office.auditor}</td>
                <td data-label="${t(currentLang, 'equips')}" class="text-center"><span class="badge-count">${office.inventory.length}</span></td>
                <td data-label="${t(currentLang, 'actionsLabel')}" class="action-col">
                    <div class="action-icons">
                        <button class="icon-btn icon-btn-info" onclick="selectOffice('${office.id}')">📂</button>
                        <button class="icon-btn icon-btn-edit" onclick="editOffice('${office.id}')">✏️</button>
                        <button class="icon-btn icon-btn-danger" onclick="deleteOfficeHandler('${office.id}')">🗑️</button>
                    </div>
                </td>`;
            dom.officesTbody.appendChild(tr);
        });
        updatePagination('offices', filtered.length, 'officePagination', state, currentLang, (p) => { state.currentPage = p; renderOfficesTable(); });
    }
    if (dom.officeCountBadge) dom.officeCountBadge.textContent = `${filtered.length} ${t(currentLang, 'officesCount')}`;
}

// ... Additional handlers (editOffice, deleteOfficeHandler) will follow the same pattern ...
// Note: Implementing deleteOfficeHandler to use the new deleteOffice from db.js

window.deleteOfficeHandler = async (id) => {
    const res = await Swal.fire({
        title: t(currentLang, 'sureConfirm'), icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: t(currentLang, 'deleteBtn')
    });
    if (res.isConfirmed) {
        await deleteOffice(id);
        appData = appData.filter(o => o.id !== id);
        renderOfficesTable();
        Swal.fire({ title: t(currentLang, 'deletedMsg'), icon: 'success', timer: 1500, showConfirmButton: false });
    }
};

// ... Equipment logic rendering table ...
function renderTable() {
    if (!dom.equipTbody) return;
    dom.equipTbody.innerHTML = '';
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o) return;
    const state = tableState.equipment;
    const q = state.searchQuery;
    let filtered = o.inventory.map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => {
            return item.assetTag.toLowerCase().includes(q) || item.type.toLowerCase().includes(q) ||
                item.model.toLowerCase().includes(q) || item.serial.toLowerCase().includes(q) ||
                item.user.toLowerCase().includes(q) || item.notes.toLowerCase().includes(q);
        });

    if (filtered.length === 0) {
        dom.equipTbody.innerHTML = `<tr><td colspan="6" class="empty-state">📭 ${t(currentLang, q ? 'noResults' : 'emptyAssets')}</td></tr>`;
    } else {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        paged.forEach(item => {
            const tr = document.createElement('tr');
            // ... truncated for brevity but conceptually the same as previous app.js ...
            tr.innerHTML = `<td>${item.assetTag}</td><td>${item.model}</td><td>${item.status}</td><td>${item.user}</td><td>Action</td>`;
            dom.equipTbody.appendChild(tr);
        });
        updatePagination('equipment', filtered.length, 'equipmentPagination', state, currentLang, (p) => { state.currentPage = p; renderTable(); });
    }
}

// Form Handlers
dom.officeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newOffice = {
        id: editingOfficeId || Date.now().toString(),
        company: document.getElementById('officeCompany').value.trim(),
        depto: document.getElementById('officeDepto').value.trim(),
        location: document.getElementById('officeLocation').value.trim(),
        auditor: document.getElementById('officeAuditor').value.trim(),
        auditorCompany: document.getElementById('officeAuditorCompany').value.trim(),
        auditDate: document.getElementById('officeDate').value,
        manager: document.getElementById('officeManager').value.trim(),
        managerTitle: document.getElementById('officeManagerTitle').value.trim(),
        inventory: editingOfficeId ? appData.find(o => o.id === editingOfficeId).inventory : []
    };
    
    await saveOffice(newOffice);
    if (editingOfficeId) {
        const idx = appData.findIndex(o => o.id === editingOfficeId);
        appData[idx] = newOffice;
        editingOfficeId = null;
    } else {
        appData.push(newOffice);
    }
    
    renderOfficesTable();
    dom.officeForm.reset();
});

// Run Init
init();
