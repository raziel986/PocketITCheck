import { applyTranslations, updatePagination, categoryFields, collectSystemInfo, checkProceduralIntegrity, showFinalChecklist, validateRequiredFields, showErrorSummary, autoResizeTextarea, handleMobileFormScroll, showStatusBanner, captureEquipmentPhoto, diagnosticModes } from './js/ui.js';
import { t, tPdf } from './js/translations.js';
import { getStatusColor, drawHeaderTypeA, drawHeaderTypeB, drawSubheader, drawModelSignatures, addModelPageNumbers } from './js/pdf_engine.js';
import { getAllOffices, saveOffice, deleteOffice, migrateFromLocalStorage } from './js/db.js';

// State
let currentLang = localStorage.getItem('pocketITCheckLang') || 'es';
if (!localStorage.getItem('pocketITCheckLang')) localStorage.setItem('pocketITCheckLang', 'es');
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

const statusColorMap = {
    Activo: 'var(--success-500)',
    Stock: 'var(--info-500, #2563eb)',
    Reparacion: 'var(--warning-500, #d97706)',
    Baja: 'var(--danger-500)'
};

const DIAG_STRUCTURE = [
    {
        category: 'hardware',
        groups: [
            {
                key: 'power',
                items: [
                    { id: 'cables', label: 'cables', desc: 'desc_cable' },
                    { id: 'battery', label: 'battery', desc: 'desc_bat' },
                    { id: 'psu_volt', label: 'psu_volt', desc: 'desc_psu_volt' }
                ]
            },
            {
                key: 'storage',
                items: [
                    { id: 'smart', label: 'smart', desc: 'desc_smart' },
                    { id: 'speed', label: 'speed', desc: 'desc_speed' },
                    { id: 'bad_sectors', label: 'bad_sectors', desc: 'desc_bad_sectors' },
                    { id: 'nvme_tbw', label: 'nvme_tbw', desc: 'desc_nvme_tbw' }
                ]
            },
            {
                key: 'ram',
                items: [
                    { id: 'test', label: 'test', desc: 'desc_test' },
                    { id: 'clean_ram', label: 'clean_ram', desc: 'desc_clean_ram' },
                    { id: 'memtest_err', label: 'memtest_err', desc: 'desc_memtest_err' }
                ]
            },
            {
                key: 'temp',
                items: [
                    { id: 'paste', label: 'thermalPaste', desc: 'desc_paste' },
                    { id: 'fan', label: 'fans', desc: 'desc_fan' },
                    { id: 'thermal_throttling', label: 'thermal_throttling', desc: 'desc_thermal_throttling' }
                ]
            },
            {
                key: 'clean',
                items: [
                    { id: 'int', label: 'internal', desc: 'desc_int' },
                    { id: 'ext', label: 'external', desc: 'desc_ext' },
                    { id: 'ports_clean', label: 'ports_clean', desc: 'desc_ports_clean' }
                ]
            }
        ]
    },
    {
        category: 'software',
        groups: [
            {
                key: 'os',
                items: [
                    { id: 'upd', label: 'updates', desc: 'desc_upd' },
                    { id: 'sfc', label: 'integrity', desc: 'desc_sfc' },
                    { id: 'bsod_log', label: 'bsod_log', desc: 'desc_bsod_log' }
                ]
            },
            {
                key: 'security',
                items: [
                    { id: 'av', label: 'av', desc: 'desc_av' },
                    { id: 'fw', label: 'fw', desc: 'desc_fw' },
                    { id: 'malware_scan', label: 'malware_scan', desc: 'desc_malware_scan' }
                ]
            },
            {
                key: 'performance',
                items: [
                    { id: 'drv', label: 'drv', desc: 'desc_drv' },
                    { id: 'bg', label: 'bg', desc: 'desc_bg' },
                    { id: 'startup_impact', label: 'startup_impact', desc: 'desc_startup_impact' }
                ]
            },
            {
                key: 'license',
                items: [
                    { id: 'win', label: 'win', desc: 'desc_win' },
                    { id: 'off', label: 'off', desc: 'desc_off' },
                    { id: 'tpm_secureboot', label: 'tpm_secureboot', desc: 'desc_tpm_secureboot' }
                ]
            }
        ]
    }
];

// DOM Cache
// DOM Cache — populated inside DOMContentLoaded
let dom = {};

document.addEventListener('DOMContentLoaded', async () => {
    
    dom = {
        splash: document.getElementById('splash-screen'),
        // ... (other DOM cache remains same)
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
        officeCountBadge: document.getElementById('officeCountBadge'),
        mainFAB: document.getElementById('mainFAB'),
        viewSettings: document.getElementById('viewSettings')
    };

    // Office form submit
    if (dom.officeForm) {
        dom.officeForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate required fields before submitting
            const isValid = validateRequiredFields(dom.officeForm,
                ['#officeCompany', '#officeDepto', '#officeLocation', '#officeAuditor']);
            if (!isValid) {
                showErrorSummary(['Todos los campos marcados con * son obligatorios']);
                return;
            }

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
                inventory: editingOfficeId ? (appData.find(o => o.id === editingOfficeId) || { inventory: [] }).inventory : []
            };
            await saveOffice(newOffice);
            if (editingOfficeId) {
                const idx = appData.findIndex(o => o.id === editingOfficeId);
                if (idx !== -1) appData[idx] = newOffice;
                editingOfficeId = null;
            } else {
                appData.push(newOffice);
            }
            dom.officeForm.reset();
            dom.sidebarOffices.style.display = 'none';
            dom.viewOffices.style.display = 'block';
            renderOfficesTable();
            Swal.fire({ title: t(currentLang, 'successMsg'), icon: 'success', timer: 1200, showConfirmButton: false });
        });
    }

    // Equipment form submit
    if (dom.equipForm) {
        dom.equipForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate required fields before submitting
            const isValid = validateRequiredFields(dom.equipForm,
                ['#type', '#model', '#serial', '#assetTag', '#status', '#user']);
            if (!isValid) {
                showErrorSummary(['Por favor completa todos los campos obligatorios marcados con *'], '#inventoryForm');
                return;
            }

            const o = appData.find(off => off.id === activeOfficeId);
            if (!o) return;
            const specs = {};
            const typeValue = document.getElementById('type').value;
            if (categoryFields[typeValue]) {
                categoryFields[typeValue].forEach(f => {
                    const el = document.getElementById(f.id);
                    if (el) specs[f.id] = el.value.trim();
                });
            }

            const item = {
                type: typeValue,
                typeValue: typeValue,
                model: document.getElementById('model').value.trim(),
                serial: document.getElementById('serial').value.trim(),
                assetTag: document.getElementById('assetTag').value.trim(),
                status: document.getElementById('status').value,
                hasWarranty: document.getElementById('hasWarranty').value,
                purchaseDate: document.getElementById('purchaseDate').value,
                warrantyDate: document.getElementById('warrantyDate').value,
                user: document.getElementById('user').value.trim(),
                notes: document.getElementById('notes').value.trim(),
                specs: specs,
                diagnostics: editingIndex >= 0 && o.inventory[editingIndex] ? o.inventory[editingIndex].diagnostics : null,
                maintenanceResult: editingIndex >= 0 && o.inventory[editingIndex] ? o.inventory[editingIndex].maintenanceResult : null
            };
            if (editingIndex >= 0) {
                o.inventory[editingIndex] = { ...o.inventory[editingIndex], ...item };
            } else {
                o.inventory.push(item);
            }
            await saveOffice(o);
            editingIndex = -1;
            dom.equipForm.reset();
            if (dom.dynamicContainer) dom.dynamicContainer.innerHTML = '';
            dom.sidebarEquip.style.display = 'none';
            dom.viewEquip.style.display = 'block';
            renderTable();
            Swal.fire({ title: t(currentLang, 'successMsg'), icon: 'success', timer: 1200, showConfirmButton: false, confirmButtonColor: '#3525cd' });
        });
    }

    // Start the app
    init();

    // Initialize mobile optimizations
    // Auto-resize textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(el => autoResizeTextarea(el));

    // Handle mobile form scroll to prevent viewport jumps
    handleMobileFormScroll();

    // Show initial status if coming from pull-to-refresh
    if (window.location.hash === '#refreshed') {
        showStatusBanner('Datos actualizados correctamente', 'success', 2000);
        window.location.hash = '';
    }
});

