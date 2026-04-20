import "dotenv/config";
import express from "express";
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
    const msg = `Nenustatyti aplinkos kintamieji: ${missing.join(', ')}. Patikrinkite Vercel/AI Studio nustatymus.`;
    console.error(msg);
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
    console.error("Autentifikacijos klaida kuriant Google Auth klientą:", error.message);
    throw new Error(`Google Auth klaida: ${error.message}`);
  }
}

async function appendToGoogleSheet(data: any) {
  try {
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
    console.log("Duomenys sėkmingai įrašyti į Google Sheet.");
  } catch (error: any) {
    console.error("Google Sheets API klaida (rašant):", error.message || error);
    throw error;
  }
}

async function getParticipantsFromGoogleSheet() {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient();
    
    console.log(`Bandoma nuskaityti duomenis iš Sheet ID: ${spreadsheetId}, diapazonas: Dalyviai!A2:E1000`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Dalyviai!A2:E1000',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("Lentelė tuščia arba lapas 'Dalyviai' neturi duomenų nuo A2.");
      return [];
    }

    // Filtruojame tuščias eilutes ir validuojame duomenis
    return rows
      .filter((row: any) => row && row.length >= 2 && (row[0] || row[1]))
      .map((row: any) => ({
        firstName: row[0] || 'Be vardo',
        lastName: row[1] || '',
        club: row[3] || '',
        gender: row[4] || 'Vyras'
      }));
  } catch (error: any) {
    const errorDetail = error.response?.data?.error?.message || error.message || error;
    console.error("Google Sheets API klaida (skaitant):", errorDetail);
    throw new Error(`Google Sheets klaida: ${errorDetail}`);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/participants", async (req, res) => {
    try {
      const participants = await getParticipantsFromGoogleSheet();
      res.json(participants);
    } catch (error: any) {
      console.error("Klaida gaunant dalyvius:", error);
      res.status(500).json({ error: error.message || "Nepavyko gauti dalyvių sąrašo" });
    }
  });

  app.post("/api/register", async (req, res) => {
    const { firstName, lastName, email, club, gender } = req.body;
    console.log("Gauta nauja registracija:", { firstName, lastName, email });
    
    try {
      await appendToGoogleSheet({ firstName, lastName, email, club, gender });
      res.status(201).json({ message: "Registracija sėkminga!" });
    } catch (error: any) {
      console.error("Registracijos proceso klaida:", error);
      res.status(500).json({ 
        error: "Serverio klaida registruojant", 
        details: error.message || "Unknown error" 
      });
    }
  });

  // Vite middleware for development (AI Studio environment)
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      // Use dynamic import to avoid bundling Vite on Vercel
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware loaded for development");
    } catch (e) {
      console.warn("Vite could not be loaded, static files might not be served.");
    }
  } else if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    // Serve static files in production or on Vercel if needed
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not running on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

const appPromise = startServer();

export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
