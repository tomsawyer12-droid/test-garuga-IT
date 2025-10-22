const form = document.getElementById("payForm");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("phone").value;
  const amount = document.getElementById("amount").value;
  messageDiv.innerHTML = "Processing payment...";

  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount })
    });

    const data = await res.json();
    messageDiv.innerHTML = data.success ? `✅ ${data.message}` : `❌ ${data.message}`;
  } catch (err) {
    messageDiv.innerHTML = "⚠️ Network error. Try again.";
    console.error(err);
  }
});