// Init
async function init() {
    try {
        await migrateFromLocalStorage();
        appData = await getAllOffices();
        applyTranslations(currentLang);
        renderOfficesTable();
    } catch (err) {
        console.error('Initialization error:', err);
        // Ensure even if there's an error, we show some UI or message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Error de Inicio',
                text: 'Hubo un problema al cargar los datos. Por favor, recarga la página.',
                icon: 'error'
            });
        }
    } finally {
        if (dom.splash) {
            setTimeout(() => {
                dom.splash.classList.add('splash-hidden');
                setTimeout(() => dom.splash.remove(), 500);
            }, 600);
        }
    }
}

// Capture equipment photo and set it as the model/serial placeholder or notes
window.captureEquipmentPhotoAndSave = async () => {
    const photoDataURL = await captureEquipmentPhoto();

    if (!photoDataURL) return;

    // Store the photo in a hidden field or append to notes
    const notesInput = document.getElementById('notes');
    if (notesInput) {
        // Append info about the photo capture
        const existingNotes = notesInput.value.trim();
        const photoInfo = `\n[FOTO EQUIPO capturada: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - ${existingNotes ? '| ' : ''}${existingNotes}`;

        notesInput.value = photoInfo + (existingNotes ? '' : '');
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: ' Foto capturada',
                text: 'La foto se ha agregado a las notas del equipo.',
                icon: 'success',
                confirmButtonText: 'Ver foto'
            });
        }
    } else {
        // If no notes field, store in a data attribute on the form
        const equipForm = document.getElementById('inventoryForm');
        if (equipForm) {
            equipForm.dataset.equipmentPhoto = photoDataURL;
        }

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: ' Foto capturada',
                text: 'La foto se ha guardado temporalmente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        }
    }
};

// Check warranty status automatically and show alert
// Also update the UI display
window.checkWarrantyStatusAuto = () => {
    const hasWarranty = document.getElementById('hasWarranty').value;
    const purchaseDate = document.getElementById('purchaseDate')?.value;
    const warrantyDate = document.getElementById('warrantyDate')?.value;
    const statusDisplay = document.getElementById('warrantyStatusDisplay');
    const statusText = document.getElementById('warrantyStatusText');

    // Update UI display
    if (statusDisplay && statusText) {
        if (hasWarranty === 'Si' && purchaseDate && warrantyDate) {
            const result = diagnosticModes.checkWarrantyStatus(purchaseDate, warrantyDate);
            statusDisplay.style.display = 'block';
            statusText.textContent = result.message;

            // Color code
            const colorMap = {
                active: 'var(--success-500)',
                expiring_soon: 'var(--warning-500)',
                expired: 'var(--danger-500)'
            };
            statusDisplay.style.color = colorMap[result.status] || 'var(--ink-500)';
        } else {
            statusDisplay.style.display = 'none';
        }
    }

    // Show alert if expiring soon or expired
    if (hasWarranty === 'Si' && purchaseDate && warrantyDate) {
        const result = diagnosticModes.checkWarrantyStatus(purchaseDate, warrantyDate);

        if (result.status === 'expiring_soon' || result.status === 'expired') {
            const icon = result.status === 'expired' ? 'error' : 'warning';
            Swal.fire({
                title: 'Alerta de Garantía',
                text: result.message,
                icon: icon,
                confirmButtonText: 'Entendido'
            });
        }
    }
};

// Collect system info and fill form fields
window.collectAndFillSystemInfo = async () => {
    const hasWarranty = document.getElementById('hasWarranty').value;
    const purchaseDate = document.getElementById('purchaseDate')?.value;
    const warrantyDate = document.getElementById('warrantyDate')?.value;

    if (hasWarranty === 'Si' && purchaseDate && warrantyDate) {
        const result = diagnosticModes.checkWarrantyStatus(purchaseDate, warrantyDate);

        if (typeof Swal !== 'undefined') {
            const icon = result.daysRemaining > 0 ? 'success' : result.daysRemaining > -30 ? 'warning' : 'error';
            Swal.fire({
                title: 'Estado de Garantía',
                text: result.message,
                icon: icon,
                confirmButtonText: 'Entendido'
            });
        }
    }
};

// Field Repair Mode - optimized for field technicians
window.fieldMode = {
    active: false,
    // Quick access to most common actions
    shortcuts: {
        'KeyD': 'toggleDiagnostic',     // Open diagnostic
        'KeyM': 'toggleMaintenance',    // Open maintenance result
        'KeyS': 'saveCurrent',          // Save current item
        'KeyC': 'closeCurrent',         // Close current window
        'KeyR': 'refreshTable',         // Refresh data
        'KeyN': 'showAddEquipmentForm', // New equipment shortcut
    },

    // Toggle field mode on/off
    toggle() {
        this.active = !this.active;
        const fab = document.getElementById('mainFAB');
        if (fab) {
            if (this.active) {
                fab.style.background = 'var(--danger-500)';
                fab.title = 'Modo Campo Activo - Presiona ? para ayuda';
            } else {
                fab.style.background = '';
                fab.title = 'PocketITCheck';
            }
        }
        return this.active;
    },

    // Handle keyboard shortcuts
    handleKeyDown(event) {
        if (!this.active) return;

        const key = event.code;
        const handler = this.shortcuts[key];

        if (handler && typeof window[handler] === 'function') {
            event.preventDefault();
            window[handler]();
        }
    }
};

// Register keyboard event listener
document.addEventListener('keydown', (event) => {
    window.fieldMode.handleKeyDown(event);
});

// Field mode F1 help overlay
document.addEventListener('keydown', (event) => {
    if (event.code === 'F1') {
        event.preventDefault();
        const helpText = `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#f5f4ff;padding:2rem;color:#14161a;"><div style="background:white;padding:1.5rem;border-radius:18px;max-width:420px;margin:auto;box-shadow:0 12px 28px rgba(16,24,40,0.10);"><h3 style="margin-top:0;color:#3525cd;">Field Mode Shortcuts</h3><p style="font-size:0.9rem;margin:0.5rem 0;color:#6b7280;">Press the key to execute:</p><ul style="font-size:0.85rem;margin:0.3rem 0 0 1.2rem;line-height:1.7;"><li><kbd>D</kbd> - Open diagnostic</li><li><kbd>M</kbd> - Open maintenance result</li><li><kbd>S</kbd> - Save current item</li><li><kbd>C</kbd> - Close current window</li><li><kbd>R</kbd> - Refresh data</li><li><kbd>N</kbd> - Add new equipment</li></ul><p style="text-align:right;margin-top:1rem;"><button onclick="window.close()" style="background:#3525cd;color:white;padding:0.5rem 1rem;border:none;border-radius:10px;font-size:0.8rem;cursor:pointer;">Close</button></p></div></body></html>`;
        Swal.fire({ title: 'Field Mode Shortcuts', html: helpText, width: 'auto', padding: '1rem', confirmButtonText: 'Got it' });
    }
});

// Collect system info and fill form fields
window.collectAndFillSystemInfo = async () => {
    const info = await collectSystemInfo();

    // Fill OS field
    const osInput = document.getElementById('officeManager');
    if (osInput) {
        osInput.value = info.os || '';
    }

    // Fill dynamic fields based on type
    const typeSelect = document.getElementById('type');
    if (typeSelect && categoryFields[typeSelect.value]) {
        updateDynamicFields(typeSelect.value);
    }

    // Show a brief message
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Info del Sistema',
            text: `OS: ${info.os}\nCPU: ${info.cpu}\nRAM estimada: ${info.ram}\nAlmacenamiento: ${info.storage}`,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    }
};

