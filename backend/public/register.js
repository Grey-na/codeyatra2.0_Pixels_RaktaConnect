const axios = window.axios;

const registerbtn = document.getElementsByClassName("register-btn")[0];

if (!registerbtn) {
  console.log("Register button not found! Check the class name register-btn.");
}

registerbtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const role = document.getElementById("role").value.trim().toLowerCase(); // ✅ enum safe

  // Clear messages
  document.getElementById("registerError").textContent = "";
  document.getElementById("registerSuccess").textContent = "";

  // Basic validation
  if (!username || !email || !phone || !password || !confirmPassword || !role) {
    document.getElementById("registerError").textContent =
      "Please fill all fields.";
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById("registerError").textContent =
      "Passwords do not match!";
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        username,
        email,
        phone,
        password,
        confirmPassword, // ✅ send it
        role,            // ✅ lowercase enum
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    document.getElementById("registerSuccess").textContent =
      response.data?.message || "Registered successfully! Redirecting...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    console.log("REGISTER ERROR:", error.response?.data || error.message);

    document.getElementById("registerError").textContent =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Server error. Check backend console.";
  }
});