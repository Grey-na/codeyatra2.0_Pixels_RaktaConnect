// import axios from "axios";
const axios = window.axios; // Use the global axios included via CDN

const registerbtn = document.getElementsByClassName("register-btn")[0];
console.log("registerbtn: ", registerbtn);

if (!registerbtn)
  console.log(
    "Register button not found! Check the HTML structure and class name.",
  );

registerbtn.addEventListener("click", async function (e) {
  e.preventDefault();
  console.log("Register button clicked");

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirmPassword")
    .value.trim();
  const role = document.getElementById("role").value;

  console.log("Form values: ", {
    username,
    email,
    phone,
    password,
    confirmPassword,
    role,
  });

  // Clear previous messages
  document.getElementById("registerError").textContent = "";
  document.getElementById("registerSuccess").textContent = "";

  if (password !== confirmPassword) {
    document.getElementById("registerError").textContent =
      "Passwords do not match!";
    return; // Stop the function if passwords don't match
  }

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        username,
        email,
        phone,
        password,
        role,
      },
    );

    document.getElementById("registerSuccess").textContent =
      "Registered successfully! Redirecting to login...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    console.log("error: ", error);
    if (error.response && error.response.data) {
      document.getElementById("registerError").textContent =
        error.response.data.message;
    } else {
      document.getElementById("registerError").textContent =
        "Cannot connect to server. Is the backend running?";
    }
  }
});

// document
//   .getElementsByClassName("register-btn")[0]
//   .addEventListener("click", async function (e) {
//     e.preventDefault();
// getElementById("email").value.trim();
//     const phone = document.getElementById
//     const username = document.getElementById("username").value.trim();
//     const email = document.("phone").value.trim();
//     const password = document.getElementById("password").value.trim();
//     const confirmPassword = document
//       .getElementById("confirmPassword")
//       .value.trim();
//     const role = document.getElementById("role").value;

//     // clear previous messages
//     document.getElementById("registerError").textContent = "";
//     document.getElementById("registerSuccess").textContent = "";

//     if (password !== confirmPassword) {
//       document.getElementById("registerError").textContent =
//         "Passwords do not match!";
//       return;
//     }

//     try {
//       const response = await axios.post("http://local:5000/api/auth/register", {
//         username,
//         email,
//         phone,
//         password,
//         role,
//       });

//       document.getElementById("registerSuccess").textContent =
//         "Registered successfully! Redirecting to login...";

//       setTimeout(() => {
//         window.location.href = "login.html";
//       }, 1500);
//     } catch (error) {
//       console.log("error: ", error);
//       if (error.response && error.response.data) {
//         document.getElementById("registerError").textContent =
//           error.response.data.message;
//       } else {
//         document.getElementById("registerError").textContent =
//           "Cannot connect to server. Is the backend running?";
//       }
//     }
//   });
