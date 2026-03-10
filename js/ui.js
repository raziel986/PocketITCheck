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
        { id: "dyn_mac", i18nKey: "mac", type: "text", placeholder: "Ej: A1:B2:..." }
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
