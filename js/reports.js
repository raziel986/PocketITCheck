/**
 * reports.js - PocketITCheck PDF Report Generation
 */

import { t, tPdf } from './translations.js';
import * as PDF from './pdf_engine.js';

const diagNameMap = {
    power: "Energía/Voltaje", storage: "Almacenamiento", ram: "Memoria RAM",
    temp: "Térmico/Fans", clean: "Limpieza Física",
    os: "Sistema Operativo", security: "Seguridad/Red",
    performance: "Rendimiento", license: "Cumplimiento IT"
};

export function generateInventoryPDF(o, currentLang) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const items = o.inventory;

    const stats = [
        `${tPdf(currentLang, 'pdfTotalItems')}: ${items.length}`,
        `${tPdf(currentLang, 'pdfSummaryActivos')}: ${items.filter(i => i.status === 'Activo').length} | ${tPdf(currentLang, 'pdfSummaryBaja')}: ${items.filter(i => i.status === 'Baja').length}`,
        `${tPdf(currentLang, 'pdfRepair')}: ${items.filter(i => i.status === 'Reparación').length}`
    ];

    let y = PDF.drawHeaderTypeB(doc, tPdf(currentLang, 'pdfInventoryTitle'), o, stats, currentLang);
    y = PDF.drawSubheader(doc, o, y + 5, currentLang);

    doc.autoTable({
        head: [['S/N', tPdf(currentLang, 'pdfCategory'), tPdf(currentLang, 'pdfModel'), tPdf(currentLang, 'pdfStatus'), tPdf(currentLang, 'pdfUser')]],
        body: items.map(i => [i.serial, tPdf(currentLang, i.type), i.model, tPdf(currentLang, i.status), i.user]),
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        margin: { left: 15, right: 15 }
    });

    PDF.drawModelSignatures(doc, doc.lastAutoTable.finalY + 15, o, currentLang);
    PDF.addModelPageNumbers(doc, currentLang);
    doc.save(`Inventario_${o.company}.pdf`);
}

export function generateMasterPlanPDF(o, currentLang) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    const items = o.inventory;

    const rightText = [
        `${tPdf(currentLang, 'pdfDateCol')}: ${o.auditDate || new Date().toLocaleDateString()}`,
        `${tPdf(currentLang, 'equips')}: ${items.length}`
    ];

    let y = PDF.drawHeaderTypeA(doc, tPdf(currentLang, 'pdfMasterPlanTitle'), [59, 130, 246], rightText, currentLang);
    y = PDF.drawSubheader(doc, o, y + 5, currentLang);

    doc.autoTable({
        head: [[tPdf(currentLang, 'assetTagLabel'), tPdf(currentLang, 'pdfModel'), tPdf(currentLang, 'pdfLocAssign'), tPdf(currentLang, 'pdfProbs'), tPdf(currentLang, 'pdfReqActions'), tPdf(currentLang, 'pdfEquipStatus')]],
        body: items.map(i => {
            let probs = [];
            let actions = [];
            if (i.diagnostics) {
                const allSections = { ...i.diagnostics.hardware, ...i.diagnostics.software };
                Object.keys(allSections).forEach(cat => {
                    const subs = allSections[cat];
                    const failed = Object.keys(subs).filter(k => subs[k] === false);
                    if (failed.length > 0) {
                        probs.push(`${tPdf(currentLang, 'pdfFaultIn')} ${tPdf(currentLang, cat)} (${failed.map(f => tPdf(currentLang, f)).join(', ')})`);
                        actions.push(tPdf(currentLang, 'act_' + cat) || '-');
                    }
                });
            }
            return [
                i.assetTag,
                `${tPdf(currentLang, i.type)}\n${i.model}`,
                `${o.location}\n${i.user}`,
                probs.join('\n') || 'OK',
                actions.join('\n') || '-',
                tPdf(currentLang, i.status)
            ];
        }),
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        columnStyles: { 3: { cellWidth: 45 }, 4: { cellWidth: 60 } }
    });

    PDF.drawModelSignatures(doc, doc.lastAutoTable.finalY + 15, o, currentLang);
    PDF.addModelPageNumbers(doc, currentLang);
    doc.save(`Plan_Maestro_${o.company}.pdf`);
}

export function generateResultsReportPDF(o, currentLang) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    const items = o.inventory.filter(i => i.maintenanceResult);
    if (!items.length) return Swal.fire(t(currentLang, 'noResults'), '', 'info');

    const rightText = [
        `${tPdf(currentLang, 'pdfDateCol')}: ${o.auditDate || new Date().toLocaleDateString()}`,
        `${tPdf(currentLang, 'pdfResolvedCount')}: ${items.length}`
    ];

    let y = PDF.drawHeaderTypeA(doc, tPdf(currentLang, 'pdfResultsTitle'), [5, 150, 105], rightText, currentLang);
    y = PDF.drawSubheader(doc, o, y + 5, currentLang);

    doc.autoTable({
        head: [['N°', tPdf(currentLang, 'assetTagLabel'), tPdf(currentLang, 'pdfOrigDiag'), tPdf(currentLang, 'pdfDoneActs'), tPdf(currentLang, 'pdfStatus'), tPdf(currentLang, 'pdfDate')]],
        body: items.map((i, index) => {
            const mr = i.maintenanceResult;
            let orig = [];
            let actions = [];
            if (i.diagnostics && mr.resolvedItems) {
                const allSections = { ...i.diagnostics.hardware, ...i.diagnostics.software };
                Object.keys(allSections).forEach(cat => {
                    const subs = allSections[cat];
                    Object.keys(subs).forEach(sub => {
                        if (subs[sub] === false) {
                            orig.push(`• ${tPdf(currentLang, sub)}`);
                            const status = mr.resolvedItems[sub] ? `[${tPdf(currentLang, 'pdfResolved')}]` : `[${tPdf(currentLang, 'pdfPending')}]`;
                            actions.push(`${status} ${tPdf(currentLang, sub)}`);
                        }
                    });
                });
            }
            if (mr.techNotes) actions.push(`[${tPdf(currentLang, 'pdfNotes')}]: ${mr.techNotes}`);
            return [
                index + 1,
                `${i.assetTag}\n${i.model}`,
                orig.join('\n') || 'OK',
                actions.join('\n') || '-',
                tPdf(currentLang, mr.status),
                mr.date
            ];
        }),
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [5, 150, 105] }
    });

    PDF.drawModelSignatures(doc, doc.lastAutoTable.finalY + 15, o, currentLang);
    PDF.addModelPageNumbers(doc, currentLang);
    doc.save(`Resultados_${o.company}.pdf`);
}
