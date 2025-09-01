

// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");


  menuToggle.addEventListener("click", function () {
    menu.classList.toggle("active");
  });

  // Opcional: cerrar menú al hacer clic en un enlace
  const links = menu.querySelectorAll("a");
  links.forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  });
});
