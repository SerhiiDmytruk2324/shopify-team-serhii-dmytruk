document.addEventListener("DOMContentLoaded", () => {
    const spotlightSection = document.querySelector(".spotlight");
    const themeSwitch = document.querySelector("#theme-switch");
    
    if (!spotlightSection || !themeSwitch) return;

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || 
                         (!("theme" in localStorage) && prefersDark);

    if (shouldBeDark) {
        spotlightSection.classList.add("dark");
        themeSwitch.checked = true; 
    }

    themeSwitch.addEventListener("change", (event) => {
        const isDark = event.target.checked;
        
        spotlightSection.classList.toggle("dark", isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
});
