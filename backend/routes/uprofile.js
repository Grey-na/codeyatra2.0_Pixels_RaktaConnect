// Get logged-in user profile
router.get("/profile", authMiddleware, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, name, email, reward_points FROM users WHERE id=?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(404).json({ message: "User not found" });

      res.json(results[0]);
    }
  );
});
import axios from "axios";
import { useEffect, useState } from "react";

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get("http://localhost:5000/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setUser(res.data);
    })
    .catch(err => {
      console.error(err);
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <h3>Earned Points: {user.reward_points}</h3>
    </div>
  );
}

export default UserProfile;