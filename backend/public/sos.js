// sos.js

const API_BASE = "http://localhost:5000";
const SOS_URL = `${API_BASE}/api/sos/send`;

const form = document.getElementById("sosForm");
const errorEl = document.getElementById("sosError");
const successEl = document.getElementById("sosSuccess");

function setError(msg) {
  errorEl.textContent = msg || "";
  successEl.textContent = "";
}

function setSuccess(msg) {
  successEl.textContent = msg || "";
  errorEl.textContent = "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    setError("You are not logged in. Please login first.");
    return;
  }

  const bloodTypeNeeded = document.getElementById("bloodTypeNeeded").value;
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!bloodTypeNeeded || !location || !description) {
    setError("Please fill all fields.");
    return;
  }

  try {
    setError("");

    const res = await axios.post(
      SOS_URL,
      { bloodTypeNeeded, location, description },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ must be Bearer
          "Content-Type": "application/json",
        },
      }
    );

    setSuccess(res.data?.message || "SOS sent successfully!");
    form.reset();
  } catch (err) {
    console.error("SOS error:", err);

    const msg =
      err.response?.data?.message ||
      err.response?.data?.sqlMessage ||
      "Failed to send SOS (server error).";

    setError(msg);
  }
});