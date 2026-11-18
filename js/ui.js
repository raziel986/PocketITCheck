/**
 * ui.js - PocketITCheck UI & Interaction Module
 */

import { t } from './translations.js';

export function applyTranslations(currentLang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(currentLang, key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(currentLang, key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(currentLang, key);
    });

    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.checked = (currentLang === 'en');

    const labelEs = document.getElementById('lang-es');
    const labelEn = document.getElementById('lang-en');
    if (labelEs && labelEn) {
        labelEs.classList.toggle('active', currentLang === 'es');
        labelEn.classList.toggle('active', currentLang === 'en');
    }
}

/* New: Auto-adjust textarea height to content on mobile keyboards.
   Prevents the keyboard from pushing the form away and scrolling
   the viewport unexpectedly. */
export function autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(60, el.scrollHeight) + 'px';
}

/* New: Handle focus/blur events on mobile form fields to avoid the
   "focus scroll" problem on iOS where the viewport jumps when a
   fixed-position element (FAB or bottom nav) is near the keyboard. */
export function handleMobileFormScroll() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(el => {
        el.addEventListener('focus', () => {
            // Keep the FAB and bottom nav from hiding input below them
            el.style.setProperty('--fixed-nav-height', '64px', { priority: 'important' });
            el.style.setProperty('--fixed-fab-height', '56px', { priority: 'important' });
        });
        el.addEventListener('blur', () => {
            el.style.removeProperty('--fixed-nav-height');
            el.style.removeProperty('--fixed-fab-height');
        });
    });
}

/* New: Simple notification banner for long-running operations.
   Appears above the bottom nav and auto-hides after a timeout. */
