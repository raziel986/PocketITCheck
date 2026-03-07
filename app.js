// Manejo de Persistencia e Inglés/Español
let currentLang = localStorage.getItem('pocketITCheckLang') || 'es';
let appData = JSON.parse(localStorage.getItem('pocketITCheckAppV2') || localStorage.getItem('pocketInventoryAppV2')) || [];

let activeOfficeId = null;
let editingIndex = -1;
let editingOfficeId = null;
let diagnosticIndex = null;
let resultIndex = null;
let tableState = {
    offices: { searchQuery: '', currentPage: 1, itemsPerPage: 10 },
    equipment: { searchQuery: '', currentPage: 1, itemsPerPage: 10 }
};

const translations = {
    es: {
        appName: "PocketITCheck",
        appSlogan: "Inventario | Diagnóstico | Mantenimiento | Reparaciones",
        newOffice: "🏢 Nueva Oficina",
        companyLabel: "Nombre Empresa / Cliente *",
        deptLabel: "Departamento / Área",
        locationLabel: "Ubicación Física",
        auditorLabel: "Auditor Técnico *",
        auditCompanyLabel: "Empresa Auditora *",
        auditDateLabel: "Fecha de Auditoría",
        managerLabel: "Responsable / Gerente *",
        managerTitleLabel: "Cargo del Responsable *",
        registerOffice: "📝 Registrar Oficina",
        saveChanges: "💾 Guardar Cambios",
        cancelEdit: "❌ Cancelar Edición",
        backToOffices: "⬅️ Volver a Oficinas",
        newEquipment: "💻 Nuevo Equipo",
        editEquipment: "📋 Editar Equipo",
        categoryLabel: "Categoría",
        modelLabel: "Marca y Modelo",
        serialLabel: "Número de Serie (S/N)",
        assetTagLabel: "ID de Activo (Asset Tag) *",
        statusLabel: "Estado del Activo *",
        warrantyCover: "¿Cobertura de Garantía Vigente?",
        purchaseDateLabel: "Fecha de Compra",
        warrantyUntilLabel: "Garantía Hasta",
        assignmentLabel: "Asignación (Usuario o Ubicación)",
        extraNotes: "Notas Adicionales",
        addEquipment: "➕ Añadir Equipo",
        officeManagerSub: "🏢 Gestor de Oficinas y Clientes",
        searchPlaceholder: "Buscar...",
        officesCount: "oficinas",
        equipmentCount: "items",
        viewLabel: "Ver",
        recordsLabel: "registros",
        pageLabel: "Página",
        allLabel: "Todo",
        actionsLabel: "Acción",
        techAuditor: "Auditor",
        equips: "Equipos",
        infoGeneral: "Info General",
        statusAssignment: "Estado & Asignación",
        techSpecs: "Especificaciones Técnicas",
        diagTitle: "🩺 Diagnóstico Técnico",
        maintResult: "✅ Resultado de Mantenimiento",
        integratedDiag: "🩺 Diagnóstico",
        hardware: "Hardware",
        software: "Software",
        observations: "Observaciones y Recomendaciones:",
        saveAsset: "💾 Guardar Activo",
        generatePlan: "📄 Generar Plan PDF",
        maintStatus: "Estado del Mantenimiento:",
        execDate: "Fecha de Ejecución:",
        diagItems: "ÍTEMS DIAGNOSTICADOS — Marcar los resueltos",
        postMaintNotes: "Notas Post-Mantenimiento:",
        saveResult: "💾 Guardar Resultado",
        close: "✕ Cerrar",
        deleteConfirm: "¿Eliminar?",
        sureConfirm: "¿Estás seguro?",
        deleteBtn: "Sí, eliminar",
        successMsg: "¡Hecho!",
        deletedMsg: "¡Eliminado!",
        loadingAssets: "Cargando Activos IT...",
        emptyOffices: "No hay oficinas registradas.",
        emptyAssets: "No hay equipos registrados.",
        noResults: "No se encontraron resultados.",
        officeCompanyPl: "Ej: TechCorp S.A.",
        officeDeptoPl: "Ej: Recursos Humanos",
        officeLocationPl: "Ej: Sede Central - Piso 4",
        officeAuditorPl: "Ej: Carlos Noguera",
        officeAuditorCompanyPl: "Ej: IT Solutions Inc.",
        officeManagerPl: "Ej: Ing. Maria Lopez",
        officeManagerTitlePl: "Ej: Gerente de IT",
        assetTagPl: "Ej: LAP-001",
        modelPl: "Ej: Dell Latitude 5420",
        serialPl: "Ej: ABC123XYZ",
        userPl: "Ej: Juan Perez / Recepción",
        notesPl: "Ej: Pantalla táctil, Teclado retroiluminado",
        diagNotesPl: "Información técnica adicional...",
        maintNotesPl: "Detalles del trabajo realizado...",
        searchPl: "Buscar...",
        // PDF
        pdfInventoryTitle: "Inventario de Equipos IT",
        pdfMasterPlanTitle: "Plan de Mantenimiento para Equipos IT",
        pdfResultsTitle: "Resultado de Mantenimiento de Equipos IT",
        pdfMaintenancePlan: "Plan de Mantenimiento",
        pdfAuditorSign: "AUDITOR T\u00c9CNICO",
        pdfClientSign: "APROBACI\u00d3N CLIENTE",
        pdfCompanySeal: "SELLO EMPRESA",
        pdfGeneratedBy: "Generado por PocketITCheck",
        pdfDate: "Fecha",
        pdfPage: "P\u00e1gina",
        pdfOf: "de",
        pdfPendingItems: "Elementos Pendientes",
        pdfResolvedItems: "Elementos Resueltos",
        pdfCategory: "Categor\u00eda",
        pdfModel: "Modelo",
        pdfUser: "Asignado a",
        pdfNotes: "Notas",
        pdfStatus: "Estado",
        pdfSummary: "Resumen General",
        pdfResolved: "Resuelto",
        pdfPending: "Pendiente",
        pdfFailed: "Fallido",
        pdfTotalItems: "Total Equipos",
        pdfResolvedCount: "Resueltos",
        pdfPendingCount: "Pendientes",
        pdfCompletionRate: "Tasa de Cumplimiento",
        pdfPriority: "Prioridad",
        pdfHigh: "Alta",
        pdfMedium: "Media",
        pdfLow: "Baja",
        pdfConfidential: "CONFIDENCIAL",
        pdfDocRef: "Ref",
        pdfComponent: "Componente",
        pdfType: "Tipo",
        pdfFailedComponents: "Componentes con Fallas",
        pdfPerformedBy: "Realizado por",
        pdfApprovedBy: "Aprobado por",
        pdfEquipDetail: "Detalle por Equipo",
        pdfFaultResolution: "Fallas y Resoluciones",
        tooltipMasterPlan: "Plan Maestro de Mantenimiento",
        tooltipResults: "Informe de Resultados",
        tooltipCSV: "Exportar CSV",
        tooltipPDF: "Generar PDF Inventario",
        Pendiente: "Pendiente",
        Completado: "Completado",
        Parcial: "Parcial",
        // Categor\u00edas
        Laptop: "Laptop / Port\u00e1til",
        Desktop: "Desktop / PC de Escritorio",
        Monitor: "Monitor",
        Perif\u00e9rico: "Perif\u00e9rico (Teclado/Mouse)",
        Impresora: "Impresora / Esc\u00e1ner",
        Red: "Equipo de Red (Router/Switch)",
        selectType: "Selecciona un tipo...",
        // Estados
        Activo: "Activo / En Uso",
        Stock: "En Stock / Almac\u00e9n",
        Reparaci\u00f3n: "En Reparaci\u00f3n",
        Baja: "Dado de Baja / Desechado",
        // Diagn\u00f3stico
        power: "Energ\u00eda/Bater\u00eda", storage: "Almacenamiento", ram: "Memoria RAM",
        temp: "T\u00e9rmico/Fans", clean: "Limpieza F\u00edsica",
        os: "Sistema Operativo", security: "Seguridad/AV",
        performance: "Rendimiento/Drivers", license: "Licenciamiento",
        cpu: "Procesador (CPU)", mac: "Direcci\u00f3n MAC", size: "Tama\u00f1o (Pulgadas)",
        res: "Resoluci\u00f3n", panel: "Tipo de Panel", conn: "Conectividad",
        ip: "Direcci\u00f3n IP", consum: "Consumible", role: "Rol / Funci\u00f3n",
        firm: "Firmware", ports: "Puertos"
    },
    en: {
        appName: "PocketITCheck",
        appSlogan: "Inventory | Diagnostics | Maintenance | Repairs",
        newOffice: "🏢 New Office",
        companyLabel: "Company / Client Name *",
        deptLabel: "Department / Area",
        locationLabel: "Physical Location",
        auditorLabel: "Technical Auditor *",
        auditCompanyLabel: "Audit Company *",
        auditDateLabel: "Audit Date",
        managerLabel: "Manager *",
        managerTitleLabel: "Manager's Job Title *",
        registerOffice: "📝 Register Office",
        saveChanges: "💾 Save Changes",
        cancelEdit: "❌ Cancel Edit",
        backToOffices: "⬅️ Back to Offices",
        newEquipment: "💻 New Equipment",
        editEquipment: "📋 Edit Equipment",
        categoryLabel: "Category",
        modelLabel: "Brand & Model",
        serialLabel: "Serial Number (S/N)",
        assetTagLabel: "Asset Tag ID *",
        statusLabel: "Asset Status *",
        warrantyCover: "Active Warranty Coverage?",
        purchaseDateLabel: "Purchase Date",
        warrantyUntilLabel: "Warranty Until",
        assignmentLabel: "Assignment (User or Location)",
        extraNotes: "Additional Notes",
        addEquipment: "➕ Add Equipment",
        officeManagerSub: "🏢 Office & Client Manager",
        searchPlaceholder: "Search...",
        officesCount: "offices",
        equipmentCount: "items",
        viewLabel: "View",
        recordsLabel: "records",
        pageLabel: "Page",
        allLabel: "All",
        actionsLabel: "Action",
        techAuditor: "Auditor",
        equips: "Equips",
        infoGeneral: "General Info",
        statusAssignment: "Status & Assignment",
        techSpecs: "Technical Specs",
        diagTitle: "🩺 Technical Diagnostic",
        maintResult: "✅ Maintenance Result",
        integratedDiag: "🩺 Diagnostic",
        hardware: "Hardware",
        software: "Software",
        observations: "Observations & Recommendations:",
        saveAsset: "💾 Save Asset Changes",
        generatePlan: "📄 Generate PDF Plan",
        maintStatus: "Maintenance Status:",
        execDate: "Execution Date:",
        diagItems: "DIAGNOSED ITEMS — Check the resolved ones",
        postMaintNotes: "Post-Maintenance Notes:",
        saveResult: "💾 Save Result",
        close: "✕ Close",
        deleteConfirm: "Delete?",
        sureConfirm: "Are you sure?",
        deleteBtn: "Yes, delete",
        successMsg: "Done!",
        deletedMsg: "Deleted!",
        loadingAssets: "Loading IT Assets...",
        emptyOffices: "No offices registered.",
        emptyAssets: "No equipment registered.",
        noResults: "No results found.",
        officeCompanyPl: "e.g., TechCorp S.A.",
        officeDeptoPl: "e.g., Human Resources",
        officeLocationPl: "e.g., Main HQ - 4th Floor",
        officeAuditorPl: "e.g., Carlos Noguera",
        officeAuditorCompanyPl: "e.g., IT Solutions Inc.",
        officeManagerPl: "e.g., Maria Lopez, Eng.",
        officeManagerTitlePl: "e.g., IT Manager",
        assetTagPl: "e.g., LAP-001",
        modelPl: "e.g., Dell Latitude 5420",
        serialPl: "e.g., ABC123XYZ",
        userPl: "e.g., John Doe / Reception",
        notesPl: "e.g., Touchscreen, Backlit Keyboard",
        diagNotesPl: "Additional technical information...",
        maintNotesPl: "Details of work performed...",
        searchPl: "Search...",
        // PDF
        pdfInventoryTitle: "IT Equipment Inventory",
        pdfMasterPlanTitle: "Maintenance Plan for IT Equipment",
        pdfResultsTitle: "IT Equipment Maintenance Results",
        pdfMaintenancePlan: "Maintenance Plan",
        pdfAuditorSign: "TECHNICAL AUDITOR",
        pdfClientSign: "CLIENT APPROVAL",
        pdfCompanySeal: "COMPANY SEAL",
        pdfGeneratedBy: "Generated by PocketITCheck",
        pdfDate: "Date",
        pdfPage: "Page",
        pdfOf: "of",
        pdfPendingItems: "Pending Items",
        pdfResolvedItems: "Resolved Items",
        pdfCategory: "Category",
        pdfModel: "Model",
        pdfUser: "Assigned to",
        pdfNotes: "Notes",
        pdfStatus: "Status",
        pdfSummary: "General Summary",
        pdfResolved: "Resolved",
        pdfPending: "Pending",
        pdfFailed: "Failed",
        pdfTotalItems: "Total Equipment",
        pdfResolvedCount: "Resolved",
        pdfPendingCount: "Pending",
        pdfCompletionRate: "Completion Rate",
        pdfPriority: "Priority",
        pdfHigh: "High",
        pdfMedium: "Medium",
        pdfLow: "Low",
        pdfConfidential: "CONFIDENTIAL",
        pdfDocRef: "Ref",
        pdfComponent: "Component",
        pdfType: "Type",
        pdfFailedComponents: "Failed Components",
        pdfPerformedBy: "Performed by",
        pdfApprovedBy: "Approved by",
        pdfEquipDetail: "Equipment Detail",
        pdfFaultResolution: "Faults & Resolutions",
        tooltipMasterPlan: "Master Maintenance Plan",
        tooltipResults: "Results Report",
        tooltipCSV: "Export CSV",
        tooltipPDF: "Generate Inventory PDF",
        Pendiente: "Pending",
        Completado: "Completed",
        Parcial: "Partial",
        // Categories
        Laptop: "Laptop / Portable",
        Desktop: "Desktop / Desktop PC",
        Monitor: "Monitor",
        Perif\u00e9rico: "Peripheral (Keyboard/Mouse)",
        Impresora: "Printer / Scanner",
        Red: "Network Device (Router/Switch)",
        selectType: "Select a type...",
        // Statuses
        Activo: "Active / In Use",
        Stock: "In Stock / Warehouse",
        Reparaci\u00f3n: "Under Repair",
        Baja: "Decommissioned / Discarded",
        // Diagnostic
        power: "Power/Battery", storage: "Storage", ram: "RAM Memory",
        temp: "Thermal/Fans", clean: "Physical Cleaning",
        os: "Operating System", security: "Security/AV",
        performance: "Performance/Drivers", license: "Licensing",
        cpu: "Processor (CPU)", mac: "MAC Address", size: "Size (Inches)",
        res: "Resolution", panel: "Panel Type", conn: "Connectivity",
        ip: "IP Address", consum: "Consumable", role: "Role / Function",
        firm: "Firmware", ports: "Ports"
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

// Strip emojis for PDF output (jsPDF can't render them)
function tPdf(key) {
    return t(key).replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{2700}-\u{27BF}\u{E000}-\u{F8FF}\u{200D}\u{20E3}\u{FE0F}\u{D83C}\u{D83D}\u{D83E}✅✕❌➕⬅️🩺📋📄💾📊📈📂💻🏢📝🔍✏️🗑️]/gu, '').trim();
}

