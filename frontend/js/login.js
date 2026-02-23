document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // stops page from reloading

  // grab values from the form
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // clear any previous error
  document.getElementById("loginError").textContent = "";

  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });

    // save the token in localStorage so other pages can use it
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("role", response.data.role);

    alert("Login successful! Welcome 🎉");

    // redirect based on role
    const role = response.data.role;
    if (role === "Donor") {
      window.location.href = "donor-dashboard.html";
    } else if (role === "Hospital/BloodBank") {
      window.location.href = "bloodbank-dashboard.html";
    } else if (role === "NGO") {
      window.location.href = "ngo-dashboard.html";
    } else {
      window.location.href = "index.html"; 
    }

  } catch (error) {
    // show error message on the page
    if (error.response) {
      document.getElementById("loginError").textContent = error.response.data.message;
    } else {
      document.getElementById("loginError").textContent = "Cannot connect to server. Is the backend running?";
    }
  }
});