// Add system info button to dynamic container after form render
document.addEventListener('DOMContentLoaded', () => {
    // Ensure button appears after dynamic fields are rendered
    const setupSystemInfoButton = () => {
        const btn = document.getElementById('btnCollectSystemInfo');
        if (!btn) return;

        // Position it below the dynamic fields
        const dynamicContainer = document.getElementById('dynamicFieldsContainer');
        if (dynamicContainer && !btn.parentNode.contains(dynamicContainer)) {
            // Insert after the last form-group
            const lastGroup = dynamicContainer.querySelector('.form-group:last-child');
            if (lastGroup) {
                dynamicContainer.insertBefore(btn, lastGroup.nextSibling);
            } else {
                dynamicContainer.appendChild(btn);
            }
        }
    };

    // Run after a short delay to ensure DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSystemInfoButton);
    } else {
        setupSystemInfoButton();
    }
});

// Connection status chip in the top app bar
(function() {
    const updateConnectionStatus = () => {
        const chip = document.getElementById('appStatus');
        const label = document.getElementById('appStatusLabel');
        if (!chip || !label) return;
        const online = navigator.onLine !== false;
        chip.classList.toggle('is-offline', !online);
        label.textContent = currentLang === 'en'
            ? (online ? 'Online' : 'Offline')
            : (online ? 'En línea' : 'Sin conexión');
        chip.title = label.textContent;
    };
    document.addEventListener('DOMContentLoaded', updateConnectionStatus);
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
})();

// Mobile gesture: pull-to-refresh via touchstart/move/end on table containers
(function() {
    let touchStartY = 0;
    let isRefreshing = false;
    const minSwipeDist = 80; // pixels
    const refreshContainers = ['#officesTable', '#inventoryTable'];

    refreshContainers.forEach(selector => {
        const container = document.querySelector(selector);
        if (!container) return;

        container.addEventListener('touchstart', (e) => {
            // Only start from the very top of the container
            if (container.scrollTop === 0) {
                touchStartY = e.touches[0].clientY;
            } else {
                touchStartY = -1; // Not at top, ignore
            }
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (touchStartY < 0) return;
            const dy = e.touches[0].clientY - touchStartY;
            // Only pull down from top; allow bounce via native scroll
            if (dy > 0 && container.scrollTop === 0) {
                e.preventDefault();
                // Visual feedback: could add a pull indicator later
            }
        }, { passive: false });

        container.addEventListener('touchend', () => {
            // If user pulled down enough, trigger refresh
            if (container.scrollTop <= 0 && !isRefreshing) {
                // Small delay to let the bounce settle, then refresh
                setTimeout(() => {
                    if (selector === '#officesTable') renderOfficesTable();
                    else renderTable();
                }, 300);
            }
        });
    });
})();

export function toggleLanguage(isEn) {
    currentLang = isEn ? 'en' : 'es';
    localStorage.setItem('pocketITCheckLang', currentLang);
    applyTranslations(currentLang);

    // Refresh dynamic tables so their translated rows follow the selected language.
    if (document.getElementById('officesListContainer') || document.getElementById('viewOfficesTable')) {
        renderOfficesTable();
    }
    if (document.getElementById('equipAccordionList')) {
        renderTable();
    }
}

// The language switch uses an inline onchange handler, so it must be global.
window.toggleLanguage = toggleLanguage;

window.handleSearch = (tableType, query) => {
    tableState[tableType].searchQuery = query.toLowerCase();
    tableState[tableType].currentPage = 1;
    if (tableType === 'offices') renderOfficesTable();
    else renderTable();
};

// Pull-to-refresh hook — called when user does a downward drag
// on the table area. This is a simple touch gesture implementation
// that re-renders the current table to refresh data.
window.refreshTablePull = () => {
    if (activeOfficeId) {
        renderTable();
        renderOfficesTable();
    }
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
    hideAllViews();
    dom.viewEquip.style.display = 'block';
    if (dom.mainFAB) dom.mainFAB.style.display = 'flex';
    setActiveNav(0);
    updateOfficeSummaryUI(o);
    renderTable();
};

window.showAddEquipmentForm = () => {
    editingIndex = -1;
    dom.equipForm.reset();
    const hw = document.getElementById('hasWarranty');
    if (hw) hw.value = 'No';
    if (typeof window.toggleDates === 'function') window.toggleDates();
    if (dom.dynamicContainer) dom.dynamicContainer.innerHTML = '';
    const title = document.getElementById('equipmentFormTitle');
    if (title) {
        title.setAttribute('data-i18n', 'newEquipment');
        title.textContent = t(currentLang, 'newEquipment');
    }
    if (dom.cancelEditBtn) dom.cancelEditBtn.style.display = 'none';
    const subBtn = document.getElementById('submitBtnEquipment');
    if (subBtn) subBtn.innerHTML = '<span class="material-symbols-outlined">add</span><span>' + t(currentLang, 'addEquipment') + '</span>';
    // Show the form, hide inventory table
    dom.viewEquip.style.display = 'none';
    dom.sidebarEquip.style.display = 'block';
};

window.cancelEdit = () => {
    window.hideAddEquipmentForm();
};

window.cancelEditOffice = () => {
    window.hideAddOfficeForm();
};

window.hideAddEquipmentForm = () => {
    editingIndex = -1;
    dom.equipForm.reset();
    if (dom.dynamicContainer) dom.dynamicContainer.innerHTML = '';
    // Show inventory table, hide the form
    dom.sidebarEquip.style.display = 'none';
    dom.viewEquip.style.display = 'block';
};

function hideAllViews() {
    dom.sidebarOffices.style.display = 'none';
    dom.viewOffices.style.display = 'none';
    dom.sidebarEquip.style.display = 'none';
    dom.viewEquip.style.display = 'none';
    if (dom.viewSettings) dom.viewSettings.style.display = 'none';
    const diagSection = document.getElementById('diag-integrated-section');
    if (diagSection) diagSection.style.display = 'none';
    const resultSection = document.getElementById('result-integrated-section');
    if (resultSection) resultSection.style.display = 'none';
}

function setActiveNav(index) {
    document.querySelectorAll('.bottom-nav .nav-item').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
}

window.goBackToOffices = () => {
    activeOfficeId = null;
    hideAllViews();
    dom.viewOffices.style.display = 'block';
    if (dom.mainFAB) dom.mainFAB.style.display = 'flex';
    setActiveNav(0);
    renderOfficesTable();
};

window.showAddOfficeForm = () => {
    editingOfficeId = null;
    dom.officeForm.reset();
    document.getElementById('officeCompany').focus();
    hideAllViews();
    dom.sidebarOffices.style.display = 'block';
    if (dom.mainFAB) dom.mainFAB.style.display = 'flex';
    setActiveNav(1);
};

window.hideAddOfficeForm = () => {
    editingOfficeId = null;
    dom.officeForm.reset();
    dom.sidebarOffices.style.display = 'none';
    dom.viewOffices.style.display = 'block';
};

window.handleFABClick = () => {
    if (activeOfficeId) {
        window.showAddEquipmentForm();
    } else {
        window.showAddOfficeForm();
    }
};

function updateOfficeSummaryUI(o) {
    dom.activeOfficeSummary.innerHTML = `
        <div class="info-row info-row-primary"><span class="material-symbols-outlined info-icon">business</span>${o.company}</div>
        <div class="info-row">Depto: ${o.depto}</div>
        <div class="info-row"><span class="material-symbols-outlined info-icon">location_on</span>${o.location}</div>
        <div class="info-row info-row-meta">
            <div><span class="material-symbols-outlined info-icon">person</span><b>Auditor:</b> ${o.auditor}</div>
            <div><span class="material-symbols-outlined info-icon">badge</span><b>Resp. Oficina:</b> ${o.manager} - <em>${o.managerTitle}</em></div>
        </div>`;
}

