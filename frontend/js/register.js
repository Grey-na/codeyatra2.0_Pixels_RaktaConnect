document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const role = document.getElementById("role").value;
  const bloodGroup = document.getElementById("bloodgroup").value.trim();

  // clear previous messages
  document.getElementById("registerError").textContent = "";
  document.getElementById("registerSuccess").textContent = "";

  // check passwords match before even hitting the backend
  if (password !== confirmPassword) {
    document.getElementById("registerError").textContent = "Passwords do not match!";
    return;
  }

  try {
    const response = await axios.post("http://192.168.56.1:5000/api/auth/register", {
      username,
      email,
      phone,
      password,
      role,
    });

    document.getElementById("registerSuccess").textContent = "Registered successfully! Redirecting to login...";

    // wait 1.5 seconds then redirect to login
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (error) {
    if (error.response) {
      document.getElementById("registerError").textContent = error.response.data.message;
    } else {
      document.getElementById("registerError").textContent = "Cannot connect to server. Is the backend running?";
    }
  }
});