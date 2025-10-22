import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)))));

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "index.html"));
});

// Relworx payment endpoint
app.post("/api/pay", async (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) return res.status(400).json({ success: false, message: "Phone and amount are required" });

  try {
    const response = await fetch("https://payments.relworx.com/api/mobile-money/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.relworx.v2",
        "Authorization": `Bearer ${process.env.RELWORX_API_KEY}`
      },
      body: JSON.stringify({
        account_no: process.env.RELWORX_ACCOUNT,
        reference: "WIFI_" + Date.now(),
        msisdn: phone.startsWith("+") ? phone : `+256${phone}`,
        currency: "UGX",
        amount: Number(amount),
        description: "Wi-Fi 24hr Access"
      })
    });

    const data = await response.json();
    console.log("Relworx response:", data);

    if (data.success === true || data.status === "success") {
      res.json({ success: true, message: "Payment request sent successfully", data });
    } else {
      res.status(400).json({ success: false, message: data.message || "Payment failed", data });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Use dynamic Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