function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('pocketITCheckLang', lang);
    applyTranslations();
    renderOfficesTable();
    if (activeOfficeId) {
        renderTable();
        selectOffice(activeOfficeId); // Update summary
    }
}

function toggleLanguage(isEn) {
    switchLanguage(isEn ? 'en' : 'es');
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });

    // Sincronizar el toggle visualmente
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.checked = (currentLang === 'en');

    // Sincronizar clases activas en las etiquetas
    const labelEs = document.getElementById('lang-es');
    const labelEn = document.getElementById('lang-en');
    if (labelEs && labelEn) {
        labelEs.classList.toggle('active', currentLang === 'es');
        labelEn.classList.toggle('active', currentLang === 'en');
    }
}

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
    info.textContent = `${t('pageLabel')} ${state.currentPage} / ${totalPages}`;
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
        officesTableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><div style="font-size: 2rem; margin-bottom: 1rem;">🏢</div>${state.searchQuery ? t('noResults') : t('emptyOffices')}</td></tr>`;
        const pag = document.getElementById('officePagination'); if (pag) pag.innerHTML = '';
    } else {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const paged = state.itemsPerPage === Infinity ? filtered : filtered.slice(start, start + state.itemsPerPage);
        paged.forEach(office => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td data-label="${t('companyLabel')}"><strong class="text-primary">${office.company}</strong><br /><span class="text-secondary">${t('deptLabel')}: ${office.depto}</span></td>
                <td data-label="${t('locationLabel')}">${office.location}</td>
                <td data-label="${t('techAuditor')}">${office.auditor}</td>
                <td data-label="${t('equips')}" class="text-center"><span class="badge-count">${office.inventory.length}</span></td>
                <td data-label="${t('actionsLabel')}" class="action-col">
                    <div class="action-icons">
                        <button class="icon-btn icon-btn-info" title="${t('viewLabel')}" onclick="selectOffice('${office.id}')">📂</button>
                        <button class="icon-btn icon-btn-edit" title="${t('editEquipment')}" onclick="editOffice('${office.id}')">✏️</button>
                        <button class="icon-btn icon-btn-danger" title="${t('deleteConfirm')}" onclick="deleteOffice('${office.id}')">🗑️</button>
                    </div>
                </td>`;
            officesTableBody.appendChild(tr);
        });
        updatePagination('offices', filtered.length, 'officePagination');
    }
    const badge = document.getElementById('officeCountBadge');
    if (badge) badge.textContent = `${filtered.length} ${t('officesCount')}`;
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
        submitBtnOffice.innerHTML = t('registerOffice');
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
    submitBtnOffice.innerHTML = t('saveChanges');
    cancelEditOfficeBtn.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEditOffice() {
    editingOfficeId = null; officeForm.reset();
    submitBtnOffice.innerHTML = t('registerOffice');
    cancelEditOfficeBtn.style.display = 'none';
}

