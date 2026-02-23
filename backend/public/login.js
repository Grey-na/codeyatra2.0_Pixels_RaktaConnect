const axios = window.axios;
const loginbtn = document.getElementsByClassName("login-btn")[0];

loginbtn.addEventListener("click", async function (e) {
  e.preventDefault();
  console.log("login btn clicked");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  console.log("Form values: ", { username, password });

  // document.getElementById("loginError").textContent = "";

  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      username,
      password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("role", response.data.role);

    alert("Login successful! 🎉");

    const role = response.data.role;

    const rolePages = {
      donor: "index_donor.html",
      ngo: "index_ngo.html",
      bloodbank: "index_bloodbank.html",
      others: "index.html",
    };

window.location.href = rolePages[role] || "index.html";
  } catch (error) {
    console.log("error in login js: ", error);
    if (error.response && error.response.data) {
      document.getElementById("loginError").textContent =""
        error.response.data.message;
    } else {
      document.getElementById("loginError").textContent =
        "Cannot connect to server. Is the backend running?";
    }
  }
});
