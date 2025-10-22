import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Get correct path for current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Serve index.html at "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ====== Relworx payment endpoint ======
app.post("/api/pay", async (req, res) => {
  const { phone, amount } = req.body;

  try {
    const response = await fetch("https://payments.relworx.com/api/mobile-money/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.relworx.v2",  // required by API
        "Authorization": `Bearer ${process.env.RELWORX_API_KEY}`
      },
      body: JSON.stringify({
        account_no: "RELB91D9643B2",  // replace with your actual merchant account number
        reference: "WIFI_" + Date.now(),
        msisdn: phone.startsWith("+") ? phone : `+256${phone}`, // ensure full international format
        currency: "UGX",
        amount: Number(amount),
        description: "Wi-Fi 24hr Access"
      })
    });

    // get raw response first to debug
    const text = await response.text();
    console.log("Relworx raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON from Relworx:", err);
      return res.json({ success: false, message: "Invalid response from payment gateway", raw: text });
    }

    if (data.status === "success" || data.code === 200) {
      res.json({
        success: true,
        message: "Payment initiated successfully",
        reference: data.data?.reference || data.reference
      });
    } else {
      res.json({
        success: false,
        message: data.message || "Payment initiation failed",
        data
      });
    }
  } catch (err) {
    console.error("Server error:", err);
    res.json({ success: false, message: "Server error while connecting to Relworx" });
  }
});

// Start server
app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