// Offices Rendering — Accordion Style
function renderOfficesTable() {
    let listContainer = document.getElementById('officesListContainer');
    if (!listContainer) {
        const viewOffices = document.getElementById('viewOfficesTable');
        if (!viewOffices) return;
        const tableCont = viewOffices.querySelector('.table-container');
        if (tableCont) {
            tableCont.style.display = 'none';
            listContainer = document.createElement('div');
            listContainer.id = 'officesListContainer';
            tableCont.parentNode.insertBefore(listContainer, tableCont.nextSibling);
        } else {
            listContainer = document.createElement('div');
            listContainer.id = 'officesListContainer';
            viewOffices.appendChild(listContainer);
        }
    }

    listContainer.innerHTML = '';
    const state = tableState.offices;
    let filtered = appData.filter(o =>
        (o.company || '').toLowerCase().includes(state.searchQuery) ||
        (o.depto || '').toLowerCase().includes(state.searchQuery) ||
        (o.location || '').toLowerCase().includes(state.searchQuery) ||
        (o.auditor || '').toLowerCase().includes(state.searchQuery)
    );

    if (dom.officeCountBadge) dom.officeCountBadge.textContent = `${appData.length} ${t(currentLang, 'officesCount')}`;

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">
            <span class="material-symbols-outlined">apartment</span>
            <h3 style="margin-bottom:0.25rem;">${t(currentLang, 'emptyOffices')}</h3>
            <p>${t(currentLang, 'noResults')}</p>
        </div>`;
    } else {
        const list = document.createElement('div');
        list.className = 'accordion-list';
        listContainer.appendChild(list);
        
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        
        paged.forEach(office => {
            const card = document.createElement('div');
            card.className = 'accordion-card';
            const equipCount = (office.inventory || []).length;
            card.innerHTML = `
                <div class="accordion-header" onclick="toggleAccordion(this)">
                    <div class="accordion-header-left">
                        <div class="accordion-icon"><span class="material-symbols-outlined">business</span></div>
                        <div class="accordion-summary">
                            <div class="accordion-title">${office.company}</div>
                            <div class="accordion-subtitle">${office.depto} · <strong>${equipCount}</strong> ${t(currentLang, 'equips')}</div>
                        </div>
                    </div>
                    <span class="material-symbols-outlined accordion-chevron">expand_more</span>
                </div>
                <div class="accordion-body">
                    <div class="accordion-details">
                        <div class="accordion-detail-row">
                            <span class="material-symbols-outlined">location_on</span>
                            <span>${office.location}</span>
                        </div>
                        <div class="accordion-detail-row">
                            <span class="material-symbols-outlined">person_check</span>
                            <span>${t(currentLang, 'techAuditor')}: <b>${office.auditor}</b></span>
                        </div>
                        <div class="accordion-detail-row">
                            <span class="material-symbols-outlined">badge</span>
                            <span>${t(currentLang, 'managerLabel')}: <b>${office.manager || '-'}</b> — <em>${office.managerTitle || ''}</em></span>
                        </div>
                        <div class="accordion-detail-row">
                            <span class="material-symbols-outlined">calendar_today</span>
                            <span>${t(currentLang, 'auditDateLabel')}: <b>${office.auditDate || '-'}</b></span>
                        </div>
                    </div>
                    <div class="accordion-actions">
                        <button class="btn btn-primary btn-sm" onclick="selectOffice('${office.id}')" style="flex:1;">
                            <span class="material-symbols-outlined">visibility</span> ${t(currentLang, 'equips')}
                        </button>
                        <button class="equip-action-btn act-edit" onclick="editOffice('${office.id}')">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="equip-action-btn act-delete" onclick="deleteOfficeHandler('${office.id}')">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });

        const state_o = tableState.offices;
        updatePagination('offices', filtered.length, 'officePagination', state_o, currentLang, (p) => { state_o.currentPage = p; renderOfficesTable(); });
    }
}

window.toggleAccordion = (headerEl) => {
    const card = headerEl.closest('.accordion-card');
    if (!card) return;
    card.classList.toggle('open');
};

window.editOffice = (id) => {
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
    
    dom.viewOffices.style.display = 'none';
    dom.sidebarOffices.style.display = 'block';
};

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

function renderTable() {
    // Use accordion container instead of table tbody
    let container = document.getElementById('equipAccordionList');
    const tableEl = document.getElementById('inventoryTable');
    if (tableEl) tableEl.style.display = 'none';
    if (!container) {
        container = document.createElement('div');
        container.id = 'equipAccordionList';
        container.className = 'accordion-list';
        const tableCont = document.querySelector('#viewInventoryTable .table-container');
        if (tableCont) tableCont.appendChild(container);
    }
    container.innerHTML = '';

    const o = appData.find(off => off.id === activeOfficeId);
    if (!o) return;
    const state = tableState.equipment;
    const q = state.searchQuery;
    let filtered = o.inventory.map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => {
            return item.assetTag.toLowerCase().includes(q) || (item.type||'').toLowerCase().includes(q) ||
                (item.model||'').toLowerCase().includes(q) || (item.serial||'').toLowerCase().includes(q) ||
                (item.user||'').toLowerCase().includes(q) || (item.notes||'').toLowerCase().includes(q);
        });

    if (dom.countBadge) dom.countBadge.textContent = `${o.inventory.length} ${t(currentLang, 'equipmentCount')}`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <span class="material-symbols-outlined">inventory_2</span>
            <span>${t(currentLang, q ? 'noResults' : 'emptyAssets')}</span>
        </div>`;
    } else {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        paged.forEach(item => {
            const hasDiag = item.diagnostics ? Object.values({...item.diagnostics.hardware,...item.diagnostics.software}).some(v => v === false) : false;
            const hasMaint = !!item.maintenanceResult;
            const statusNorm = item.status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const specsHtml = item.specs ? Object.entries(item.specs).filter(([k,v]) => v).map(([k,v]) => `
                <div class="accordion-detail-row">
                    <span class="material-symbols-outlined" style="font-size:1rem;">settings</span>
                    <span><b>${t(currentLang, k)}</b>: ${v}</span>
                </div>`).join('') : '';
            
            const card = document.createElement('div');
            card.className = 'accordion-card';
            card.innerHTML = `
                <div class="accordion-header" onclick="toggleAccordion(this)">
                    <div class="accordion-header-left">
                        <div class="accordion-icon equip-type"><span class="material-symbols-outlined">devices</span></div>
                        <div class="accordion-summary">
                            <div class="accordion-title">${item.assetTag}</div>
                            <div class="accordion-subtitle">${t(currentLang, item.type)} · ${item.model}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span class="badge-status status-${statusNorm}">${t(currentLang, item.status)}</span>
                        <span class="material-symbols-outlined accordion-chevron">expand_more</span>
                    </div>
                </div>
                <div class="accordion-body">
                    <div class="accordion-details">
                        <div class="accordion-detail-row">
                            <span class="material-symbols-outlined">person</span>
                            <span>${t(currentLang, 'assignmentLabel')}: <b>${item.user || '-'}</b></span>
                        </div>
                        <div class="accordion-detail-row">
                            <span class="material-symbols-outlined">tag</span>
                            <span>S/N: <b>${item.serial || '-'}</b></span>
                        </div>
                        ${item.purchaseDate ? `<div class="accordion-detail-row">
                            <span class="material-symbols-outlined">shopping_cart</span>
                            <span>${t(currentLang, 'purchaseDateLabel')}: <b>${item.purchaseDate}</b></span>
                        </div>` : ''}
                        ${item.warrantyDate ? `<div class="accordion-detail-row">
                            <span class="material-symbols-outlined">verified_user</span>
                            <span>${t(currentLang, 'warrantyUntilLabel')}: <b>${item.warrantyDate}</b></span>
                        </div>` : ''}
                        ${specsHtml}
                        ${item.notes ? `<div class="accordion-detail-row" style="margin-top:0.25rem;">
                            <span class="material-symbols-outlined">notes</span>
                            <span style="color:var(--outline); font-style:italic;">${item.notes}</span>
                        </div>` : ''}
                    </div>
                    <div class="accordion-actions">
                        <button class="equip-action-btn act-edit" onclick="editEquipment(${item.originalIndex})" title="${t(currentLang,'editEquipment')}"><span class="material-symbols-outlined">edit</span></button>
                        <button class="equip-action-btn act-diag" onclick="openDiagnostic(${item.originalIndex})" title="${t(currentLang,'integratedDiag')}"><span class="material-symbols-outlined">biotech</span></button>
                        <button class="equip-action-btn act-maint${hasMaint ? ' done' : ''}" onclick="openMaintenanceResult(${item.originalIndex})" title="${t(currentLang,'maintResult')}"><span class="material-symbols-outlined">${hasMaint ? 'task_alt' : 'build'}</span></button>
                        <button class="equip-action-btn act-delete" onclick="deleteItem(${item.originalIndex})" title="${t(currentLang,'deleteBtn')}"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        updatePagination('equipment', filtered.length, 'equipmentPagination', state, currentLang, (p) => { state.currentPage = p; renderTable(); });
    }
}

