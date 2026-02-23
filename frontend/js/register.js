// password hide
const toggleBtn = document.querySelector(".toggle-password");

toggleBtn.addEventListener("click", () => {
  const passwordInput = toggleBtn.previousElementSibling; // gets the input before the button
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleBtn.textContent = "🚫";
  } else {
    passwordInput.type = "password";
    toggleBtn.textContent = "👁";
  }
});

const togglecpBtn = document.querySelector(".toggle-confirmpassword");

togglecpBtn.addEventListener("click", () => {
  const passwordInput = togglecpBtn.previousElementSibling; // gets the input before the button
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglecpBtn.textContent = "🚫";
  } else {
    passwordInput.type = "password";
    togglecpBtn.textContent = "👁";
  }
});

/*password and confirm password same */
const form = document.querySelector("form");
const passwordInput = document.querySelector(".password-wrapper input");
const confirmPasswordInput = document.querySelector(
  ".confirmpassword-wrapper input",
);

// Real-time check as user types in confirm password field
confirmPasswordInput.addEventListener("input", () => {
  if (confirmPasswordInput.value !== passwordInput.value) {
    confirmPasswordInput.style.border = "2px solid red";
  } else {
    confirmPasswordInput.style.border = "2px solid green";
  }
});

// Block form submission if passwords don't match
form.addEventListener("submit", (e) => {
  if (passwordInput.value !== confirmPasswordInput.value) {
    e.preventDefault(); // stops form from submitting
    alert("Passwords do not match. Please try again.");
    confirmPasswordInput.focus(); // brings cursor back to confirm field
    confirmPasswordInput.style.border = "2px solid red";
  }
});