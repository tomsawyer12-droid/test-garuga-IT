const payBtn = document.getElementById("payBtn");
const statusDiv = document.getElementById("status");

payBtn.addEventListener("click", async () => {
  const phone = document.getElementById("phone").value.trim();
  const amount = document.getElementById("amount").value;

  if (!phone.startsWith("+2567") || phone.length < 10) {
    statusDiv.textContent = "Enter a valid Uganda mobile number starting with +2567…";
    statusDiv.className = "status error";
    return;
  }

  statusDiv.textContent = "Processing payment, please wait...";
  statusDiv.className = "status";

  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount })
    });

    const data = await res.json();

    if (data.success) {
      statusDiv.textContent = "Payment request sent. Please approve on your phone.";
      statusDiv.className = "status success";
    } else {
      statusDiv.textContent = "Payment failed: " + (data.message || "Unknown error");
      statusDiv.className = "status error";
    }
  } catch (err) {
    statusDiv.textContent = "Network error. Please try again.";
    statusDiv.className = "status error";
  }
});