window.editEquipment = (idx) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o) return;
    const item = o.inventory[idx];
    if (!item) return;
    editingIndex = idx;
    document.getElementById('type').value = item.type || '';
    document.getElementById('model').value = item.model || '';
    document.getElementById('serial').value = item.serial || '';
    document.getElementById('assetTag').value = item.assetTag || '';
    document.getElementById('status').value = item.status || 'Activo';
    document.getElementById('hasWarranty').value = item.hasWarranty || 'No';
    if (typeof window.toggleDates === 'function') window.toggleDates();
    document.getElementById('purchaseDate').value = item.purchaseDate || '';
    document.getElementById('warrantyDate').value = item.warrantyDate || '';
    document.getElementById('user').value = item.user || '';
    document.getElementById('notes').value = item.notes || '';
    // Show form, hide table
    dom.viewEquip.style.display = 'none';
    dom.sidebarEquip.style.display = 'block';
    const title = document.getElementById('equipmentFormTitle');
    if (title) {
        title.setAttribute('data-i18n', 'editEquipment');
        title.textContent = t(currentLang, 'editEquipment');
    }
    if (dom.cancelEditBtn) dom.cancelEditBtn.style.display = 'inline-block';
    const subBtn = document.getElementById('submitBtnEquipment');
    if (subBtn) subBtn.innerHTML = '<span class="material-symbols-outlined">save</span><span>' + t(currentLang, 'saveAsset') + '</span>';

    window.updateDynamicFields(item.type);
    if (item.specs) {
        Object.keys(item.specs).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = item.specs[id];
        });
    }
};

window.updateDynamicFields = (type) => {
    if (!dom.dynamicContainer) return;
    dom.dynamicContainer.innerHTML = '';
    const fields = categoryFields[type];
    if (!fields) return;

    const grid = document.createElement('div');
    grid.className = 'form-grid-3';
    grid.style.gap = '1rem';
    grid.style.marginTop = '1rem';
    grid.style.paddingTop = '1rem';
    grid.style.borderTop = '1px dashed var(--line-strong)';

    fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `
            <label>${t(currentLang, f.i18nKey)}</label>
            <input type="${f.type}" id="${f.id}" placeholder="${f.placeholder}">
        `;
        grid.appendChild(group);
    });
    dom.dynamicContainer.appendChild(grid);
};

window.toggleDates = () => {
    const val = document.getElementById('hasWarranty').value;
    const pContainer = document.getElementById('purchaseDateContainer');
    const wContainer = document.getElementById('warrantyDateContainer');
    if (val === 'Si') {
        if (pContainer) pContainer.style.display = 'block';
        if (wContainer) wContainer.style.display = 'block';
    } else {
        if (pContainer) pContainer.style.display = 'none';
        if (wContainer) wContainer.style.display = 'none';
        const pInput = document.getElementById('purchaseDate');
        const wInput = document.getElementById('warrantyDate');
        if (pInput) pInput.value = '';
        if (wInput) wInput.value = '';
    }
};

window.deleteItem = async (idx) => {
    const res = await Swal.fire({
        title: t(currentLang, 'sureConfirm'), icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: t(currentLang, 'deleteBtn')
    });
    if (res.isConfirmed) {
        const o = appData.find(off => off.id === activeOfficeId);
        if (!o) return;
        o.inventory.splice(idx, 1);
        await saveOffice(o);
        renderTable();
        Swal.fire({ title: t(currentLang, 'deletedMsg'), icon: 'success', timer: 1500, showConfirmButton: false });
    }
};



// Diagnostic Functions
window.openDiagnostic = (idx) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o) return;
    const item = o.inventory[idx];
    if (!item) return;

    diagnosticIndex = idx;
    const diagSection = document.getElementById('diag-integrated-section');
    if (diagSection) diagSection.style.display = 'block';
    if (dom.viewEquip) dom.viewEquip.style.display = 'none';

    const titleEl = document.getElementById('diag-title');
    const subtitleEl = document.getElementById('diag-subtitle');
    if (titleEl) titleEl.textContent = t(currentLang, 'diagTitle');
    if (subtitleEl) subtitleEl.textContent = `${item.assetTag} - ${item.model}`;
    
    if (!item.diagnostics) {
        item.diagnostics = { hardware: {}, software: {}, notes: '' };
    }
    const notesInput = document.getElementById('diag-notes-input');
    if (notesInput) notesInput.value = item.diagnostics.notes || '';

    const container = document.getElementById('diag-grid-container');
    if (container) {
        container.innerHTML = '';
        DIAG_STRUCTURE.forEach(cat => {
            const section = document.createElement('div');
            section.className = 'diag-card';
            
            const allChecked = cat.groups.every(g => g.items.every(it => (item.diagnostics[cat.category] || {})[it.id] === true));

            section.innerHTML = `
                <div class="diag-card-header">
                    <h3>${t(currentLang, cat.category)}</h3>
                    <div class="diag-card-master">
                        <label for="master-${cat.category}">${t(currentLang, 'checkAll')}</label>
                        <input type="checkbox" id="master-${cat.category}" ${allChecked ? 'checked' : ''}
                            onchange="toggleCategoryMaster('${cat.category}', this.checked)">
                    </div>
                </div>`;
            
            cat.groups.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'diag-result-group brand';
                groupDiv.innerHTML = `<h4><span class="group-dot"></span> ${t(currentLang, group.key)}</h4>`;
                
                const itemsList = document.createElement('div');
                itemsList.className = 'diag-result-items';

                group.items.forEach(it => {
                    const isOk = (item.diagnostics[cat.category] || {})[it.id] === true;
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'diag-item-row';
                    
                    itemDiv.innerHTML = `
                        <input type="checkbox" id="diag-${cat.category}-${it.id}" ${isOk ? 'checked' : ''}
                            onchange="updateDiagState('${cat.category}', '${it.id}', this.checked)">
                        <label for="diag-${cat.category}-${it.id}">
                            <div class="diag-item-label">${t(currentLang, it.label)}</div>
                            <div class="diag-item-desc">${t(currentLang, it.desc)}</div>
                        </label>`;
                    itemsList.appendChild(itemDiv);
                });
                groupDiv.appendChild(itemsList);
                section.appendChild(groupDiv);
            });
            container.appendChild(section);
        });
    }
};

