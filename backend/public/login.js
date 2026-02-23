const axios = window.axios;

const loginbtn = document.getElementsByClassName("login-btn")[0];
const loginErrorEl = document.getElementById("loginError");
const loginSuccessEl = document.getElementById("loginSuccess");

loginbtn.addEventListener("click", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // clear old messages
  if (loginErrorEl) loginErrorEl.textContent = "";
  if (loginSuccessEl) loginSuccessEl.textContent = "";

  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("role", response.data.role);

    if (loginSuccessEl) loginSuccessEl.textContent = "Login successful! 🎉";

    const role = response.data.role;

    const rolePages = {
      donor: "index_donor.html",
      ngo: "index_ngo.html",
      bloodbank: "index_bloodbank.html",
      hospital: "index_hospital.html",
      csr: "index_csr.html",
      admin: "index_admin.html",
    };

    window.location.href = rolePages[role] || "index.html";
  } catch (error) {
    console.log("error in login js: ", error);

    const msg =
      error.response?.data?.message ||
      "Cannot connect to server. Is the backend running?";

    if (loginErrorEl) loginErrorEl.textContent = msg;
    else alert(msg);
  }
});