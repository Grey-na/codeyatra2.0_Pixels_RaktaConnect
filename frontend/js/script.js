// Dropdown logic (click-based)
const buttons = document.querySelectorAll(".dropbtn");

buttons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdown = btn.parentElement;

    document.querySelectorAll(".dropdown").forEach(d => {
      if (d !== dropdown) d.classList.remove("active");
    });

    dropdown.classList.toggle("active");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown").forEach(d => {
    d.classList.remove("active");
  });
});