window.updateDiagState = (cat, it, val) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (o && o.inventory[diagnosticIndex]) {
        if (!o.inventory[diagnosticIndex].diagnostics) o.inventory[diagnosticIndex].diagnostics = { hardware:{}, software:{}, notes:'' };
        o.inventory[diagnosticIndex].diagnostics[cat][it] = val;

        // Auto-update master checkbox state
        const catStruct = DIAG_STRUCTURE.find(c => c.category === cat);
        if (catStruct) {
            const allChecked = catStruct.groups.every(g => g.items.every(itemIt => (o.inventory[diagnosticIndex].diagnostics[cat] || {})[itemIt.id] === true));
            const masterCb = document.getElementById(`master-${cat}`);
            if (masterCb) masterCb.checked = allChecked;
        }
    }
};

window.toggleCategoryMaster = (catName, val) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o || !o.inventory[diagnosticIndex]) return;
    const item = o.inventory[diagnosticIndex];
    if (!item.diagnostics) item.diagnostics = { hardware: {}, software: {}, notes: '' };
    if (!item.diagnostics[catName]) item.diagnostics[catName] = {};
    
    const catStruct = DIAG_STRUCTURE.find(c => c.category === catName);
    if (catStruct) {
        catStruct.groups.forEach(g => {
            g.items.forEach(it => {
                item.diagnostics[catName][it.id] = val;
            });
        });
    }
    openDiagnostic(diagnosticIndex);
};

window.saveIntegratedDiagnosticFlow = async () => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (o && o.inventory[diagnosticIndex]) {
        const notesInput = document.getElementById('diag-notes-input');
        if (notesInput) o.inventory[diagnosticIndex].diagnostics.notes = notesInput.value;
        await saveOffice(o);
        closeIntegratedDiagnostic();
        renderTable();
        if (typeof Swal !== 'undefined') Swal.fire({ title: t(currentLang, 'successMsg'), icon: 'success', timer: 1200, showConfirmButton: false });
    }
};

window.closeIntegratedDiagnostic = () => {
    diagnosticIndex = null;
    const diagSection = document.getElementById('diag-integrated-section');
    if (diagSection) diagSection.style.display = 'none';
    if (dom.viewEquip) dom.viewEquip.style.display = 'block';
};

// Maintenance Results Functions
window.openMaintenanceResult = (idx) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o) return;
    const item = o.inventory[idx];
    if (!item) return;

    resultIndex = idx;
    const resultSection = document.getElementById('result-integrated-section');
    if (resultSection) resultSection.style.display = 'block';
    if (dom.viewEquip) dom.viewEquip.style.display = 'none';

    const titleEl = document.getElementById('result-title');
    const subtitleEl = document.getElementById('result-subtitle');
    if (titleEl) titleEl.textContent = t(currentLang, 'maintResult');
    if (subtitleEl) subtitleEl.textContent = `${item.assetTag} - ${item.model}`;

    if (!item.maintenanceResult) {
        item.maintenanceResult = { status: 'Pendiente', date: new Date().toISOString().split('T')[0], notes: '', resolvedItems: [] };
    }

    const statusEl = document.getElementById('result-status');
    const dateEl = document.getElementById('result-date');
    const notesEl = document.getElementById('result-notes-input');
    if (statusEl) statusEl.value = item.maintenanceResult.status || 'Pendiente';
    if (dateEl) dateEl.value = item.maintenanceResult.date || '';
    if (notesEl) notesEl.value = item.maintenanceResult.notes || '';

    const container = document.getElementById('result-items-container');
    if (container) {
        container.innerHTML = '';
        const diagObj = item.diagnostics || {};
        const resolvedItems = item.maintenanceResult.resolvedItems || [];

        DIAG_STRUCTURE.forEach(cat => {
            // Collect only failed items for this category
            let hasFailedItems = false;
            const catFailedGroups = [];

            cat.groups.forEach(group => {
                const failedInGroup = [];
                group.items.forEach(it => {
                    const isOk = (diagObj[cat.category] || {})[it.id] === true;
                    if (!isOk) {
                        failedInGroup.push(it);
                        hasFailedItems = true;
                    }
                });
                if (failedInGroup.length > 0) {
                    catFailedGroups.push({ group, failedItems: failedInGroup });
                }
            });

            if (!hasFailedItems) return;

            // Build category card (like diagnostic view)
            const section = document.createElement('div');
            section.className = 'diag-card';

            // Check if all failed items in this category are resolved
            const allResolved = catFailedGroups.every(g =>
                g.failedItems.every(it => resolvedItems.includes(`${cat.category}:${it.id}`))
            );

            section.innerHTML = `
                <div class="diag-card-header">
                    <h3 class="${allResolved ? 'is-resolved' : 'is-pending'}">
                        <span class="material-symbols-outlined status-icon">${allResolved ? 'check_circle' : 'warning'}</span>
                        ${t(currentLang, cat.category)}
                    </h3>
                    <div class="diag-card-master">
                        <label for="resolve-master-${cat.category}">${t(currentLang, 'checkAll')}</label>
                        <input type="checkbox" id="resolve-master-${cat.category}" ${allResolved ? 'checked' : ''}
                            onchange="toggleResolveCategoryMaster('${cat.category}', this.checked)">
                    </div>
                </div>`;

            catFailedGroups.forEach(({ group, failedItems }) => {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'diag-result-group';
                groupDiv.innerHTML = `<h4><span class="group-dot"></span> ${t(currentLang, group.key)}</h4>`;

                const itemsList = document.createElement('div');
                itemsList.className = 'diag-result-items';

                failedItems.forEach(it => {
                    const isResolved = resolvedItems.includes(`${cat.category}:${it.id}`);
                    const itemDiv = document.createElement('div');
                    itemDiv.className = `diag-item-row ${isResolved ? 'is-resolved' : 'is-pending'}`;

                    itemDiv.innerHTML = `
                        <input type="checkbox" id="resolve-${cat.category}-${it.id}" ${isResolved ? 'checked' : ''}
                            onchange="toggleResolvedItem('${cat.category}', '${it.id}', this.checked)">
                        <label for="resolve-${cat.category}-${it.id}">
                            <div class="diag-item-label">
                                <span class="material-symbols-outlined status-icon">${isResolved ? 'check_circle' : 'cancel'}</span>
                                ${t(currentLang, it.label)}
                            </div>
                            <div class="diag-item-desc">${t(currentLang, it.desc)}</div>
                        </label>`;
                    itemsList.appendChild(itemDiv);
                });
                groupDiv.appendChild(itemsList);
                section.appendChild(groupDiv);
            });
            container.appendChild(section);
        });
    }
};

window.toggleResolvedItem = (cat, key, val) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (o && o.inventory[resultIndex]) {
        const id = `${cat}:${key}`;
        if (!o.inventory[resultIndex].maintenanceResult.resolvedItems) o.inventory[resultIndex].maintenanceResult.resolvedItems = [];
        const items = o.inventory[resultIndex].maintenanceResult.resolvedItems;
        if (val && !items.includes(id)) items.push(id);
        else if (!val && items.includes(id)) o.inventory[resultIndex].maintenanceResult.resolvedItems = items.filter(x => x !== id);
        openMaintenanceResult(resultIndex); // Refresh colors
    }
};

window.toggleResolveCategoryMaster = (catName, val) => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (o && o.inventory[resultIndex]) {
        const item = o.inventory[resultIndex];
        if (!item.maintenanceResult.resolvedItems) item.maintenanceResult.resolvedItems = [];
        const diagObj = item.diagnostics || {};
        const catStruct = DIAG_STRUCTURE.find(c => c.category === catName);
        if (!catStruct) return;

        catStruct.groups.forEach(group => {
            group.items.forEach(it => {
                const isOk = (diagObj[catName] || {})[it.id] === true;
                if (!isOk) {
                    const id = `${catName}:${it.id}`;
                    if (val && !item.maintenanceResult.resolvedItems.includes(id)) {
                        item.maintenanceResult.resolvedItems.push(id);
                    } else if (!val && item.maintenanceResult.resolvedItems.includes(id)) {
                        item.maintenanceResult.resolvedItems = item.maintenanceResult.resolvedItems.filter(x => x !== id);
                    }
                }
            });
        });
        openMaintenanceResult(resultIndex); // Refresh
    }
};

