import html2pdf from "html2pdf.js";

export const downloadResumePDF = (elementId, candidateName = "Candidate", targetRole = "Software_Developer") => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Resume preview element not found!");
    return;
  }

  const safeCandidate = candidateName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeRole = targetRole.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${safeCandidate}_${safeRole}_Resume.pdf`;

  const opt = {
    margin: [10, 10, 10, 10], // mm
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };

  html2pdf().set(opt).from(element).save();
};