async function deleteOffice(id) {
    const res = await Swal.fire({
        title: t('sureConfirm'), text: t('sureConfirm'), icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: t('deleteBtn')
    });
    if (res.isConfirmed) {
        appData = appData.filter(o => o.id !== id);
        saveAppData(); renderOfficesTable();
        Swal.fire({ title: t('deletedMsg'), icon: 'success', timer: 1500, showConfirmButton: false });
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
        { id: "dyn_os", i18nKey: "os", type: "text", placeholder: "Ej: Windows 11 Pro" },
        { id: "dyn_cpu", i18nKey: "cpu", type: "text", placeholder: "Ej: Intel i5" },
        { id: "dyn_ram", i18nKey: "ram", type: "text", placeholder: "Ej: 16GB" },
        { id: "dyn_storage", i18nKey: "storage", type: "text", placeholder: "Ej: 512GB SSD" },
        { id: "dyn_mac", i18nKey: "mac", type: "text", placeholder: "Ej: 00:1A:..." }
    ],
    "Desktop": [
        { id: "dyn_os", i18nKey: "os", type: "text", placeholder: "Ej: Windows 11 Pro" },
        { id: "dyn_cpu", i18nKey: "cpu", type: "text", placeholder: "Ej: Intel i7" },
        { id: "dyn_ram", i18nKey: "ram", type: "text", placeholder: "Ej: 32GB" },
        { id: "dyn_storage", i18nKey: "storage", type: "text", placeholder: "Ej: 1TB SSD" },
        { id: "dyn_mac", i18nKey: "mac", i18nKey: "mac", type: "text", placeholder: "Ej: A1:B2:..." }
    ],
    "Monitor": [
        { id: "dyn_size", i18nKey: "size", type: "number", placeholder: "Ej: 27" },
        { id: "dyn_res", i18nKey: "res", type: "text", placeholder: "Ej: 2560x1440" },
        { id: "dyn_panel", i18nKey: "panel", type: "text", placeholder: "Ej: IPS" },
        { id: "dyn_conn", i18nKey: "conn", type: "text", placeholder: "Ej: HDMI" }
    ],
    "Periférico": [
        { id: "dyn_type", i18nKey: "type", type: "text", placeholder: "Ej: Teclado" },
        { id: "dyn_conn", i18nKey: "conn", type: "text", placeholder: "Ej: USB" }
    ],
    "Impresora": [
        { id: "dyn_type", i18nKey: "type", type: "text", placeholder: "Ej: Láser" },
        { id: "dyn_ip", i18nKey: "ip", type: "text", placeholder: "Ej: 192.168.1.50" },
        { id: "dyn_mac", i18nKey: "mac", type: "text", placeholder: "Ej: 00:1A:..." },
        { id: "dyn_consum", i18nKey: "consum", type: "text", placeholder: "Ej: HP 85A" }
    ],
    "Red": [
        { id: "dyn_role", i18nKey: "role", type: "text", placeholder: "Ej: Switch" },
        { id: "dyn_ip", i18nKey: "ip", type: "text", placeholder: "Ej: 10.0.0.1" },
        { id: "dyn_firm", i18nKey: "firm", type: "text", placeholder: "Ej: Cisco IOS" },
        { id: "dyn_ports", i18nKey: "ports", type: "number", placeholder: "Ej: 24" }
    ]
};

