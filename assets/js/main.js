const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");

    menuToggle.textContent = siteNav.classList.contains("is-open") ? "Close" : "Menu";
  });
}

document.querySelectorAll(".glow-item").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  });
});

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    status.textContent = "Sending...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        status.textContent = "Message sent.";
        form.reset();
      } else {
        status.textContent = "Something went wrong.";
      }
    } catch (err) {
      status.textContent = "Error sending message.";
    }
  });
}