window.saveMaintenanceResult = async () => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (o && o.inventory[resultIndex]) {
        const statusEl = document.getElementById('result-status');
        const dateEl = document.getElementById('result-date');
        const notesEl = document.getElementById('result-notes-input');
        if (statusEl) o.inventory[resultIndex].maintenanceResult.status = statusEl.value;
        if (dateEl) o.inventory[resultIndex].maintenanceResult.date = dateEl.value;
        if (notesEl) o.inventory[resultIndex].maintenanceResult.notes = notesEl.value;
        await saveOffice(o);
        closeMaintenanceResult();
        renderTable();
        if (typeof Swal !== 'undefined') Swal.fire({ title: t(currentLang, 'successMsg'), icon: 'success', timer: 1200, showConfirmButton: false });
    }
};

window.closeMaintenanceResult = () => {
    resultIndex = null;
    const resultSection = document.getElementById('result-integrated-section');
    if (resultSection) resultSection.style.display = 'none';
    if (dom.viewEquip) dom.viewEquip.style.display = 'block';
};

// Field Repair Mode shortcuts
window.toggleDiagnostic = () => {
    if (activeOfficeId) {
        window.showAddEquipmentForm();
        const o = appData.find(off => off.id === activeOfficeId);
        if (o && o.inventory.length > 0) {
            // Open diagnostic for last item or first available
            window.openDiagnostic(o.inventory.length - 1);
        }
    }
};

window.toggleMaintenance = () => {
    if (activeOfficeId) {
        const o = appData.find(off => off.id === activeOfficeId);
        if (o && o.inventory.length > 0) {
            window.openMaintenanceResult(o.inventory.length - 1);
        }
    }
};

window.saveCurrent = () => {
    // Save the current diagnostic or maintenance result
    if (diagnosticIndex !== null) {
        window.saveIntegratedDiagnosticFlow();
    } else if (resultIndex !== null) {
        window.saveMaintenanceResult();
    }
};

window.closeCurrent = () => {
    if (diagnosticIndex !== null) {
        window.closeIntegratedDiagnostic();
    } else if (resultIndex !== null) {
        window.closeMaintenanceResult();
    }
};

window.refreshTable = () => {
    if (activeOfficeId) {
        renderTable();
        renderOfficesTable();
    }
};


