document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("custom_contact_form");
  const submitButton = document.getElementById("custom_contact_form-submit");

  if (!form || !submitButton) return;

  // If Shopify already rendered an error or success — do not show loading state again
  if (form.querySelector(".form-status")) return;

  form.addEventListener("submit", (e) => {
    const honeypot = form.querySelector('input[name="contact[honeypot]"]');
    if (honeypot && honeypot.value.trim() !== "") {
      e.preventDefault();
      console.warn("Spam bot detected — blocked.");
      return;
    }

    form.setAttribute("aria-busy", "true");
    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    submitButton.textContent = "Sending...";
  });
});
