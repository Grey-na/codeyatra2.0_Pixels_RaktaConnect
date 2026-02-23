const PROFILE_URL = "http://localhost:5000/api/users/profile";

window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    document.getElementById("profileError").innerText = "Please login first.";
    return;
  }

  try {
    const res = await axios.get(PROFILE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = res.data;

    document.getElementById("profileUsername").innerText = user.username || "—";
    document.getElementById("profileUsernameValue").innerText = user.username || "—";
    document.getElementById("profileEmail").innerText = user.email || "—";
    document.getElementById("profilePoints").innerText =
      user.reward_points != null ? user.reward_points : "0";

    document.getElementById("profileRole").innerText = user.role || "";
    document.getElementById("profilePhone").innerText = user.phone || "—";
    document.getElementById("profileBloodGroup").innerText = user.blood_type || "—";
    document.getElementById("profileAge").innerText = user.age != null ? user.age : "—";

    document.getElementById("profileAvatar").innerText =
      (user.name || "?").trim().charAt(0).toUpperCase();

  } catch (err) {
    console.error(err);
    document.getElementById("profileError").innerText =
      err.response?.data?.message || "Failed to load profile";
  }
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}