// Export functions for HTML
window.exportToCSV = () => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o || o.inventory.length === 0) return;
    
    let csv = "Asset Tag,Type,Model,Serial,Status,User,Notes\n";
    o.inventory.forEach(item => {
        csv += `"${item.assetTag}","${item.type}","${item.model}","${item.serial}","${item.status}","${item.user}","${item.notes}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Inventory_${o.company}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.exportToPDF = () => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o || o.inventory.length === 0) return;

    // 1. Procedural Integrity Check (New)
    let allIssues = [];
    o.inventory.forEach(item => {
        const issues = checkProceduralIntegrity(item);
        if (issues.length > 0) allIssues.push(`${item.assetTag}: ${issues.join(', ')}`);
    });

    if (allIssues.length > 0) {
        Swal.fire({
            title: t(currentLang, 'pdfIntegrityWarnTitle'), // New translation key
            html: `<p>${t(currentLang, 'pdfIntegrityWarnText')}</p><ul>${allIssues.map(issue => `<li>${issue}</li>`).join('')}</ul>`, // New translation key
            icon: 'warning',
            confirmButtonText: t(currentLang, 'understood') // New translation key
        });
        return;
    }

    // 2. Final Checklist (New)
    showFinalChecklist(() => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
        const currentLang = localStorage.getItem('pocketITCheckLang') || 'es';

        // 1. Calculate Stats
        const total = o.inventory.length;
        const active = o.inventory.filter(i => i.status === 'Activo').length;
        const stock = o.inventory.filter(i => i.status === 'Stock').length;
        const repair = o.inventory.filter(i => i.status === 'Reparación').length;
        const decom = o.inventory.filter(i => i.status === 'Baja').length;

        const stats = [
            tPdf(currentLang, 'pdfSummaryBoxTitle'),
            `${tPdf(currentLang, 'pdfTotal')}: ${total} | ${tPdf(currentLang, 'Activo')}: ${active} | ${tPdf(currentLang, 'Stock')}: ${stock}`,
            `${tPdf(currentLang, 'Reparación')}: ${repair} | ${tPdf(currentLang, 'Baja')}: ${decom}`
        ];

        // 2. Header (Type A with Stats)
        const title = tPdf(currentLang, 'pdfInventoryTitle');
        const rightLines = [
            `${tPdf(currentLang, 'pdfDateCol')}: ${o.auditDate || new Date().toISOString().split('T')[0]}`
        ];
        let y = drawHeaderTypeA(doc, title, [5, 150, 105], rightLines, currentLang, stats);

        // 3. Subheader (Office Info)
        y = drawSubheader(doc, o, y + 5, currentLang);

        // 4. Inventory Table
        const tableData = o.inventory.map(item => {
            const diagObj = item.diagnostics || {};
            const issuesFound = [];
            DIAG_STRUCTURE.forEach(cat => {
                cat.groups.forEach(group => {
                    group.items.forEach(it => {
                        if ((diagObj[cat.category] || {})[it.id] === false) {
                            issuesFound.push(t(currentLang, it.label));
                        }
                    });
                });
            });

            // Extract notes, and optionally, photo info
            let notesContent = item.notes || '';
            const photoMatch = notesContent.match(/\[FOTO EQUIPO capturada: (.*?)\]/);
            if (photoMatch) {
                // If photo info is present, display it concisely
                notesContent = notesContent.replace(photoMatch[0], '').trim(); // Remove photo tag from general notes
                notesContent = `${notesContent}\n(Foto adjunta: ${photoMatch[1].split(' - ')[0]})`.trim();
            }


            return [
                item.assetTag || '-',
                t(currentLang, item.status) || item.status,
                `${t(currentLang, item.type)}\\n${item.model}`,
                `S/N: ${item.serial || '-'}\\nUsu: ${item.user || '-'}`,
                issuesFound.length > 0 ? issuesFound.join(', ') : 'OK',
                notesContent.length > 0 ? notesContent : '-'
            ];
        });

        doc.autoTable({
            startY: y + 2,
            head: [[
                tPdf(currentLang, 'pdfColID'),
                tPdf(currentLang, 'pdfColStatus'),
                tPdf(currentLang, 'pdfColCatMod'),
                tPdf(currentLang, 'pdfColSNAsig'),
                tPdf(currentLang, 'pdfColDiagSummary'), // New translation key
                tPdf(currentLang, 'pdfColNotes') // New translation key
            ]],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], textColor: 255, fontSize: 8, fontStyle: 'bold' },
            bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 18 },
                2: { cellWidth: 38 },
                3: { cellWidth: 38 },
                4: { cellWidth: 45 }, // Adjusted width
                5: { cellWidth: 'auto' } // New column
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 }
        });

        // 5. Signatures
        drawModelSignatures(doc, doc.lastAutoTable.finalY + 10, o, currentLang);

        // 6. Page Numbers
        addModelPageNumbers(doc, currentLang);

        doc.save(`Inventory_${o.company}_${new Date().toISOString().split('T')[0]}.pdf`);
    });
};

window.generateMasterMaintenancePlanPDF = () => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o || o.inventory.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' }); // Landscape for plan
    const currentLang = localStorage.getItem('pocketITCheckLang') || 'es';

    // 1. Filter failed items
    const failedItems = o.inventory.map(item => {
        const issues = [];
        const actions = [];
        const diagObj = item.diagnostics || {};
        DIAG_STRUCTURE.forEach(cat => {
            cat.groups.forEach(group => {
                group.items.forEach(it => {
                    const isOk = (diagObj[cat.category] || {})[it.id] === true;
                    if (!isOk) {
                        const explicitIssue = `[${t(currentLang, cat.category)} / ${t(currentLang, group.key)}] ${t(currentLang, `desc_${it.id}`)}`;
                        issues.push(explicitIssue);
                        actions.push(`${t(currentLang, `act_${it.id}`)}`);
                    }
                });
            });
        });
        return issues.length > 0 ? { ...item, issues, actions } : null;
    }).filter(x => x !== null);

    // 2. Stats & Header (Type B)
    const stats = [
        `${tPdf(currentLang, 'pdfSummaryBoxTitle')}`,
        `${tPdf(currentLang, 'pdfTotalItems')}: ${o.inventory.length}`,
        `${tPdf(currentLang, 'pdfSummaryActivos')}: ${failedItems.length} ${tPdf(currentLang, 'pdfPending')}`
    ];
    let y = drawHeaderTypeB(doc, tPdf(currentLang, 'pdfMasterPlanTitle'), o, stats, currentLang);
    y = drawSubheader(doc, o, y + 5, currentLang);

    // 3. Table
    const tableData = failedItems.map(it => [
        `${it.assetTag}\n${it.model}`,
        t(currentLang, it.status),
        `${t(currentLang, it.location || '-')}\n${it.user || '-'}`,
        it.issues.length > 0 ? '• ' + it.issues.join('\n• ') : '',
        it.actions.length > 0 ? '• ' + it.actions.join('\n• ') : ''
    ]);

    doc.autoTable({
        startY: y + 2,
        head: [[
            tPdf(currentLang, 'pdfCategory') + '/' + tPdf(currentLang, 'pdfModel'),
            tPdf(currentLang, 'pdfEquipStatus'),
            tPdf(currentLang, 'pdfLocAssign'),
            tPdf(currentLang, 'pdfProbs'),
            tPdf(currentLang, 'pdfReqActions')
        ]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105], fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 20 },
            2: { cellWidth: 40 },
            3: { cellWidth: 60 },
            4: { cellWidth: 100 }
        },
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' }
    });

    drawModelSignatures(doc, doc.lastAutoTable.finalY + 10, o, currentLang);
    addModelPageNumbers(doc, currentLang);
    doc.save(`MaintenancePlan_${o.company}_${new Date().toISOString().split('T')[0]}.pdf`);
};

window.generateResultsReportPDF = () => {
    const o = appData.find(off => off.id === activeOfficeId);
    if (!o || o.inventory.length === 0) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    const currentLang = localStorage.getItem('pocketITCheckLang') || 'es';

    // 1. Process data for results
    let totalIssues = 0;
    let resolvedIssues = 0;

    const resultsData = o.inventory.map(item => {
        const diagObj = item.diagnostics || {};
        const result = item.maintenanceResult || { status: 'Pendiente', resolvedItems: [] };
        
        const originalProbs = [];
        const actionsDone = [];

        DIAG_STRUCTURE.forEach(cat => {
            cat.groups.forEach(group => {
                group.items.forEach(it => {
                    const isOk = (diagObj[cat.category] || {})[it.id] === true;
                    if (!isOk) {
                        totalIssues++;
                        const label = `[${t(currentLang, cat.category)} / ${t(currentLang, group.key)}] ${t(currentLang, `desc_${it.id}`)}`;
                        originalProbs.push(label);
                        if (result.resolvedItems && result.resolvedItems.includes(`${cat.category}:${it.id}`)) {
                            resolvedIssues++;
                            actionsDone.push(label);
                        }
                    }
                });
            });
        });

        return {
            asset: `${item.assetTag}\n${item.model}`,
            probs: originalProbs.length > 0 ? '• ' + originalProbs.join('\n• ') : '-',
            actions: actionsDone.length > 0 ? '• ' + actionsDone.join('\n• ') : '-',
            status: t(currentLang, result.status || 'Pendiente'),
            notes: result.notes || '-'
        };
    });

    const completionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

    // 2. Stats & Header
    const stats = [
        `${tPdf(currentLang, 'pdfSummaryBoxTitle')}`,
        `${tPdf(currentLang, 'pdfTotalItems')}: ${o.inventory.length} | ${tPdf(currentLang, 'pdfResolvedCount')}: ${resolvedIssues}`,
        `${tPdf(currentLang, 'pdfCompletionRate')}: ${completionRate}%`
    ];
    let y = drawHeaderTypeB(doc, tPdf(currentLang, 'pdfResultsTitle'), o, stats, currentLang);
    y = drawSubheader(doc, o, y + 5, currentLang);

    // 3. Table
    doc.autoTable({
        startY: y + 2,
        head: [[
            tPdf(currentLang, 'pdfCategory') + '/' + tPdf(currentLang, 'pdfModel'),
            tPdf(currentLang, 'pdfOrigDiag'),
            tPdf(currentLang, 'pdfDoneActs'),
            tPdf(currentLang, 'pdfStatus'),
            tPdf(currentLang, 'pdfNotes')
        ]],
        body: resultsData.map(r => [r.asset, r.probs, r.actions, r.status, r.notes]),
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105], fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 55 },
            2: { cellWidth: 55 },
            3: { cellWidth: 25 },
            4: { cellWidth: 80 }
        },
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' }
    });

    drawModelSignatures(doc, doc.lastAutoTable.finalY + 10, o, currentLang);
    addModelPageNumbers(doc, currentLang);
    doc.save(`MaintenanceReport_${o.company}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ====== Settings & Data Management ======
window.showSettings = () => {
    activeOfficeId = null;
    hideAllViews();
    if (dom.viewSettings) dom.viewSettings.style.display = 'block';
    if (dom.mainFAB) dom.mainFAB.style.display = 'none';
    setActiveNav(2);
    applyTranslations(currentLang);
};

window.exportAllData = async () => {
    try {
        const data = await getAllOffices();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PocketITCheck_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Swal.fire({ title: t(currentLang, 'successMsg'), text: t(currentLang, 'settingsExportOk'), icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
        console.error('Export error:', err);
        Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
    }
};

window.importAllData = () => {
    let fileInput = document.getElementById('importFileInput');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'importFileInput';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!Array.isArray(data)) throw new Error('Invalid format');
            const confirm = await Swal.fire({
                title: t(currentLang, 'sureConfirm'),
                text: t(currentLang, 'settingsImportWarn'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3525cd',
                confirmButtonText: t(currentLang, 'settingsImportConfirm')
            });
            if (confirm.isConfirmed) {
                for (const office of data) {
                    await saveOffice(office);
                }
                appData = await getAllOffices();
                renderOfficesTable();
                Swal.fire({ title: t(currentLang, 'successMsg'), text: `${data.length} ${t(currentLang, 'settingsImportOk')}`, icon: 'success', timer: 2000, showConfirmButton: false });
            }
        } catch (err) {
            console.error('Import error:', err);
            Swal.fire({ title: 'Error', text: t(currentLang, 'settingsImportError'), icon: 'error' });
        }
        fileInput.value = '';
    };
    fileInput.click();
};

window.clearAllData = async () => {
    const confirm = await Swal.fire({
        title: t(currentLang, 'sureConfirm'),
        text: t(currentLang, 'settingsClearWarn'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: t(currentLang, 'deleteBtn')
    });
    if (confirm.isConfirmed) {
        for (const office of appData) {
            await deleteOffice(office.id);
        }
        appData = [];
        activeOfficeId = null;
        window.goBackToOffices();
        Swal.fire({ title: t(currentLang, 'deletedMsg'), icon: 'success', timer: 1500, showConfirmButton: false });
    }
};
