import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Sheets setup
async function appendToGoogleSheet(data: any) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.warn("Google Sheets credentials missing. Skipping sheet update.");
    return;
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Dalyviai!A:F', // Assumes data goes to 'Dalyviai' sheet, columns A to F
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          data.firstName,
          data.lastName,
          data.email,
          data.club || '',
          data.gender,
          new Date().toLocaleString('lt-LT')
        ]]
      }
    });
    console.log("Data appended to Google Sheet successfully.");
  } catch (error) {
    console.error("Error appending to Google Sheet:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/register", async (req, res) => {
    const { firstName, lastName, email, club, gender } = req.body;
    try {
      // Append to Google Sheets
      await appendToGoogleSheet({ firstName, lastName, email, club, gender });
      
      res.status(201).json({ message: "Registracija sėkminga!" });
    } catch (error) {
      res.status(500).json({ error: "Registracijos klaida" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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
