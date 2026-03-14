import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

export interface ExportData {
  universityName: string;
  department: string;
  courseCode: string;
  courseName: string;
  studentName: string;
  studentId: string;
  ctNumber: string;
  date: string;
  questionsHtml: string;
  answers?: any;
}

function getFormattedDateTime(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
}

function getLogoDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const logoEl = document.querySelector('img[alt="BAUST Logo"]') as HTMLImageElement;
    if (logoEl) {
      const canvas = document.createElement("canvas");
      canvas.width = 80;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;
      const tempImg = new window.Image();
      tempImg.crossOrigin = "anonymous";
      tempImg.onload = () => {
        ctx.drawImage(tempImg, 0, 0, 80, 80);
        resolve(canvas.toDataURL("image/png"));
      };
      tempImg.onerror = () => resolve("");
      tempImg.src = logoEl.src;
    } else {
      resolve("");
    }
  });
}

function buildExportHtml(data: ExportData, logoDataUrl?: string): string {
  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: contain; margin-right: 16px; border: 1px solid #e0e0e0;" />`
    : "";

  return `
    <div style="padding: 20px; border: 2px solid #e2e8f0; border-radius: 24px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 12px;">
          ${logoHtml}
          <div style="text-align: left;">
            <h1 style="font-size: 26px; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.025em;">${data.universityName}</h1>
            <p style="font-size: 16px; color: #64748b; font-weight: 600; margin: 2px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">${data.department}</p>
          </div>
        </div>
        <div style="height: 4px; width: 100px; background: #2563eb; margin: 20px auto; border-radius: 2px;"></div>
      </div>

      <div style="background: #f8fafc; border-radius: 20px; padding: 24px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 700; text-transform: uppercase; width: 120px; letter-spacing: 0.05em;">Course</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800;">${data.courseCode} — ${data.courseName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Student</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800;">${data.studentName} (${data.studentId})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Assessment</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800;">Class Test #${data.ctNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Date</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 800;">${data.date}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 0 10px;">
        <div style="font-family: 'Inter', sans-serif !important; font-size: 14px; line-height: 1.6; color: #1e293b !important;">
          ${data.questionsHtml}
        </div>
      </div>
      
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px dashed #e2e8f0; text-align: center;">
        <p style="font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Generated securely via BAUST Assessment Platform engine</p>
      </div>
    </div>
  `;
}

export async function exportToPDF(data: ExportData) {
  const logoDataUrl = await getLogoDataUrl();

  const container = document.createElement("div");
  container.className = "pdf-export-container";
  container.style.width = "794px";
  container.style.padding = "40px";
  container.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
  container.style.background = "white";
  container.style.color = "#1e293b";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.lineHeight = "1.5";
  (container.style as any).webkitFontSmoothing = "antialiased";

  container.innerHTML = buildExportHtml(data, logoDataUrl);

  // Style overrides for elements inside the PDF to prevent UI clutter
  const style = document.createElement('style');
  style.textContent = `
    .pdf-export-container * { box-sizing: border-box; }
    .pdf-export-container .badge { border-radius: 6px; padding: 2px 8px; font-size: 11px; }
    .pdf-export-container select { opacity: 0; } /* Keep for space but let replacement overlay or handle manually */
    .pdf-export-container button { 
      border-radius: 8px !important; 
      pointer-events: none !important;
      opacity: 1 !important;
      background-image: none !important;
    }
  `;
  container.appendChild(style);
  document.body.appendChild(container);

  // Wait for images to load
  const images = container.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );

  await new Promise((r) => setTimeout(r, 200));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.querySelector('.pdf-export-container') as HTMLElement;
        if (clonedContainer) {
          clonedContainer.style.height = 'auto';
          clonedContainer.style.position = 'relative';
          clonedContainer.style.left = '0';
        }

        // 1. Sync Select Values (Question 8)
        const originalSelects = document.querySelectorAll('select');
        const clonedSelects = clonedDoc.querySelectorAll('select');
        clonedSelects.forEach((select, i) => {
          const originalSelect = originalSelects[i] as HTMLSelectElement;
          if (!originalSelect) return;

          const text = originalSelect.options[originalSelect.selectedIndex]?.text || "Not selected";

          const replacement = clonedDoc.createElement('div');
          replacement.style.display = 'inline-block';
          replacement.style.padding = '8px 12px';
          replacement.style.border = '2px solid #2563eb'; // Deep blue rectangular border
          replacement.style.borderRadius = '6px';
          replacement.style.minWidth = '140px';
          replacement.style.fontSize = '13px';
          replacement.style.backgroundColor = '#f0f7ff';
          replacement.style.color = '#1e293b';
          replacement.style.fontWeight = '700';
          replacement.textContent = text;

          if (select.parentNode) {
            select.parentNode.replaceChild(replacement, select);
          }
        });

        // 2. Mark Selected Buttons (MCQs, Grid, etc.)
        const buttons = clonedDoc.querySelectorAll('button');
        buttons.forEach(btn => {
          const isSelected = btn.classList.contains('bg-primary') ||
            btn.classList.contains('from-primary') ||
            btn.innerHTML.includes('CheckCircle2') ||
            btn.querySelector('.text-primary-foreground');

          if (isSelected) {
            btn.style.border = '3px solid #000000'; // Pure black rectangular border
            btn.style.backgroundColor = '#f1f5f9'; // Light gray to show contrast
            btn.style.color = '#000000';
            btn.style.fontWeight = '900';
            btn.style.opacity = '1';
          } else {
            btn.style.border = '1px solid #e2e8f0';
            btn.style.opacity = '0.7'; // Fade out unselected
            btn.style.backgroundColor = 'transparent';
          }
        });

        // 3. Mark True/False Boxes
        const tfItems = clonedDoc.querySelectorAll('div[class*="grid-cols-[1fr_80px_80px]"]');
        tfItems.forEach(row => {
          const btns = row.querySelectorAll('button');
          btns.forEach(btn => {
            if (btn.classList.contains('bg-gradient-to-br')) {
              btn.style.border = '3px solid #000000';
              btn.style.fontWeight = '900';
            }
          });
        });

        // Hide any elements that shouldn't be in PDF
        const toHide = clonedDoc.querySelectorAll('[data-html2canvas-ignore]');
        toHide.forEach(el => (el as HTMLElement).style.display = 'none');
      }
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Remaining pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // Corrected positioning
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const filename = `${data.studentId}_${data.studentName}_${data.courseCode}${data.ctNumber}_${getFormattedDateTime()}`;
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

export function exportToJSON(data: ExportData) {
  const jsonData = JSON.stringify({
    metadata: {
      university: data.universityName,
      department: data.department,
      courseCode: data.courseCode,
      courseName: data.courseName,
      studentName: data.studentName,
      studentId: data.studentId,
      ctNumber: data.ctNumber,
      date: data.date,
      exportedAt: new Date().toISOString()
    },
    answers: data.answers
  }, null, 2);

  const blob = new Blob([jsonData], { type: "application/json" });
  const filename = `${data.studentId}_${data.studentName}_${data.courseCode}${data.ctNumber}_${getFormattedDateTime()}`;
  saveAs(blob, `${filename}.json`);
}
