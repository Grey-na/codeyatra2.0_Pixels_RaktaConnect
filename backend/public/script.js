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

const actionCards = document.querySelectorAll(".action-card");

const actionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.2 },
);

actionCards.forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = "all 0.6s ease";
  actionObserver.observe(card);
});

const eventCards = document.querySelectorAll(".event-card");

const eventObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 },
);

eventCards.forEach((card) => {
  eventObserver.observe(card);
});

/**
 * Reads the text content of an element with the given ID.
 * @param {string} elementId The ID of the element to read.
 */
function readCriteria(elementId) {
  const textElement = document.getElementById(elementId);
  if (textElement) {
    const text = textElement.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ne-NP";
    window.speechSynthesis.cancel(); // Stop any previous speech
    window.speechSynthesis.speak(utterance);
  }
}
window.onload = function () {
  const popup = document.getElementById("popup");
  popup.style.display = "flex";
  document.body.classList.add("popup-open");
};

function closePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
  document.body.classList.remove("popup-open");
}
