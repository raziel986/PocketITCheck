/**
 * pdf_engine.js - PocketITCheck PDF Generation Module
 */

import { t, tPdf } from './translations.js';

export function getStatusColor(status) {
    if (status === 'Activo') return [16, 185, 129];
    if (status === 'Stock') return [59, 130, 246];
    if (status === 'Reparación') return [245, 158, 11];
    if (status === 'Baja') return [239, 68, 68];
    if (status === 'Completado') return [16, 185, 129];
    if (status === 'Parcial') return [245, 158, 11];
    if (status === 'Pendiente') return [239, 68, 68];
    return [100, 116, 139];
}

export function drawHeaderTypeA(doc, title, color, rightTextLines, currentLang, stats = null) {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(...color); doc.rect(0, 0, pw, 26, 'F');
    doc.setFillColor(4, 120, 87); doc.rect(0, 26, pw, 1.5, 'F');

    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text(title, 15, 16);

    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(167, 243, 208);
    const dateLine = rightTextLines.find(l => l.includes(':')) || "PocketITCheck \u2022 v1.0";
    doc.text(dateLine, 15, 22);

    if (stats) {
        const boxW = 85; const boxX = pw - boxW - 15; const boxY = 4;
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(boxX, boxY, boxW, 18, 1, 1, 'FD');
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(51, 65, 85);
        doc.text(stats[0], boxX + 4, boxY + 6);
        doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
        doc.text(stats[1], boxX + 4, boxY + 11);
        if (stats[2]) doc.text(stats[2], boxX + 4, boxY + 15);
    } else {
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
        let y = 14;
        rightTextLines.forEach((line, idx) => {
            if (idx > 0) { doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(230, 240, 235); }
            doc.text(line, pw - 15, y, { align: 'right' });
            y += 6;
        });
    }
    return 36;
}

export function drawHeaderTypeB(doc, title, o, statsTextLines, currentLang) {
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(5, 150, 105); doc.rect(0, 0, pw, 26, 'F');
    doc.setFillColor(4, 120, 87); doc.rect(0, 26, pw, 1.5, 'F');

    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text(title, 15, 16);
    doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(167, 243, 208);
    doc.text(`PocketITCheck \u2022 ${tPdf(currentLang, 'pdfDateCol')}: ${o.auditDate || new Date().toLocaleDateString()}`, 15, 22);

    const boxW = 85; const boxX = pw - boxW - 15; const boxY = 4;
    doc.setDrawColor(16, 185, 129); doc.setLineWidth(0.3);
    doc.setFillColor(4, 120, 87);
    doc.roundedRect(boxX, boxY, boxW, 18, 1.5, 1.5, 'FD');
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
    doc.text(statsTextLines[0], boxX + 4, boxY + 6);
    doc.setFont("helvetica", "normal"); doc.setTextColor(230, 240, 235);
    doc.text(statsTextLines[1], boxX + 4, boxY + 11);
    if (statsTextLines[2]) doc.text(statsTextLines[2], boxX + 4, boxY + 15);

    return 36;
}

export function drawSubheader(doc, o, startY, currentLang) {
    const pw = doc.internal.pageSize.getWidth();
    const boxHeight = 16;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, startY - 4, pw - 28, boxHeight, 2, 2, 'FD');

    const drawLine = (labelKey, value, x, y) => {
        const labelText = `${tPdf(currentLang, labelKey)}: `;
        doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(71, 85, 105);
        doc.text(labelText, x, y);
        const w = doc.getTextWidth(labelText);
        doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
        const splitValue = doc.splitTextToSize(value || '-', pw - x - w - 10);
        doc.text(splitValue, x + w + 1, y);
    };

    drawLine('pdfCompany', o.company, 18, startY + 1);
    drawLine('pdfLocation', o.location, 18, startY + 7);

    const col2 = pw * 0.36;
    drawLine('pdfDept', o.depto, col2, startY + 1);
    drawLine('pdfTechAuditor', o.auditor, col2, startY + 7);

    const col3 = pw * 0.68;
    drawLine('pdfManager', `${o.manager || '-'} (${o.managerTitle || ''})`, col3, startY + 4);

    return startY + boxHeight + 3;
}

export function drawModelSignatures(doc, startY, o, currentLang) {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    let y = startY;
    if (y + 50 > ph - 15) { doc.addPage(); y = 30; }

    y += 15;
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(130, 130, 130);
    doc.text(tPdf(currentLang, 'pdfCompanySeal'), pw / 2, y, { align: 'center' });

    y += 20;
    doc.setDrawColor(80, 80, 80); doc.setTextColor(15, 23, 42);

    const sig1X = pw * 0.25;
    doc.line(sig1X - 45, y, sig1X + 45, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(tPdf(currentLang, 'pdfAuditorSign'), sig1X, y + 5, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text(o.auditor || '-', sig1X, y + 10, { align: 'center' });
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text((o.auditorCompany || '').toUpperCase(), sig1X, y + 14, { align: 'center' });

    const sig2X = pw * 0.75;
    doc.setTextColor(15, 23, 42);
    doc.line(sig2X - 45, y, sig2X + 45, y);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text(tPdf(currentLang, 'pdfClientSign'), sig2X, y + 5, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.text((o.manager || '-').toUpperCase(), sig2X, y + 10, { align: 'center' });
    doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(100, 116, 139);
    doc.text((o.managerTitle || '').toUpperCase(), sig2X, y + 14, { align: 'center' });
}

export function addModelPageNumbers(doc, currentLang) {
    const totalPages = doc.internal.getNumberOfPages();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text(`${tPdf(currentLang, 'pdfGeneratedBy')} | https://raziel986.github.io/PocketITCheck/`, 15, ph - 7);
        doc.text(`${tPdf(currentLang, 'pdfPage')} ${i}`, pw - 15, ph - 7, { align: 'right' });
    }
}

/**
 * Adds an appendix page with the photos attached to each equipment item.
 * Returns the Y cursor on the last page used, or fallbackY when there are no
 * photos (so the caller can place signatures right after the inventory table).
 */
export function addPhotoEvidence(doc, items, currentLang, fallbackY = 0) {
    const photos = (items || []).filter(i =>
        i && typeof i.photo === 'string' && i.photo.startsWith('data:image/')
    );
    if (!photos.length) return fallbackY;

    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    doc.addPage();
    let y = drawHeaderTypeA(doc, tPdf(currentLang, 'pdfPhotoEvidence'), [5, 150, 105], [], currentLang);

    const cols = 3;
    const cellW = (pw - 30) / cols;
    const cellH = 54;
    const imgH = 42;
    let col = 0;

    photos.forEach(item => {
        if (y + cellH > ph - 18) {
            doc.addPage();
            y = 20;
            col = 0;
        }

        const x = 15 + col * cellW;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, cellW - 4, cellH, 1.5, 1.5, 'FD');

        try {
            const mime = item.photo.slice(5, item.photo.indexOf(';'));
            const format = mime.includes('png') ? 'PNG' : 'JPEG';
            doc.addImage(item.photo, format, x + 2, y + 2, cellW - 8, imgH, undefined, 'FAST');
        } catch (err) {
            console.warn('No se pudo incrustar la foto de', item.assetTag, err);
        }

        const caption = doc.splitTextToSize(item.assetTag || '-', cellW - 10)[0];
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        doc.text(caption, x + (cellW - 4) / 2, y + imgH + 8, { align: 'center' });

        col++;
        if (col >= cols) {
            col = 0;
            y += cellH + 4;
        }
    });

    return col === 0 ? y : y + cellH + 4;
}
