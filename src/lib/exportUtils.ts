import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportData {
  universityName: string;
  department: string;
  courseCode: string;
  courseName: string;
  studentName: string;
  studentId: string;
  ctNumber: string;
  date: string;
  questionsHtml: string;
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
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
        ${logoHtml}
        <div>
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 4px 0;">${data.universityName}</h1>
          <p style="font-size: 16px; color: #555; margin: 0;">${data.department}</p>
        </div>
      </div>
    </div>
    <hr style="border: none; border-top: 2px solid #2563eb; margin: 16px 0;" />
    <table style="width: 100%; font-size: 14px; margin-bottom: 24px; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; font-weight: 600; width: 140px;">Course Code:</td><td style="padding: 6px 0;">${data.courseCode}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Course Name:</td><td style="padding: 6px 0;">${data.courseName}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Student Name:</td><td style="padding: 6px 0;">${data.studentName}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Student ID:</td><td style="padding: 6px 0;">${data.studentId}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Assessment No:</td><td style="padding: 6px 0;">${data.ctNumber}</td></tr>
      <tr><td style="padding: 6px 0; font-weight: 600;">Date:</td><td style="padding: 6px 0;">${data.date}</td></tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 16px 0;" />
    <div style="font-size: 14px; line-height: 1.7;">
      ${data.questionsHtml}
    </div>
  `;
}

export async function exportToPDF(data: ExportData) {
  const logoDataUrl = await getLogoDataUrl();

  const container = document.createElement("div");
  container.className = "pdf-export-container";
  container.style.width = "794px";
  container.style.padding = "40px";
  container.style.fontFamily = "Inter, Arial, sans-serif";
  container.style.background = "white";
  container.style.color = "#1a1a2e";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";

  container.innerHTML = buildExportHtml(data, logoDataUrl);
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

  // Small delay for rendering
  await new Promise((r) => setTimeout(r, 100));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${data.studentId}_${data.studentName}_${data.courseCode}${data.ctNumber}_${getFormattedDateTime()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