export function showStatusBanner(message, type = 'info', timeout = 3000) {
    // Prevent multiple banners from stacking
    const existing = document.querySelector('.status-banner');
    if (existing) existing.remove();

    const bgColors = {
        info: 'rgba(53, 37, 205, 0.1)',
        success: 'rgba(16, 185, 129, 0.15)',
        error: 'rgba(239, 68, 68, 0.15)'
    };
    const icons = {
        info: 'ℹ️',
        success: '✅',
        error: '❌'
    };

    const banner = document.createElement('div');
    banner.className = 'status-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 64px;
        left: 0;
        right: 0;
        padding: 0.75rem 1rem;
        background: ${bgColors[type] || bgColors.info};
        color: var(--on-surface);
        font-size: 0.85rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        z-index: 105;
        max-width: 100%;
        box-sizing: border-box;
        backdrop-filter: blur(4px);
    `;
    banner.innerHTML = `
        <span style="flex: 1;">${icons[type] || 'ℹ️'} ${message}</span>
        <button class="btn-clear btn-xs" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: transparent; border: none; color: currentColor;"
                onclick="this.parentElement.remove()">✕</button>
    `;

    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), timeout);
    return banner;
}

/* New: Safe fetch with error handling for async operations */
export async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Safe fetch error:', error);
        showStatusBanner(error.message || 'Error en la operación', 'error', 5000);
        throw error;
    }
}

/* New: Validation Logic for Integrity and Final Checklist */
export function checkProceduralIntegrity(item) {
    const diagObj = item.diagnostics || {};
    const result = item.maintenanceResult || { resolvedItems: [] };
    const unresolvedIssues = [];

    DIAG_STRUCTURE.forEach(cat => {
        cat.groups.forEach(group => {
            group.items.forEach(it => {
                if ((diagObj[cat.category] || {})[it.id] === false) {
                    if (!result.resolvedItems.includes(`${cat.category}:${it.id}`)) {
                        unresolvedIssues.push(t('es', it.label));
                    }
                }
            });
        });
    });
    return unresolvedIssues;
}

export function showFinalChecklist(onConfirm) {
    Swal.fire({
        title: '🔒 Checklist de Cierre',
        html: `
            <div style="text-align: left; font-size: 0.9rem;">
                <label style="display:block; margin: 10px 0;"><input type="checkbox" id="check1"> ¿Se realizó limpieza física?</label>
                <label style="display:block; margin: 10px 0;"><input type="checkbox" id="check2"> ¿Equipo enciende correctamente?</label>
                <label style="display:block; margin: 10px 0;"><input type="checkbox" id="check3"> ¿Reporte validado por cliente?</label>
            </div>
        `,
        confirmButtonText: 'Generar Informe',
        preConfirm: () => {
            if (!document.getElementById('check1').checked || !document.getElementById('check2').checked || !document.getElementById('check3').checked) {
                Swal.showValidationMessage('Debes completar todo el checklist para cerrar el servicio.');
            }
        }
    }).then((result) => {
        if (result.isConfirmed) onConfirm();
    });
}

/* New: Show error summary for form validation */
export function showErrorSummary(errors, containerSelector = '#officeForm') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const existing = container.querySelector('.error-summary');
    if (existing) existing.remove();

    const errorSummary = document.createElement('div');
    errorSummary.className = 'error-summary';
    errorSummary.style.cssText = `
        background: #fef2f2;
        border: 1px solid #fecaca;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        color: #991b1b;
        font-size: 0.875rem;
    `;
    errorSummary.innerHTML = `
        <p style="margin: 0 0 0.5rem 0; font-weight: 500;">Por favor corrige los siguientes errores:</p>
        <ul style="margin: 0; padding-left: 1rem;">
            ${errors.map(error => `<li style="margin: 0.25rem 0;">${error}</li>`).join('')}
        </ul>
    `;

    container.insertBefore(errorSummary, container.firstChild);
}

export function updatePagination(tableType, totalItems, containerId, state, currentLang, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (state.itemsPerPage === Infinity || totalItems <= state.itemsPerPage) return;

    const totalPages = Math.ceil(totalItems / state.itemsPerPage);
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn'; prevBtn.innerHTML = '‹';
    prevBtn.disabled = (state.currentPage === 1);
    prevBtn.onclick = () => onPageChange(state.currentPage - 1);
    container.appendChild(prevBtn);

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `${t(currentLang, 'pageLabel')} ${state.currentPage} / ${totalPages}`;
    container.appendChild(info);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn'; nextBtn.innerHTML = '›';
    nextBtn.disabled = (state.currentPage === totalPages);
    nextBtn.onclick = () => onPageChange(state.currentPage + 1);
    container.appendChild(nextBtn);
}

export const categoryFields = {
    "Laptop": [
        { id: "dyn_os", i18nKey: "os", type: "text", placeholder: "Ej: Windows 11 Pro" },
        { id: "dyn_cpu", i18nKey: "cpu", type: "text", placeholder: "Ej: Intel i5-1135G7" },
        { id: "dyn_ram", i18nKey: "ram", type: "text", placeholder: "Ej: 16GB DDR4" },
        { id: "dyn_storage", i18nKey: "storage", type: "text", placeholder: "Ej: 512GB NVMe SSD" },
        { id: "dyn_gpu", i18nKey: "gpu", type: "text", placeholder: "Ej: Intel Iris Xe" },
        { id: "dyn_screen", i18nKey: "screen", type: "text", placeholder: "Ej: 14\" FHD IPS" },
        { id: "dyn_mac", i18nKey: "mac", type: "text", placeholder: "Ej: 00:1A:2B:3C:4D:5E" }
    ],
    "Desktop": [
        { id: "dyn_os", i18nKey: "os", type: "text", placeholder: "Ej: Windows 10 Pro" },
        { id: "dyn_cpu", i18nKey: "cpu", type: "text", placeholder: "Ej: Intel i7-10700" },
        { id: "dyn_ram", i18nKey: "ram", type: "text", placeholder: "Ej: 32GB" },
        { id: "dyn_gpu", i18nKey: "gpu", type: "text", placeholder: "Ej: NVIDIA RTX 3060" },
        { id: "dyn_storage", i18nKey: "storage", type: "text", placeholder: "Ej: 1TB SSD + 2TB HDD" },
        { id: "dyn_mac", i18nKey: "mac", type: "text", placeholder: "Ej: A1:B2:C3:D4:E5:F6" }
    ],
    "Monitor": [
        { id: "dyn_size", i18nKey: "size", type: "text", placeholder: "Ej: 27\"" },
        { id: "dyn_res", i18nKey: "res", type: "text", placeholder: "Ej: 2560x1440 (2K)" },
        { id: "dyn_panel", i18nKey: "panel", type: "text", placeholder: "Ej: IPS / VA / TN" },
        { id: "dyn_conn", i18nKey: "conn", type: "text", placeholder: "Ej: HDMI, DisplayPort" }
    ],
    "Periferico": [
        { id: "dyn_type", i18nKey: "type", type: "text", placeholder: "Ej: Teclado Mecanico / Mouse" },
        { id: "dyn_conn", i18nKey: "conn", type: "text", placeholder: "Ej: USB / Inalambrico" }
    ],
    "Impresora": [
        { id: "dyn_type", i18nKey: "type", type: "text", placeholder: "Ej: Laser / Inyeccion" },
        { id: "dyn_toner", i18nKey: "toner", type: "text", placeholder: "Ej: HP 85A / Canon G3100" },
        { id: "dyn_ip", i18nKey: "ip", type: "text", placeholder: "Ej: 192.168.1.50" },
        { id: "dyn_mac", i18nKey: "mac", type: "text", placeholder: "Ej: 00:1A:..." }
    ],
    "Red": [
        { id: "dyn_role", i18nKey: "role", type: "text", placeholder: "Ej: Switch PoE / Router" },
        { id: "dyn_ip", i18nKey: "ip", type: "text", placeholder: "Ej: 10.0.0.1" },
        { id: "dyn_firm", i18nKey: "firm", type: "text", placeholder: "Ej: Cisco IOS 15.x" },
        { id: "dyn_ports", i18nKey: "ports", type: "number", placeholder: "Ej: 24 / 48" }
    ]
};

// New: System info collection
export async function collectSystemInfo() {
    const info = {
        os: '',
        cpu: '',
        ram: '',
        storage: '',
        gpu: '',
        macAddress: ''
    };

    // Operating System
    if (navigator.userAgentData) {
        try {
            info.os = navigator.userAgentData.platform || '';
        } catch (e) {}
    }
    if (!info.os) {
        // Fallback: simple UA detection
        const ua = navigator.userAgent;
        if (ua.includes('Win')) info.os = 'Windows';
        else if (ua.includes('Mac')) info.os = 'macOS';
        else if (ua.includes('Linux')) info.os = 'Linux';
        else if (ua.includes('Android')) info.os = 'Android';
        else if (ua.includes('iOS')) info.os = 'iOS';
    }

    // CPU - try to get architecture
    try {
        info.cpu = (navigator.architecture || '').replace('bits', '') || '';
    } catch (e) {}

    // RAM - estimate from various sources
    try {
        if (navigator.deviceMemory) {
            info.ram = `${navigator.deviceMemory}GB`;
        } else if (navigator.hardwareConcurrency) {
            const hwThreads = navigator.hardwareConcurrency;
            // Rough estimation
            info.ram = `${Math.round(hwThreads / 2)}GB (est.)`;
        }
    } catch (e) {}

    // Storage - try eMulated Storage API or basic info
    try {
        // Check for storage estimates
        if (navigator.storage && navigator.storage.estimate) {
            const estimate = await navigator.storage.estimate();
            if (estimate.quota && estimate.usage) {
                info.storage = `${Math.round(estimate.usage / (1024 * 1024 * 1024))}GB of ${Math.round(estimate.quota / (1024 * 1024 * 1024))}GB`;
            }
        }
    } catch (e) {}

    // GPU (basic)
    try {
        if (navigator.gpu) {
            const gpuInfo = await navigator.gpu.requestAdapter();
            if (gpuInfo) {
                info.gpu = gpuInfo?.name || 'GPU detected';
            }
        }
    } catch (e) {}

    // MAC Address (basic - doesn't work for all due to privacy, but we can get interface info)
    try {
        // This is limited due to privacy, but we can note the interface type
        info.macAddress = 'Consultar administrador';
    } catch (e) {}

    return info;
}

// New: Camera capture for equipment documentation
export async function captureEquipmentPhoto() {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: ' Cámara no disponible',
                text: 'Tu navegador no soporta acceso a la cámara. Usa un dispositivo con cámara o ingresa los datos manualmente.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
        }
        return null;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Try back camera on mobile
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });

        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.onloadeddata = () => {
                // Set video element to display
                video.play();

                // Create canvas and capture
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                // Convert to data URL
                const dataURL = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataURL);
            };

            video.onerror = () => {
                stream.getTracks().forEach(track => track.stop());
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Error de Cámara',
                        text: 'No se pudo acceder a la cámara. Por favor, verifica los permisos.',
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                }
                resolve(null);
            };
        });
    } catch (err) {
        console.error('Camera access error:', err);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Error de Cámara',
                text: err.message || 'No se pudo acceder a la cámara',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        }
        return null;
    }
}

// New: Automated diagnostic modes and warranty tracking
export const diagnosticModes = {
    quick: 'Quick Test',
    standard: 'Standard Diagnostic',
    comprehensive: 'Comprehensive Test',

    // Run quick diagnostic based on category
    async runQuickDiagnostic(category) {
        const results = {};
        switch (category) {
            case 'power':
                results.cables = await this.testCables();
                results.battery = await this.testBatteryHealth();
                break;
            case 'storage':
                results.smart = await this.testSMART();
                results.speed = await this.testDiskSpeed();
                break;
            case 'ram':
                results.test = await this.testRAM();
                break;
            case 'temp':
                results.paste = await this.testThermal();
                results.fan = await this.testFans();
                break;
        }
        return results;
    },

    // Basic tests (these are stubs - integrate with real system tools later)
    async testCables() { return Math.random() > 0.3; },
    async testBatteryHealth() { return Math.random() > 0.3; },
    async testSMART() { return Math.random() > 0.3; },
    async testDiskSpeed() { return Math.random() > 0.3; },
    async testRAM() { return Math.random() > 0.3; },
    async testThermal() { return Math.random() > 0.3; },
    async testFans() { return Math.random() > 0.3; },

    // Warranty tracking
    checkWarrantyStatus(purchaseDate, warrantyDate) {
        if (!purchaseDate || !warrantyDate) return { status: 'unknown', daysRemaining: null };

        const purchase = new Date(purchaseDate);
        const warrantyEnd = new Date(warrantyDate);
        const today = new Date();
        const diffTime = warrantyEnd - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return {
                status: 'active',
                daysRemaining: diffDays,
                message: `${diffDays} días de garantía restantes`
            };
        } else if (diffDays > -30) {
            return {
                status: 'expiring_soon',
                daysRemaining: diffDays,
                message: `¡Garantía vencida o vence en ${Math.abs(diffDays)} días!`
            };
        } else {
            return {
                status: 'expired',
                daysRemaining: diffDays,
                message: 'Garantía vencida'
            };
        }
    }
};

// Add warranty status translations
export const warrantyStatusTranslations = {
    es: {
        active: 'Activa',
        expiring_soon: 'Vence pronto',
        expired: 'Vencida'
    },
    en: {
        active: 'Active',
        expiring_soon: 'Expiring soon',
        expired: 'Expired'
    }
};
