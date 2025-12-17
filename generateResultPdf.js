import PDFDocument from "pdfkit";
import path from "path";

export function generateResultPDF(res, result, students) {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 20, left: 20, right: 20, bottom: 20 },
  });

  doc.pipe(res);

  const pageWidth = 595;
  let y = 20;

  /* ================= LOGOS ================= */
  const logo = path.join(process.cwd(), "logo.png");
  doc.image(logo, 25, 15, { width: 50, height: 38 });
  doc.image(logo, 558 - 35, 15, { width: 50, height: 38 });

  /* ================= TITLE ================= */
  doc
    .font("Helvetica-Bold")
    .fontSize(35)
    .fillColor(161, 11, 0)
    .text("ISM Education", 0, y, { align: "center" });

  y += 30;

  doc
    .fontSize(14)
    .fillColor(0, 0, 0)
    .text("An ISO 9001:2015 Certified Institution", 0, y, {
      align: "center",
    });

  y += 25;

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .text(
      `EXAM TEST RESULT OF ${result.book.toUpperCase()}`,
      0,
      y,
      { align: "center" }
    );

  y += 25;

  /* ================= RED DOUBLE LINE ================= */
  doc.rect(20, y, 555, 0.6).fill("#b80000");
  y += 3;
  doc.rect(20, y, 555, 0.6).fill("#b80000");
  y += 5;

  /* ================= INFO ROW FUNCTION ================= */
  const infoRow = (l1, v1, l2, v2) => {

    // ⛔ HARD RESET (this is the key)
    doc
        .save()
        .lineWidth(0)
        .fillColor("#d2d2d2")
        .strokeColor("#d2d2d2")
        .rect(20, y, 555, 20)
        .fillAndStroke()
        .restore();

    doc
        .fillColor("black")
        .font("Helvetica")
        .fontSize(12);

    doc.text(l1, 30, y + 5);
    doc.font("Helvetica-Bold").text(v1, 105, y + 5, { width: 215 });

    doc.font("Helvetica").text(l2, 330, y + 5);
    doc.font("Helvetica-Bold").text(v2, 415, y + 5, { width: 140 });

    y += 22;
};


  infoRow("Book", result.book, "Exam Date", result.dateexam);
  infoRow("Batch Time", result.time, "Result Date", new Date().toLocaleDateString("en-GB"));

  /* ================= RED DOUBLE LINE ================= */
  doc.rect(20, y, 555, 0.6).fill("#b80000");
  y += 3;
  doc.rect(20, y, 555, 0.6).fill("#b80000");
  y += 15;

  /* ================= TABLE HEADER ================= */
  const cols = [
    { t: "SR NO.", w: 40 },
    { t: "STUDENT NAME", w: 160 },
    { t: "ID NO.", w: 65 },
    { t: "F.M.", w: 40 },
    { t: "THEORY", w: 50 },
    { t: "PRACTICAL", w: 55 },
    { t: "TOTAL", w: 45 },
    { t: "%AGE", w: 55 },
    { t: "GRADE", w: 45 },
  ];

  let x = 20;
  doc.fillColor("black").rect(20, y, 555, 20).fill();
  doc.fillColor("white").fontSize(8);

  cols.forEach(c => {
    doc.text(c.t, x, y + 7, { width: c.w, align: "center" });
    x += c.w;
  });

  y += 20;

  /* ================= STUDENT ROWS ================= */
  let i = 0;
  let topper = "";

  Object.values(students).forEach(row => {
    if (row.status === "deleted") return;

    i++;
    const total = Number(row.theory) + Number(row.practical);
    const percent = (total / 50) * 100;

    const grade =
      percent === 100 ? "A+" :
      percent >= 80 ? "A" :
      percent >= 70 ? "B" :
      percent >= 60 ? "C" :
      percent >= 50 ? "D" :
      percent >= 40 ? "E" : "FAIL";

    if (i === 1) topper = row.name;

    doc
      .fillColor(i % 2 ? "white" : "#d2d2d2")
      .rect(20, y, 555, 21)
      .fill();

    doc.fillColor("black")
      .font(i === 1 ? "Helvetica-Bold" : "Helvetica")
      .fontSize(12);

    x = 20;
    [
      i >= 10 ? i : "0" + i,
      "  " + row.name,
      row.studentid != '' ? row.studentid : '-',
      "50",
      row.theory,
      row.practical,
      total,
      percent + "%",
      grade
    ].forEach((val, idx) => {
      doc.text(val.toString(), x, y + 6, {
        width: cols[idx].w,
        align: idx === 1 ? "left" : "center",
      });
      x += cols[idx].w;
    });

    y += 21;
  });

  /* ================= GRADING SYSTEM ================= */
  y += 15;
  doc.fontSize(10);

  doc.fillColor("#d2d2d2").rect(20, y, 260, 30).fill();
  doc.font("Helvetica-Bold").fillColor("black").text("GRADING SYSTEM", 20, y + 12, { width: 260, align: "center" });

  const grades = ["A", "B", "C", "D", "E", "FAIL"];
  const perc = [">=80%", ">=70%", ">=60%", ">=50%", ">=40%", "<40%"];

  x = 260;
  grades.forEach((g, idx) => {
    doc.rect(x, y, 52, 15).fill("#d2d2d2");
    doc.fillColor("black").text(g, x, y + 6, { width: 52, align: "center" });

    doc.rect(x, y + 14, 52, 16).fill("#d2d2d2");
    doc.fillColor("black").text(perc[idx], x, y + 19, { width: 52, align: "center" });

    x += 52;
  });

  /* ================= WELL DONE ================= */
  y += 50;
  doc.font("Helvetica-Oblique").fontSize(18).text("WELL DONE", 0, y, { align: "center" });
  y += 20;
  doc.font("Helvetica-Bold").fontSize(28).text(topper.toUpperCase(), 0, y, { align: "center" });

  /* ================= SIGNATURE BOX ================= */
  y += 40;
  ["SIGNATURE FACULTY", "CENTRE SEAL", "SIGNATURE CENTRE HEAD"].forEach((t, i) => {
    const bx = 20 + i * 185;
    doc.rect(bx, y, 170, 40).stroke();
    doc.fontSize(8).text(t, bx, y + 45, { width: 170, align: "center" });
  });

  doc.end();
}
