import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("participants.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    club TEXT,
    gender TEXT NOT NULL,
    isNew INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/register", (req, res) => {
    const { firstName, lastName, email, club, gender } = req.body;
    try {
      const stmt = db.prepare(
        "INSERT INTO participants (firstName, lastName, email, club, gender) VALUES (?, ?, ?, ?, ?)"
      );
      stmt.run(firstName, lastName, email, club, gender);
      res.status(201).json({ message: "Registracija sėkminga!" });
    } catch (error) {
      res.status(500).json({ error: "Registracijos klaida" });
    }
  });

  app.get("/api/participants", (req, res) => {
    try {
      const participants = db.prepare("SELECT * FROM participants ORDER BY createdAt DESC").all();
      res.json(participants);
    } catch (error) {
      res.status(500).json({ error: "Nepavyko gauti dalyvių sąrašo" });
    }
  });

  app.post("/api/participants/mark-seen", (req, res) => {
    try {
      db.prepare("UPDATE participants SET isNew = 0").run();
      res.json({ message: "Visi dalyviai pažymėti kaip peržiūrėti" });
    } catch (error) {
      res.status(500).json({ error: "Klaida atnaujinant būseną" });
    }
  });

  app.delete("/api/participants/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM participants WHERE id = ?").run(id);
      res.json({ message: "Dalyvis ištrintas" });
    } catch (error) {
      res.status(500).json({ error: "Klaida trinant dalyvį" });
    }
  });

  app.post("/api/participants/bulk-delete", (req, res) => {
    const { ids } = req.body;
    try {
      const stmt = db.prepare("DELETE FROM participants WHERE id = ?");
      const deleteMany = db.transaction((ids) => {
        for (const id of ids) stmt.run(id);
      });
      deleteMany(ids);
      res.json({ message: "Dalyviai ištrinti" });
    } catch (error) {
      res.status(500).json({ error: "Klaida trinant dalyvius" });
    }
  });

  app.post("/api/send-email", (req, res) => {
    const { recipients, subject, message } = req.body;
    // Mock email sending
    console.log(`Sending email to: ${recipients.join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    // In a real app, you would use nodemailer or an API like SendGrid here
    res.json({ message: "Laiškas sėkmingai išsiųstas (simuliacija)" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
