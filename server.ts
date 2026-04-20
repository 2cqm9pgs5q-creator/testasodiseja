import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resend setup
let resend: Resend | null = null;
const apiKey = process.env.RESEND_API_KEY?.trim().replace(/"/g, '');
if (apiKey) {
  resend = new Resend(apiKey);
} else {
  console.warn("RESEND_API_KEY kintamasis nerastas.");
}

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

async function sendConfirmationEmail(data: any) {
  if (!resend) {
    console.warn("Resend API raktas nenustatytas, laiškas nebus siunčiamas.");
    return;
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'Aukštaitijos Gravel Odisėja <dalyvauk@utenacyclingteam.com>',
      to: [data.email],
      replyTo: 'efkka.b@gmail.com',
      subject: 'Registracijos patvirtinimas: Aukštaitijos Gravel Odisėja 2026',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border: 1px solid #eeeeee; border-radius: 16px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; color: #000; text-transform: uppercase; letter-spacing: 2px; font-style: italic;">Aukštaitijos Gravel Odisėja 2026</h2>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Dėkojame, kad užsiregistravote į <strong>„Aukštaitijos gravel odisėja 2026“</strong>! Džiaugiamės, kad prisijungsite prie mūsų ir kartu leisitės į šią gravel dviračių kelionę po Aukštaitijos apylinkes.</p>
          
          <div style="background-color: #fff9f0; padding: 25px; border-radius: 12px; border: 1px solid #ffecb3; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #856404; font-size: 18px;">Svarbu: Registracijos patvirtinimas</h3>
            <p style="margin-bottom: 15px; font-size: 15px;">Kad Jūsų registracija būtų galutinai patvirtinta, prašome atlikti <strong>25 EUR</strong> startinį mokestį.</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
              <p style="margin: 5px 0; font-size: 14px;"><strong>Gavėjas:</strong> VŠI Utena Cycling Team</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Sąskaitos numeris (IBAN):</strong> <code style="background: #f4f4f4; padding: 2px 4px; border-radius: 4px;">LT537300010184634043</code></p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Suma:</strong> 25 EUR</p>
              <p style="margin: 5px 0; font-size: 14px;"><strong>Paskirtis:</strong> ${data.firstName} ${data.lastName}</p>
            </div>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6;">Likus keliom dienom iki renginio, pasidalinsime GPX failu, tikslia starto ir nakvynės vieta bei kita svarbia informacija.</p>
          
          <p style="font-size: 15px; line-height: 1.6;">Turite klausimų? Brūkštelėkite atsakymą į šį laišką.</p>
          
          <p style="font-size: 16px; font-weight: bold; margin-top: 30px;">Iki susitikimo prie starto linijos!</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #777777; font-size: 13px;">
            <p style="margin: 0;">Su linkėjimais,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #333333;">Organizatorių komanda</p>
            <p style="margin: 0;">„Aukštaitijos gravel odisėja 2026“</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error("Resend klaida siunčiant laišką:", error);
    } else {
      console.log("Patvirtinimo laiškas sėkmingai išsiųstas:", emailData?.id);
    }
  } catch (error) {
    console.error("Netikėta klaida siunčiant laišką per Resend:", error);
  }
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
      
      // Vercel (Serverless) aplinkoje privalome palaukti (await), kol laiškas bus išsiųstas,
      // kitaip funkcija gali išsijungti anksčiau laiko.
      try {
        await sendConfirmationEmail(req.body);
      } catch (e) {
        console.error("Email sending failed:", e);
      }
      
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
