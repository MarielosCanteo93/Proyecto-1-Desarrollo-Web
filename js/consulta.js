// ========================
// Tabs
// ========================
const tab1Btn = document.getElementById('tab1-btn');
const tab2Btn = document.getElementById('tab2-btn');
const tab1Content = document.getElementById('tab1');
const tab2Content = document.getElementById('tab2');

function activateTab(tab) {
  if (tab === 'tab1') {
    tab1Btn.classList.add('text-blue-600', 'border-blue-600');
    tab1Btn.classList.remove('text-gray-600', 'border-transparent');
    tab1Btn.setAttribute('aria-selected', 'true');
    tab1Btn.tabIndex = 0;

    tab2Btn.classList.remove('text-blue-600', 'border-blue-600');
    tab2Btn.classList.add('text-gray-600', 'border-transparent');
    tab2Btn.setAttribute('aria-selected', 'false');
    tab2Btn.tabIndex = -1;

    tab1Content.classList.remove('hidden');
    tab2Content.classList.add('hidden');
  } else if (tab === 'tab2') {
    tab2Btn.classList.add('text-blue-600', 'border-blue-600');
    tab2Btn.classList.remove('text-gray-600', 'border-transparent');
    tab2Btn.setAttribute('aria-selected', 'true');
    tab2Btn.tabIndex = 0;

    tab1Btn.classList.remove('text-blue-600', 'border-blue-600');
    tab1Btn.classList.add('text-gray-600', 'border-transparent');
    tab1Btn.setAttribute('aria-selected', 'false');
    tab1Btn.tabIndex = -1;

    tab2Content.classList.remove('hidden');
    tab1Content.classList.add('hidden');
  }
}

tab1Btn.addEventListener('click', () => activateTab('tab1'));
tab2Btn.addEventListener('click', () => activateTab('tab2'));

// Accesibilidad con teclado
[tab1Btn, tab2Btn].forEach((btn) =>
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (e.target === tab1Btn) activateTab(e.key === 'ArrowRight' ? 'tab2' : 'tab1');
      else if (e.target === tab2Btn) activateTab(e.key === 'ArrowLeft' ? 'tab1' : 'tab2');
      if (document.activeElement.tabIndex === 0) document.activeElement.focus();
    }
  })
);

// ========================
// Menú desplegable
// ========================
const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("open");
});

// ========================
// Consultas con SQLite
// ========================

// Ejemplo: buscar inquilino por número de casa
function buscarInquilino(numeroCasa) {
  const resultados = selectQuery(
    "SELECT * FROM Inquilino WHERE NumeroCasa = ?",
    [numeroCasa]
  );
  return resultados; // array de objetos
}

// Ejemplo: obtener historial de pagos de un número de casa
function historialPagos(numeroCasa) {
  const pagos = selectQuery(
    "SELECT * FROM PagoDeCuotas WHERE NumeroCasa = ? ORDER BY AnoCuota, MesCuota",
    [numeroCasa]
  );
  return pagos;
}

// ========================
// Ejemplo de uso (puedes conectar esto con tus formularios HTML)
// ========================
document.getElementById("btnBuscarInquilino").addEventListener("click", () => {
  const casa = document.getElementById("numeroCasaInput").value;
  const datos = buscarInquilino(casa);

  const contenedor = document.getElementById("resultadoInquilino");
  contenedor.innerHTML = "";
  if (datos.length > 0) {
    const i = datos[0];
    contenedor.innerHTML = `
      <p><b>DPI:</b> ${i.DPI}</p>
      <p><b>Nombre:</b> ${i.PrimerNombre} ${i.PrimerApellido}</p>
      <p><b>Fecha Nacimiento:</b> ${i.FechaNacimiento}</p>
      <p><b>Casa:</b> ${i.NumeroCasa}</p>
    `;
  } else {
    contenedor.innerHTML = "<p>No se encontró inquilino</p>";
  }
});

document.getElementById("btnVerHistorial").addEventListener("click", () => {
  const casa = document.getElementById("numeroCasaInput").value;
  const pagos = historialPagos(casa);

  const contenedor = document.getElementById("resultadoPagos");
  contenedor.innerHTML = "";
  if (pagos.length > 0) {
    pagos.forEach(p => {
      contenedor.innerHTML += `<p>${p.MesCuota}/${p.AnoCuota} - Pagado el ${p.FechaPago}</p>`;
    });
  } else {
    contenedor.innerHTML = "<p>No hay pagos registrados</p>";
  }
});