if (typeSelect) {
    typeSelect.addEventListener('change', function () {
        const fields = categoryFields[this.value];
        dynamicContainer.innerHTML = '';
        if (fields) {
            fields.forEach(f => {
                const div = document.createElement('div'); div.className = 'form-group';
                div.innerHTML = `<label data-i18n="${f.i18nKey}">${t(f.i18nKey)}</label><input type="${f.type}" id="${f.id}" placeholder="${f.placeholder}">`;
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
            const sb = item.status === 'Activo' ? `<span class="status-badge status-active">${t('Activo')}</span>` :
                item.status === 'Stock' ? `<span class="status-badge status-stock">${t('Stock')}</span>` :
                    item.status === 'Reparación' ? `<span class="status-badge status-repair">${t('Reparación')}</span>` :
                        `<span class="status-badge status-off">${t('Baja')}</span>`;
            const hasIssues = item.diagnostics && (Object.values(item.diagnostics.hardware).includes(false) || Object.values(item.diagnostics.software).includes(false));
            tr.innerHTML = `
                <td data-label="${t('assetTagLabel')}"><strong>${item.assetTag}</strong></td>
                <td data-label="${t('infoGeneral')}"><div class="font-bold">${t(item.typeValue)}</div><div class="text-secondary">${item.model}</div><div class="serial-tag">S/N: ${item.serial}</div></td>
                <td data-label="${t('statusAssignment')}"><div style="margin-bottom:0.3rem;">${sb}</div><div>${item.user}</div></td>
                <td data-label="${t('techSpecs')}">
                    <div class="line-height-14">
                        ${(function () {
                    let specs = [];
                    if (item.dynamicData) {
                        const fields = categoryFields[item.typeValue] || [];
                        Object.keys(item.dynamicData).forEach(id => {
                            const field = fields.find(f => f.id === id);
                            if (field) specs.push(`<strong>${t(field.i18nKey)}:</strong> ${item.dynamicData[id]}`);
                        });
                    }
                    if (item.baseNotes) specs.push(`<strong>${t('extraNotes')}:</strong> ${item.baseNotes}`);
                    return specs.length > 0 ? specs.join('<br />') : (item.notes ? item.notes.replace(/ \| /g, '<br />') : '-');
                })()}
                    </div>
                    ${item.hasWarranty === 'No' ? `<div class="warranty-over"><strong>${t('warrantyUntilLabel')}:</strong> Vencida</div>` :
                    (item.purchaseDate || item.warrantyDate) ? `<div class="warranty-info">${item.purchaseDate ? `<strong>${t('purchaseDateLabel')}:</strong> ${item.purchaseDate}` : ''}${item.warrantyDate ? ` <strong>${t('warrantyUntilLabel')}:</strong> ${item.warrantyDate}` : ''}</div>` : ''}
                </td>
                <td data-label="${t('actionsLabel')}" class="action-col">
                    <div class="action-icons">
                        <button class="icon-btn icon-btn-diagnostic" title="${t('integratedDiag')}" onclick="openDiagnostic(${item.originalIndex})">🩺</button>
                        ${hasIssues ? `<button class="icon-btn icon-btn-info" title="${t('maintResult')}" onclick="openMaintenanceResult(${item.originalIndex})" style="background: #d1fae5; border-color: #059669;">✅</button>` : ''}
                        <button class="icon-btn icon-btn-edit" title="${t('editEquipment')}" onclick="editItem(${item.originalIndex})">✏️</button>
                        <button class="icon-btn icon-btn-danger" title="${t('deleteConfirm')}" onclick="deleteItem(${item.originalIndex})">🗑️</button>
                    </div>
                </td>`;
            tbody.appendChild(tr);
        });
        updatePagination('equipment', filtered.length, 'equipmentPagination');
    }
    if (countBadge) countBadge.textContent = `${filtered.length} ${t('equipmentCount')}`;
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
    if (editingIndex > -1) { o.inventory[editingIndex] = newItem; editingIndex = -1; submitBtnEquipment.innerHTML = t('addEquipment'); cancelEditBtn.style.display = 'none'; }
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
    submitBtnEquipment.innerHTML = t('saveChanges'); document.getElementById('equipmentFormTitle').innerHTML = t('editEquipment');
    cancelEditBtn.style.display = 'block'; window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
    editingIndex = -1; inventoryForm.reset();
    document.getElementById('status').value = 'Activo'; document.getElementById('hasWarranty').value = 'Sí';
    toggleDates(); dynamicContainer.innerHTML = '';
    if (submitBtnEquipment) submitBtnEquipment.innerHTML = t('addEquipment');
    if (cancelEditBtn) cancelEditBtn.style.display = 'none';
}

async function deleteItem(idx) {
    const res = await Swal.fire({
        title: t('deleteConfirm'), text: t('sureConfirm'), icon: 'question',
        showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: t('deleteBtn')
    });
    if (res.isConfirmed) {
        const o = getActiveOffice(); o.inventory.splice(idx, 1);
        if (editingIndex === idx) cancelEdit(); else if (editingIndex > idx) editingIndex--;
        saveAppData(); renderTable();
        Swal.fire({ title: t('deletedMsg'), icon: 'success', timer: 1500, showConfirmButton: false });
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

    document.getElementById('diag-title').innerText = `${t('diagTitle')}: ${item.assetTag}`;
    document.getElementById('diag-subtitle').innerText = `${t(item.typeValue)} - ${item.model}`;
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
        { id: 'power', l: t('power'), i: '🔌', isH: true, sub: [{ id: 'cable', l: t('cables') }, { id: 'bat', l: t('battery') }] },
        { id: 'storage', l: t('storage'), i: '💽', isH: true, sub: [{ id: 'smart', l: 'S.M.A.R.T.' }, { id: 'speed', l: t('speed') }] },
        { id: 'ram', l: t('ram'), i: '🧠', isH: true, sub: [{ id: 'test', l: 'MemTest' }, { id: 'clean', l: t('contacts') }] },
        { id: 'temp', l: t('temp'), i: '🌡️', isH: true, sub: [{ id: 'paste', l: t('thermalPaste') }, { id: 'fan', l: t('fans') }] },
        { id: 'clean', l: t('clean'), i: '🧹', isH: true, sub: [{ id: 'int', l: t('internal') }, { id: 'ext', l: t('external') }] },
        { id: 'os', l: t('os'), i: '🖥️', isH: false, sub: [{ id: 'upd', l: t('updates') }, { id: 'sfc', l: t('integrity') }] },
        { id: 'security', l: t('security'), i: '🛡️', isH: false, sub: [{ id: 'av', l: 'Antivirus' }, { id: 'fw', l: 'Firewall' }] },
        { id: 'performance', l: t('performance'), i: '🚀', isH: false, sub: [{ id: 'drv', l: 'Drivers' }, { id: 'bg', l: t('recomLoad') }] },
        { id: 'license', l: t('license'), i: '🔑', isH: false, sub: [{ id: 'win', l: 'Windows' }, { id: 'off', l: 'Office' }] }
    ];

    let html = '';
    sections.forEach(s => {
        const diagRef = s.isH ? diag.hardware : diag.software;
        const cur = (diagRef && diagRef[s.id] !== undefined) ? diagRef[s.id] : true;
        const subData = diag.subItems ? (diag.subItems[s.id] || {}) : {};
        html += `
        <div class="diag-section" style="background:#f8fafc; padding:1.25rem; border-radius:16px; border:1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="font-weight:700; color:var(--primary); margin-bottom:1rem; display:flex; align-items:center; gap:0.6rem; font-size: 1.1rem;">${s.i} ${s.l}</div>
            <div class="diag-ok-container">
                <input type="checkbox" id="main-${s.id}" ${cur ? 'checked' : ''} onchange="toggleSubItems('${s.id}', this.checked)">
                <label for="main-${s.id}" style="font-weight:700; cursor:pointer; color: #1e293b;">OK</label>
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
    Swal.fire({ title: t('savedMsg'), icon: 'success', timer: 1500, showConfirmButton: false });
}

// =============== MÓDULO DE RESULTADOS INTEGRADO ===============

function openMaintenanceResult(index) {
    resultIndex = index;
    const item = getActiveOffice().inventory[index];
    const diag = item.diagnostics;
    if (!diag) return Swal.fire({ title: t('noDiag'), icon: 'warning' });

    document.getElementById('result-title').innerText = `✅ ${t('maintResult')}: ${item.assetTag}`;
    document.getElementById('result-subtitle').innerText = `${t(item.type)} - ${item.model}`;
    const prev = item.maintenanceResult || {};
    document.getElementById('result-status').value = prev.status || 'Pendiente';
    document.getElementById('result-date').value = prev.date || new Date().toISOString().split('T')[0];
    document.getElementById('result-notes-input').value = prev.techNotes || '';

    const container = document.getElementById('result-items-container');
    const allKeys = [...Object.keys(diag.hardware), ...Object.keys(diag.software)];
    const failedKeys = allKeys.filter(k => (diag.hardware[k] === false || diag.software[k] === false));

    if (failedKeys.length === 0) {
        container.innerHTML = `<p style="color:#059669;">${t('routineMaint')}</p>`;
    } else {
        const resPrev = prev.resolvedItems || {};
        container.innerHTML = failedKeys.map(k => `
$            <div style="display:flex; align-items:center; gap:0.6rem; padding:0.5rem; background:white; border-radius:8px; border:1px solid #f1f5f9;">
                <input type="checkbox" id="res-${k}" ${resPrev[k] ? 'checked' : ''}>
                <label for="res-${k}">${t(k)}</label>
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
    Swal.fire({ title: t('savedMsg'), icon: 'success', timer: 2000, showConfirmButton: false });
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

// ========== PDF HELPERS ==========

function generateDocRef() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `REF-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function drawPdfHeader(doc, title, color, o) {
    const pw = doc.internal.pageSize.getWidth();
    // Header bar
    doc.setFillColor(...color);
    doc.rect(0, 0, pw, 30, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 15, 13);
    // Doc ref in header
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${tPdf('pdfDocRef')}: ${generateDocRef()}`, 15, 22);
    doc.text(`${tPdf('pdfDate')}: ${o.auditDate || new Date().toLocaleDateString()}`, 15, 27);

    // Company info — left column
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${tPdf('companyLabel')}: ${o.company}`, 15, 38);
    doc.setFont("helvetica", "normal");
    doc.text(`${tPdf('deptLabel')}: ${o.depto || '-'}`, 15, 43);
    doc.text(`${tPdf('locationLabel')}: ${o.location || '-'}`, 15, 48);

    // Right column
    const rx = pw / 2 + 10;
    doc.setFont("helvetica", "bold");
    doc.text(`${tPdf('techAuditor')}: ${o.auditor}`, rx, 38);
    doc.setFont("helvetica", "normal");
    doc.text(`${tPdf('auditCompanyLabel')}: ${o.auditorCompany || '-'}`, rx, 43);
    doc.text(`${tPdf('managerLabel')}: ${o.manager || '-'} - ${o.managerTitle || ''}`, rx, 48);

    // Thin divider
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 52, pw - 15, 52);
    return 56;
}

function drawPdfDashboard(doc, stats, startY, color) {
    const pw = doc.internal.pageSize.getWidth();
    const boxW = (pw - 30 - (stats.length - 1) * 6) / stats.length;
    let x = 15;
    stats.forEach(s => {
        // Background
        doc.setFillColor(...(s.color || color), 0.12);
        doc.setFillColor(s.bgR || color[0], s.bgG || color[1], s.bgB || color[2]);
        doc.roundedRect(x, startY, boxW, 18, 3, 3, 'F');
        // Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(s.textR || 15, s.textG || 23, s.textB || 42);
        doc.text(String(s.value), x + boxW / 2, startY + 8, { align: 'center' });
        // Label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(s.label, x + boxW / 2, startY + 14, { align: 'center' });
        x += boxW + 6;
    });
    return startY + 24;
}

function drawPdfSignatures(doc, startY, o) {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    let y = startY;
    if (y + 70 > ph - 15) { doc.addPage(); y = 30; }

    y += 15;
    doc.setDrawColor(80, 80, 80);
    doc.setTextColor(40, 40, 40);

    // Auditor signature — left
    const sig1X = pw * 0.25;
    doc.line(sig1X - 45, y, sig1X + 45, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(o.auditor || '-', sig1X, y + 5, { align: 'center' });
    doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text(tPdf('pdfPerformedBy'), sig1X, y + 10, { align: 'center' });
    doc.text(tPdf('pdfAuditorSign'), sig1X, y + 14, { align: 'center' });

    // Client/Manager signature — right
    const sig2X = pw * 0.75;
    doc.line(sig2X - 45, y, sig2X + 45, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(`${o.manager || '-'}`, sig2X, y + 5, { align: 'center' });
    doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    doc.text(o.managerTitle || '', sig2X, y + 10, { align: 'center' });
    doc.text(tPdf('pdfApprovedBy') + ' - ' + tPdf('pdfClientSign'), sig2X, y + 14, { align: 'center' });

    // Company seal — centered below
    const sealY = y + 30;
    const sealX = pw / 2;
    doc.setDrawColor(160, 160, 160);
    doc.setLineDashPattern([2, 2], 0);
    doc.circle(sealX, sealY, 16);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(tPdf('pdfCompanySeal'), sealX, sealY + 1, { align: 'center' });
}

function addPdfPageNumbers(doc) {
    const totalPages = doc.internal.getNumberOfPages();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text(tPdf('pdfGeneratedBy'), 15, ph - 7);
        doc.text(tPdf('pdfConfidential'), pw / 2, ph - 7, { align: 'center' });
        doc.text(`${tPdf('pdfPage')} ${i} ${tPdf('pdfOf')} ${totalPages}`, pw - 15, ph - 7, { align: 'right' });
    }
}

function getStatusColor(status) {
    if (status === 'Activo') return [16, 185, 129];
    if (status === 'Stock') return [59, 130, 246];
    if (status === 'Reparaci\u00f3n') return [245, 158, 11];
    if (status === 'Baja') return [239, 68, 68];
    if (status === 'Completado') return [16, 185, 129];
    if (status === 'Parcial') return [245, 158, 11];
    if (status === 'Pendiente') return [239, 68, 68];
    return [100, 116, 139];
}

// ========== 1. INVENTORY PDF ==========

function exportToPDF() {
    const o = getActiveOffice(); if (!o || !o.inventory.length || !window.jspdf) return;
    const { jsPDF } = window.jspdf; const doc = new jsPDF('l', 'mm', 'a4');

    let y = drawPdfHeader(doc, tPdf('pdfInventoryTitle'), [79, 70, 229], o);

    // Dashboard
    const active = o.inventory.filter(i => i.status === 'Activo').length;
    const stock = o.inventory.filter(i => i.status === 'Stock').length;
    const repair = o.inventory.filter(i => i.status === 'Reparaci\u00f3n').length;
    const decom = o.inventory.filter(i => i.status === 'Baja').length;
    y = drawPdfDashboard(doc, [
        { value: o.inventory.length, label: tPdf('pdfTotalItems'), bgR: 241, bgG: 245, bgB: 249 },
        { value: active, label: tPdf('Activo'), bgR: 209, bgG: 250, bgB: 229, textR: 5, textG: 150, textB: 105 },
        { value: stock, label: tPdf('Stock'), bgR: 219, bgG: 234, bgB: 254, textR: 37, textG: 99, textB: 235 },
        { value: repair, label: tPdf('Reparaci\u00f3n'), bgR: 254, bgG: 243, bgB: 199, textR: 217, textG: 119, textB: 6 },
        { value: decom, label: tPdf('Baja'), bgR: 254, bgG: 226, bgB: 226, textR: 220, textG: 38, textB: 38 }
    ], y, [79, 70, 229]);

    doc.autoTable({
        head: [[tPdf('assetTagLabel'), tPdf('pdfCategory'), tPdf('pdfModel'), 'S/N', tPdf('pdfStatus'), tPdf('pdfUser'), tPdf('techSpecs')]],
        body: o.inventory.map(i => [
            i.assetTag, tPdf(i.typeValue || i.type), i.model, i.serial,
            tPdf(i.status), i.user, i.baseNotes || i.notes || '-'
        ]),
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 8, textColor: 255 },
        bodyStyles: { fontSize: 7.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { bottom: 30, left: 15, right: 15 },
        styles: { cellPadding: 2.5, overflow: 'linebreak' },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 4) {
                const raw = data.row.raw[4];
                const sc = getStatusColor(o.inventory[data.row.index] ? o.inventory[data.row.index].status : '');
                data.cell.styles.textColor = sc;
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    drawPdfSignatures(doc, doc.lastAutoTable.finalY + 15, o);
    addPdfPageNumbers(doc);
    doc.save(`Inventario_${o.company}.pdf`);
}

// ========== 2. INDIVIDUAL MAINTENANCE PLAN PDF ==========

async function generateMaintenancePlanPDF(idx) {
    const o = getActiveOffice();
    const item = o.inventory[idx]; const d = item.diagnostics; if (!d) return;
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');

    let y = drawPdfHeader(doc, tPdf('pdfMaintenancePlan'), [79, 70, 229], o);

    // Asset detail box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 20, 3, 3, 'F');
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(15, 23, 42);
    doc.text(`${tPdf('assetTagLabel')}: ${item.assetTag}`, 20, y + 7);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(`${tPdf('pdfCategory')}: ${tPdf(item.typeValue || item.type)}  |  ${tPdf('pdfModel')}: ${item.model}  |  S/N: ${item.serial}`, 20, y + 13);
    doc.text(`${tPdf('pdfUser')}: ${item.user}`, 20, y + 18);
    y += 26;

    // Dashboard
    const hwFail = Object.values(d.hardware).filter(v => v === false).length;
    const swFail = Object.values(d.software).filter(v => v === false).length;
    const totalChecks = Object.keys(d.hardware).length + Object.keys(d.software).length;
    const totalFail = hwFail + swFail;
    const totalOk = totalChecks - totalFail;
    y = drawPdfDashboard(doc, [
        { value: totalChecks, label: tPdf('pdfTotalItems'), bgR: 241, bgG: 245, bgB: 249 },
        { value: totalOk, label: 'OK', bgR: 209, bgG: 250, bgB: 229, textR: 5, textG: 150, textB: 105 },
        { value: totalFail, label: tPdf('pdfFailed'), bgR: 254, bgG: 226, bgB: 226, textR: 220, textG: 38, textB: 38 }
    ], y, [79, 70, 229]);

    // Diagnostic table
    const rows = [];
    Object.keys(d.hardware).forEach(k => rows.push([tPdf(k), 'Hardware', d.hardware[k] ? 'OK' : 'FAIL']));
    Object.keys(d.software).forEach(k => rows.push([tPdf(k), 'Software', d.software[k] ? 'OK' : 'FAIL']));

    doc.autoTable({
        head: [[tPdf('pdfComponent'), tPdf('pdfType'), tPdf('pdfStatus')]],
        body: rows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 15, right: 15, bottom: 30 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                data.cell.styles.textColor = data.cell.raw === 'OK' ? [16, 185, 129] : [239, 68, 68];
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    // Sub-items detail if available
    if (d.subItems) {
        let subY = doc.lastAutoTable.finalY + 6;
        const subRows = [];
        Object.keys(d.subItems).forEach(parentKey => {
            const subs = d.subItems[parentKey];
            Object.keys(subs).forEach(subKey => {
                subRows.push([tPdf(parentKey), subKey, subs[subKey] ? 'OK' : 'FAIL']);
            });
        });
        if (subRows.length > 0) {
            doc.autoTable({
                head: [[tPdf('pdfComponent'), 'Sub-item', tPdf('pdfStatus')]],
                body: subRows,
                startY: subY,
                theme: 'grid',
                headStyles: { fillColor: [100, 116, 139], fontSize: 8 },
                bodyStyles: { fontSize: 7.5 },
                margin: { left: 15, right: 15, bottom: 30 },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 2) {
                        data.cell.styles.textColor = data.cell.raw === 'OK' ? [16, 185, 129] : [239, 68, 68];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });
        }
    }

    // Observations
    if (d.notes) {
        let notesY = doc.lastAutoTable.finalY + 8;
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(15, 23, 42);
        doc.text(tPdf('observations'), 15, notesY);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        doc.text(d.notes, 15, notesY + 6, { maxWidth: 180 });
    }

    drawPdfSignatures(doc, doc.lastAutoTable.finalY + 20, o);
    addPdfPageNumbers(doc);
    doc.save(`Plan_${item.assetTag}.pdf`);
}

// ========== 3. MASTER MAINTENANCE PLAN PDF ==========

async function generateMasterMaintenancePlanPDF() {
    const o = getActiveOffice(); if (!o) return;
    const items = o.inventory.filter(i => i.status === 'Reparaci\u00f3n' || (i.diagnostics && (Object.values(i.diagnostics.hardware).includes(false) || Object.values(i.diagnostics.software).includes(false))));
    if (!items.length) return Swal.fire(tPdf('pdfPendingItems'), '', 'info');
    const { jsPDF } = window.jspdf; const doc = new jsPDF('l', 'mm', 'a4');

    let y = drawPdfHeader(doc, tPdf('pdfMasterPlanTitle'), [5, 150, 105], o);

    // Dashboard
    y = drawPdfDashboard(doc, [
        { value: items.length, label: tPdf('pdfTotalItems'), bgR: 241, bgG: 245, bgB: 249 },
        { value: items.filter(i => i.status === 'Reparaci\u00f3n').length, label: tPdf('Reparaci\u00f3n'), bgR: 254, bgG: 243, bgB: 199, textR: 217, textG: 119, textB: 6 }
    ], y, [5, 150, 105]);

    // Build rows with priority and failed components
    const body = items.map(i => {
        let failedComps = [];
        if (i.diagnostics) {
            Object.keys(i.diagnostics.hardware).forEach(k => { if (!i.diagnostics.hardware[k]) failedComps.push(tPdf(k)); });
            Object.keys(i.diagnostics.software).forEach(k => { if (!i.diagnostics.software[k]) failedComps.push(tPdf(k)); });
        }
        const priority = failedComps.length >= 4 ? tPdf('pdfHigh') : failedComps.length >= 2 ? tPdf('pdfMedium') : tPdf('pdfLow');
        return [i.assetTag, tPdf(i.typeValue || i.type), i.model, i.user, failedComps.join(', ') || '-', priority, tPdf(i.status)];
    });

    doc.autoTable({
        head: [['ID', tPdf('pdfCategory'), tPdf('pdfModel'), tPdf('pdfUser'), tPdf('pdfFailedComponents'), tPdf('pdfPriority'), tPdf('pdfStatus')]],
        body: body,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105], fontSize: 7.5, textColor: 255 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { bottom: 30, left: 15, right: 15 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw;
                if (val === tPdf('pdfHigh')) { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
                else if (val === tPdf('pdfMedium')) { data.cell.styles.textColor = [217, 119, 6]; data.cell.styles.fontStyle = 'bold'; }
                else { data.cell.styles.textColor = [16, 185, 129]; }
            }
        }
    });

    drawPdfSignatures(doc, doc.lastAutoTable.finalY + 15, o);
    addPdfPageNumbers(doc);
    doc.save(`PlanMaestro_${o.company}.pdf`);
}

// ========== 4. RESULTS REPORT PDF ==========

async function generateResultsReportPDF() {
    const o = getActiveOffice(); const items = o.inventory.filter(i => i.maintenanceResult);
    if (!items.length) return Swal.fire(tPdf('pdfResultsTitle'), '', 'info');
    const { jsPDF } = window.jspdf; const doc = new jsPDF('p', 'mm', 'a4');

    let y = drawPdfHeader(doc, tPdf('pdfResultsTitle'), [5, 150, 105], o);

    // Dashboard
    const completed = items.filter(i => i.maintenanceResult.status === 'Completado').length;
    const partial = items.filter(i => i.maintenanceResult.status === 'Parcial').length;
    const pending = items.filter(i => i.maintenanceResult.status === 'Pendiente').length;
    const rate = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
    y = drawPdfDashboard(doc, [
        { value: items.length, label: tPdf('pdfTotalItems'), bgR: 241, bgG: 245, bgB: 249 },
        { value: completed, label: tPdf('Completado'), bgR: 209, bgG: 250, bgB: 229, textR: 5, textG: 150, textB: 105 },
        { value: partial, label: tPdf('Parcial'), bgR: 254, bgG: 243, bgB: 199, textR: 217, textG: 119, textB: 6 },
        { value: pending, label: tPdf('Pendiente'), bgR: 254, bgG: 226, bgB: 226, textR: 220, textG: 38, textB: 38 },
        { value: rate + '%', label: tPdf('pdfCompletionRate'), bgR: 224, bgG: 231, bgB: 255, textR: 79, textG: 70, textB: 229 }
    ], y, [5, 150, 105]);

    // Per-equipment detail
    items.forEach((item, idx) => {
        const mr = item.maintenanceResult;
        const diag = item.diagnostics;

        // Section header
        if (y > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = 20; }
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 14, 2, 2, 'F');
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
        doc.text(`${item.assetTag} - ${tPdf(item.typeValue || item.type)} - ${item.model}`, 20, y + 5);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.text(`${tPdf('pdfUser')}: ${item.user}  |  ${tPdf('pdfDate')}: ${mr.date}  |  ${tPdf('pdfStatus')}: ${tPdf(mr.status)}`, 20, y + 11);
        const sc = getStatusColor(mr.status);
        doc.setTextColor(...sc);
        doc.text(tPdf(mr.status), 170, y + 5);
        y += 18;

        // Fault resolution table
        if (diag && mr.resolvedItems) {
            const allKeys = [...Object.keys(diag.hardware), ...Object.keys(diag.software)];
            const faultKeys = allKeys.filter(k => diag.hardware[k] === false || diag.software[k] === false);
            if (faultKeys.length > 0) {
                const faultRows = faultKeys.map(k => [
                    tPdf(k),
                    diag.hardware[k] !== undefined ? 'Hardware' : 'Software',
                    mr.resolvedItems[k] ? tPdf('pdfResolved') : tPdf('pdfPending')
                ]);
                doc.autoTable({
                    head: [[tPdf('pdfComponent'), tPdf('pdfType'), tPdf('pdfStatus')]],
                    body: faultRows,
                    startY: y,
                    theme: 'grid',
                    headStyles: { fillColor: [100, 116, 139], fontSize: 8, textColor: 255 },
                    bodyStyles: { fontSize: 7.5 },
                    margin: { left: 20, right: 20, bottom: 30 },
                    tableWidth: 170,
                    didParseCell: (data) => {
                        if (data.section === 'body' && data.column.index === 2) {
                            data.cell.styles.textColor = data.cell.raw === tPdf('pdfResolved') ? [16, 185, 129] : [239, 68, 68];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                });
                y = doc.lastAutoTable.finalY + 4;
            }
        }

        // Tech notes
        if (mr.techNotes) {
            doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
            doc.text(`${tPdf('pdfNotes')}: ${mr.techNotes}`, 20, y + 2, { maxWidth: 170 });
            y += 10;
        }
        y += 4;
    });

    drawPdfSignatures(doc, y + 10, o);
    addPdfPageNumbers(doc);
    doc.save(`Resultados_${o.company}.pdf`);
}

// =============== INICIALIZACIÓN ===============

function handleNetworkStatus() {
    const btn = document.getElementById('pdfBtn');
    if (btn) {
        btn.disabled = !navigator.onLine;
        btn.innerHTML = navigator.onLine ? `📄 ${t('generatePDF')}` : `❌ ${t('noConnection')}`;
    }
}

window.addEventListener('online', handleNetworkStatus);
window.addEventListener('offline', handleNetworkStatus);
window.addEventListener('load', () => {
    const s = document.getElementById('splash-screen');
    if (s) setTimeout(() => { s.classList.add('splash-hidden'); setTimeout(() => s.remove(), 500); }, 600);
});

handleNetworkStatus();
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    renderOfficesTable();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Notify user or auto-reload
                        console.log('New content is available; please refresh.');
                        // Automatic reload to ensure the latest version is used
                        window.location.reload();
                    }
                });
            });
        }).catch(err => console.log('SW failed', err));
    });

    // Handle controller change (e.g. when skipWaiting() was called)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
}
