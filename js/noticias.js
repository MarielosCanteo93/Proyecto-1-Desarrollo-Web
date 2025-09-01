// Array de noticias de ejemplo (reemplazar con base de datos)
const noticiasEjemplo = [];

// Inicialización al cargar DOM
document.addEventListener('DOMContentLoaded', () => {
  inicializarFormulario();
  cargarNoticias();
  actualizarContadorCaracteres();
});

// Función para inicializar formulario
function inicializarFormulario() {
  const form = document.getElementById('agregar-noticia-form');
  const fechaInput = document.getElementById('fecha-noticia');

  // Fecha actual por defecto
  const hoy = new Date().toISOString().split('T')[0];
  fechaInput.value = hoy;

  // Evento submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    publicarNoticia();
  });
}

// Contador de caracteres
function actualizarContadorCaracteres() {
  const tituloInput = document.getElementById('titulo-noticia');
  const contenidoInput = document.getElementById('contenido-noticia');
  const tituloCount = document.getElementById('titulo-count');
  const contenidoCount = document.getElementById('contenido-count');

  tituloInput.addEventListener('input', () => {
    const length = tituloInput.value.length;
    tituloCount.textContent = `${length}/100`;
    tituloCount.className = `character-count mt-2 text-right ${length > 80 ? 'warning' : ''} ${length > 100 ? 'danger' : ''}`;
  });

  contenidoInput.addEventListener('input', () => {
    const length = contenidoInput.value.length;
    contenidoCount.textContent = `${length}/1000`;
    contenidoCount.className = `character-count mt-2 text-right ${length > 800 ? 'warning' : ''} ${length > 1000 ? 'danger' : ''}`;
  });
}

// Publicar noticia
function publicarNoticia() {
  const titulo = document.getElementById('titulo-noticia').value.trim();
  const fecha = document.getElementById('fecha-noticia').value;
  const contenido = document.getElementById('contenido-noticia').value.trim();

  // Validaciones
  if (!titulo || !fecha || !contenido) {
    alert('Por favor complete todos los campos obligatorios');
    return;
  }
  if (titulo.length > 100) {
    alert('El título no puede tener más de 100 caracteres');
    return;
  }
  if (contenido.length > 1000) {
    alert('El contenido no puede tener más de 1000 caracteres');
    return;
  }

  const nuevaNoticia = {
    id: Date.now(),
    fecha,
    titulo,
    contenido
  };

  noticiasEjemplo.unshift(nuevaNoticia);

  // Limpiar formulario
  document.getElementById('agregar-noticia-form').reset();
  document.getElementById('fecha-noticia').value = new Date().toISOString().split('T')[0];
  actualizarContadorCaracteres();

  // Recargar lista y mostrar toast
  cargarNoticias();
  mostrarToast();
}

// Cargar noticias
function cargarNoticias() {
  const listaNoticias = document.getElementById('lista-noticias');
  const emptyState = document.getElementById('empty-state');
  const newsCount = document.getElementById('news-count');

  listaNoticias.innerHTML = '';
  newsCount.textContent = `${noticiasEjemplo.length} noticia${noticiasEjemplo.length !== 1 ? 's' : ''}`;

  if (noticiasEjemplo.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  noticiasEjemplo.forEach(noticia => {
    const noticiaElement = crearNoticiaElement(noticia);
    listaNoticias.appendChild(noticiaElement);
  });
}

// Crear elemento de noticia
function crearNoticiaElement(noticia) {
  const div = document.createElement('div');
  div.className = 'news-card glass-effect p-6';

  const fechaFormateada = new Date(noticia.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  div.innerHTML = `
    <div class="flex items-start justify-between mb-4">
      <div>
        <span class="news-date"><i class="far fa-calendar-alt mr-2"></i>${fechaFormateada}</span>
        <h3 class="news-title mt-1">${noticia.titulo}</h3>
      </div>
      <button class="delete-btn p-2 rounded-lg hover:bg-red-50" onclick="eliminarNoticia(${noticia.id})">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
    <p class="news-content">${noticia.contenido}</p>
    <div class="mt-4 pt-4 border-t border-gray-100">
      <span class="text-sm text-gray-500"><i class="far fa-clock mr-2"></i>Publicado hace unos momentos</span>
    </div>
  `;

  return div;
}

// Eliminar noticia
function eliminarNoticia(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
    const index = noticiasEjemplo.findIndex(n => n.id === id);
    if (index !== -1) {
      noticiasEjemplo.splice(index, 1);
      cargarNoticias();
    }
  }
}

// Mostrar toast de éxito
function mostrarToast() {
  const toast = document.getElementById('success-toast');
  toast.classList.remove('translate-x-full');
  setTimeout(() => toast.classList.add('translate-x-full'), 3000);
}

// Animaciones de entrada
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.glass-effect').forEach(element => observer.observe(element));
