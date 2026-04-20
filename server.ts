import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheets setup
async function getGoogleSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim().replace(/"/g, '');
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/"/g, '');
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '').trim();

  if (!spreadsheetId || !clientEmail || !privateKey) {
    const missing = [
      !spreadsheetId ? 'GOOGLE_SHEET_ID' : '',
      !clientEmail ? 'GOOGLE_CLIENT_EMAIL' : '',
      !privateKey ? 'GOOGLE_PRIVATE_KEY' : ''
    ].filter(Boolean);
    const msg = `Nenustatyti aplinkos kintamieji: ${missing.join(', ')}`;
    throw new Error(msg);
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId };
  } catch (error: any) {
    throw new Error(`Google Auth klaida: ${error.message}`);
  }
}

async function appendToGoogleSheet(data: any) {
  const { sheets, spreadsheetId } = await getGoogleSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Dalyviai!A:F',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        data.firstName,
        data.lastName,
        data.email,
        data.club || '',
        data.gender,
        new Date().toLocaleString('lt-LT', { timeZone: 'Europe/Vilnius' })
      ]]
    }
  });
}

async function getParticipantsFromGoogleSheet() {
  const { sheets, spreadsheetId } = await getGoogleSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Dalyviai!A2:E1000',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row: any) => row && row.length >= 2 && (row[0] || row[1]))
    .map((row: any) => ({
      firstName: row[0] || 'Be vardo',
      lastName: row[1] || '',
      club: row[3] || '',
      gender: row[4] || 'Vyras'
    }));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get("/api/participants", async (req, res) => {
    try {
      const participants = await getParticipantsFromGoogleSheet();
      res.json(participants);
    } catch (error: any) {
      console.error("Dalyvių gavimo klaida:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      await appendToGoogleSheet(req.body);
      res.status(201).json({ message: "Success" });
    } catch (error: any) {
      console.error("Registracijos klaida:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on http://localhost:3000");
  });
}

startServer();
