import "dotenv/config";
import express from "express";
import { db } from "./firebase.js";
import { generateResultPDF } from "./generateResultPdf.js";

const app = express();

app.get("/result", async (req, res) => {
  const { rid } = req.query;

  if (!rid) return res.status(400).send("Result ID missing");

  try {
    //Fetch result info
    const resultSnap = await db.ref(`Result/${rid}`).once("value");
    if (!resultSnap.exists()) return res.status(404).send("Result not found");
    const result = resultSnap.val();

    //Fetch students
    const studentsSnap = await db.ref(`ResultStudent/${rid}`).once("value");
    const raw = studentsSnap.val();
    const students = Object.entries(raw).map(([id, s]) => ({
      id,
      ...s,
    }));
    students.sort((a, b) => (b.theory + b.practical) - (a.theory + a.practical));

    //Auto-download headers
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ISM_Result_${rid}.pdf`
    );
    // res.setHeader(
    //     "Content-Disposition",
    //     `inline; filename=ISM_Result_${rid}.pdf`
    // );
    res.setHeader("Content-Type", "application/pdf");

    // 🔹 Generate PDF (ALL DESIGN HERE)
    generateResultPDF(res, result, students);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () =>
  console.log("ISM Result backend running on port 3000")
);
