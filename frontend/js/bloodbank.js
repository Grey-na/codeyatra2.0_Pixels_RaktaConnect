const buttons = document.querySelectorAll(".dropbtn");

buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdown = btn.parentElement;

    document.querySelectorAll(".dropdown").forEach((d) => {
      if (d !== dropdown) d.classList.remove("active");
    });

    dropdown.classList.toggle("active");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown").forEach((d) => {
    d.classList.remove("active");
  });
});
/* // Frontend filter logic */
const select = document.getElementById("bloodType");
const cards = document.querySelectorAll(".bank-card");

select.addEventListener("change", () => {
  const selected = select.value;

  cards.forEach((card) => {
    const available = card.dataset.blood.split(" ");
    card.style.display = available.includes(selected) ? "block" : "none";
  });
});
