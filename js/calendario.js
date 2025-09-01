document.addEventListener('DOMContentLoaded', () => {
  // Elementos
  const mesSelect = document.getElementById('mes');
  const anioSelect = document.getElementById('anio');
  const calendarioDiv = document.getElementById('calendario');
  const eventosDelDiaDiv = document.getElementById('eventosDelDia');
  const resumenSeleccion = document.getElementById('resumenSeleccion');

  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const hoyBtn = document.getElementById('hoy');

  const modoOscuroBtn = document.getElementById('modoOscuro');
  const exportarBtn = document.getElementById('exportar');
  const importarBtn = document.getElementById('importar');
  const agregarEventoBtn = document.getElementById('agregarEventoBtn');

  const menuToggle = document.getElementById('menuToggle');
  const menu = document.getElementById('menu'); // (no tocamos su comportamiento)

  // Estado
  let modoOscuro = false;
  let fechaSeleccionada = null; // YYYY-MM-DD
  let modoImportExport = 'export'; // 'export' | 'import'

  // ==========================
  // Helpers de fecha
  // ==========================
  const pad2 = (n) => String(n).padStart(2, '0');

  function ymd(y, m0, d) {
    return `${y}-${pad2(m0 + 1)}-${pad2(d)}`;
  }

  function parseYMD(s) {
    // s: YYYY-MM-DD
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // ==========================
  // SQL Helpers
  // ==========================
  function obtenerEventosMes(m0, anio) {
    // m0 es 0-11
    const inicio = ymd(anio, m0, 1);
    const ultimoDia = new Date(anio, m0 + 1, 0).getDate();
    const fin = ymd(anio, m0, ultimoDia);
    return selectQuery(
      "SELECT rowid, * FROM Calendario WHERE Fecha BETWEEN ? AND ? ORDER BY Fecha ASC, rowid ASC",
      [inicio, fin]
    );
  }

  function obtenerEventosDelDia(fechaYmd) {
    return selectQuery(
      "SELECT rowid, * FROM Calendario WHERE Fecha = ? ORDER BY rowid ASC",
      [fechaYmd]
    );
  }

  function insertarEvento({ Fecha, Titulo, Descripcion }) {
    runQuery(
      "INSERT INTO Calendario (Fecha, Titulo, Descripcion) VALUES (?, ?, ?)",
      [Fecha, Titulo || '', Descripcion || '']
    );
  }

  function actualizarEvento({ rowid, Titulo, Descripcion, Fecha }) {
    runQuery(
      "UPDATE Calendario SET Titulo = ?, Descripcion = ?, Fecha = ? WHERE rowid = ?",
      [Titulo || '', Descripcion || '', Fecha, rowid]
    );
  }

  function eliminarEvento(rowid) {
    runQuery("DELETE FROM Calendario WHERE rowid = ?", [rowid]);
  }

  // ==========================
  // UI: cargar selects y render
  // ==========================
  function cargarMeses() {
    mesSelect.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = new Date(0, i).toLocaleString('es', { month: 'long' });
      mesSelect.appendChild(option);
    }
  }

  function cargarAnios() {
    anioSelect.innerHTML = '';
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      anioSelect.appendChild(option);
    }
  }

  function setResumenSeleccion(m0, y) {
    const nombreMes = new Date(y, m0, 1).toLocaleString('es', { month: 'long' });
    resumenSeleccion.textContent = `Viendo: ${nombreMes} ${y}`;
  }

  function renderCalendario(m0, y) {
    calendarioDiv.innerHTML = '';

    const diasEnMes = new Date(y, m0 + 1, 0).getDate();
    const primerDiaSemana = new Date(y, m0, 1).getDay(); // 0 Dom - 6 Sáb
    const eventosMes = obtenerEventosMes(m0, y);

    // Huecos antes del día 1
    for (let i = 0; i < primerDiaSemana; i++) {
      const empty = document.createElement('div');
      empty.className = 'dia dia-vacio';
      calendarioDiv.appendChild(empty);
    }

    const hoy = new Date();
    const hoyY = hoy.getFullYear();
    const hoyM0 = hoy.getMonth();
    const hoyD = hoy.getDate();

    for (let d = 1; d <= diasEnMes; d++) {
      const fecha = ymd(y, m0, d);
      const caja = document.createElement('div');
      caja.className = 'dia';

      // Día actual
      if (y === hoyY && m0 === hoyM0 && d === hoyD) {
        caja.classList.add('dia-actual');
      }

      // Número del día
      const num = document.createElement('div');
      num.className = 'dia-numero';
      num.textContent = d;
      caja.appendChild(num);

      // Eventos del día (del arreglo del mes)
      const evs = eventosMes.filter((e) => e.Fecha === fecha);
      if (evs.length > 0) {
        const contador = document.createElement('div');
        contador.className = 'event-count';
        contador.textContent = evs.length;
        caja.appendChild(contador);

        const lista = document.createElement('div');
        lista.className = 'event-list';
        evs.forEach((ev) => {
          const chip = document.createElement('div');
          chip.className = 'evento-chip';
          chip.textContent = ev.Titulo || '(Sin título)';
          chip.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirEventModal({
              ...ev,
              isNew: false
            });
          });
          lista.appendChild(chip);
        });
        caja.appendChild(lista);
      }

      // Click para seleccionar día
      caja.addEventListener('click', () => {
        fechaSeleccionada = fecha;
        mostrarEventosDelDia(fecha);
      });

      calendarioDiv.appendChild(caja);
    }

    setResumenSeleccion(m0, y);
  }

  function mostrarEventosDelDia(fechaYmd) {
    const [yy, mm, dd] = fechaYmd.split('-').map(Number);
    const nombre = new Date(yy, mm - 1, dd).toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const eventos = obtenerEventosDelDia(fechaYmd);
    const cont = document.createElement('div');
    cont.className = 'space-y-2';

    const titulo = document.createElement('div');
    titulo.className = 'font-semibold';
    titulo.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1);
    cont.appendChild(titulo);

    if (eventos.length === 0) {
      const vacio = document.createElement('div');
      vacio.textContent = 'No hay eventos';
      cont.appendChild(vacio);
    } else {
      eventos.forEach((ev) => {
        const fila = document.createElement('div');
        fila.className = 'evento-lista-item';

        const texto = document.createElement('div');
        texto.className = 'truncate';
        texto.innerHTML = `<span class="font-semibold">${ev.Titulo || '(Sin título)'}</span><br><span class="text-sm text-gray-600">${ev.Descripcion || ''}</span>`;
        fila.appendChild(texto);

        const acciones = document.createElement('div');
        acciones.className = 'flex gap-2';

        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn-mini';
        btnEditar.textContent = 'Editar';
        btnEditar.addEventListener('click', () => {
          abrirEventModal({ ...ev, isNew: false });
        });

        const btnBorrar = document.createElement('button');
        btnBorrar.className = 'btn-mini-danger';
        btnBorrar.textContent = 'Eliminar';
        btnBorrar.addEventListener('click', () => {
          if (confirm('¿Eliminar este evento?')) {
            eliminarEvento(ev.rowid);
            renderCalendario(parseInt(mesSelect.value), parseInt(anioSelect.value));
            mostrarEventosDelDia(fechaYmd);
          }
        });

        acciones.appendChild(btnEditar);
        acciones.appendChild(btnBorrar);
        fila.appendChild(acciones);

        cont.appendChild(fila);
      });
    }

    eventosDelDiaDiv.innerHTML = '';
    eventosDelDiaDiv.appendChild(cont);

    // Mostrar botón "Agregar"
    agregarEventoBtn.classList.remove('hidden');
  }

  // ==========================
  // Modales
  // ==========================
  // Evento
  const eventModal = document.getElementById('eventModal');
  const closeEventModal = document.getElementById('closeEventModal');
  const eventModalTitle = document.getElementById('eventModalTitle');
  const eventFecha = document.getElementById('eventFecha');
  const eventTitulo = document.getElementById('eventTitulo');
  const eventDescripcion = document.getElementById('eventDescripcion');
  const deleteEventBtn = document.getElementById('deleteEvent');
  const cancelEventBtn = document.getElementById('cancelEvent');
  const saveEventBtn = document.getElementById('saveEvent');

  let modalEventState = { isNew: true, rowid: null };

  function abrirEventModal(ev) {
    modalEventState = {
      isNew: !!ev.isNew,
      rowid: ev.rowid || null,
    };

    eventModalTitle.textContent = ev.isNew ? 'Nuevo Evento' : 'Editar Evento';
    eventFecha.value = ev.Fecha || (fechaSeleccionada || new Date().toISOString().slice(0, 10));
    eventTitulo.value = ev.Titulo || '';
    eventDescripcion.value = ev.Descripcion || '';

    deleteEventBtn.classList.toggle('hidden', ev.isNew);
    eventModal.classList.remove('hidden');
  }

  function cerrarEventModal() {
    eventModal.classList.add('hidden');
  }

  closeEventModal.addEventListener('click', cerrarEventModal);
  cancelEventBtn.addEventListener('click', cerrarEventModal);

  deleteEventBtn.addEventListener('click', () => {
    if (!modalEventState.isNew && modalEventState.rowid) {
      if (confirm('¿Eliminar este evento?')) {
        eliminarEvento(modalEventState.rowid);
        cerrarEventModal();
        renderCalendario(parseInt(mesSelect.value), parseInt(anioSelect.value));
        if (fechaSeleccionada) mostrarEventosDelDia(fechaSeleccionada);
      }
    }
  });

  saveEventBtn.addEventListener('click', () => {
    const data = {
      Fecha: eventFecha.value,
      Titulo: eventTitulo.value.trim(),
      Descripcion: eventDescripcion.value.trim(),
    };

    if (!data.Fecha) {
      alert('La fecha es obligatoria');
      return;
    }

    if (modalEventState.isNew) {
      insertarEvento(data);
    } else {
      actualizarEvento({ ...data, rowid: modalEventState.rowid });
    }

    cerrarEventModal();
    // Re-render
    const m0 = parseInt(mesSelect.value);
    const y = parseInt(anioSelect.value);
    renderCalendario(m0, y);

    // Si la fecha del evento coincide con la selección actual, refrescar panel
    if (fechaSeleccionada === data.Fecha) {
      mostrarEventosDelDia(data.Fecha);
    } else if (fechaSeleccionada) {
      mostrarEventosDelDia(fechaSeleccionada);
    }
  });

  // Abrir modal para crear evento cuando haya un día seleccionado
  agregarEventoBtn.addEventListener('click', () => {
    const baseFecha = fechaSeleccionada || new Date().toISOString().slice(0, 10);
    abrirEventModal({ isNew: true, Fecha: baseFecha });
  });

  // Import / Export
  const importExportModal = document.getElementById('importExportModal');
  const importExportTitle = document.getElementById('importExportTitle');
  const importExportTextarea = document.getElementById('importExportTextarea');
  const importExportAction = document.getElementById('importExportAction');
  const importExportCancel = document.getElementById('importExportCancel');
  const closeImportExport = document.getElementById('closeImportExport');

  function abrirImportExport(titulo, contenido, readOnly, modo) {
    modoImportExport = modo; // 'export' | 'import'
    importExportTitle.textContent = titulo;
    importExportTextarea.value = contenido || '';
    importExportTextarea.readOnly = !!readOnly;
    importExportAction.textContent = modo === 'export' ? 'Copiar' : 'Importar';
    importExportModal.classList.remove('hidden');
  }

  function cerrarImportExport() {
    importExportModal.classList.add('hidden');
  }

  importExportCancel.addEventListener('click', cerrarImportExport);
  closeImportExport.addEventListener('click', cerrarImportExport);

  importExportAction.addEventListener('click', () => {
    if (modoImportExport === 'export') {
      navigator.clipboard.writeText(importExportTextarea.value)
        .then(() => {
          alert('Eventos copiados al portapapeles');
          cerrarImportExport();
        })
        .catch(() => alert('No se pudo copiar. Selecciona y copia manualmente.'));
    } else {
      try {
        const datos = JSON.parse(importExportTextarea.value);
        if (!Array.isArray(datos)) {
          alert('El JSON debe ser un arreglo de eventos');
          return;
        }
        datos.forEach(ev => {
          if (ev && ev.Fecha) {
            insertarEvento({
              Fecha: ev.Fecha,
              Titulo: ev.Titulo || '',
              Descripcion: ev.Descripcion || ''
            });
          }
        });
        cerrarImportExport();
        renderCalendario(parseInt(mesSelect.value), parseInt(anioSelect.value));
        if (fechaSeleccionada) mostrarEventosDelDia(fechaSeleccionada);
        alert('Eventos importados correctamente');
      } catch (e) {
        alert('JSON inválido. Verifica el formato.');
      }
    }
  });


  // Navegación de mes/año
  prevMonthBtn.addEventListener('click', () => {
    let m0 = parseInt(mesSelect.value);
    let y = parseInt(anioSelect.value);
    m0--;
    if (m0 < 0) { m0 = 12 - 1; y--; }
    mesSelect.value = m0;
    anioSelect.value = y;
    renderCalendario(m0, y);
  });

  nextMonthBtn.addEventListener('click', () => {
    let m0 = parseInt(mesSelect.value);
    let y = parseInt(anioSelect.value);
    m0++;
    if (m0 > 11) { m0 = 0; y++; }
    mesSelect.value = m0;
    anioSelect.value = y;
    renderCalendario(m0, y);
  });

  hoyBtn.addEventListener('click', () => {
    const now = new Date();
    mesSelect.value = now.getMonth();
    anioSelect.value = now.getFullYear();
    renderCalendario(now.getMonth(), now.getFullYear());
    fechaSeleccionada = now.toISOString().slice(0, 10);
    mostrarEventosDelDia(fechaSeleccionada);
  });

  mesSelect.addEventListener('change', () => {
    renderCalendario(parseInt(mesSelect.value), parseInt(anioSelect.value));
  });
  anioSelect.addEventListener('change', () => {
    renderCalendario(parseInt(mesSelect.value), parseInt(anioSelect.value));
  });

  // Modo oscuro persistente
  function aplicarModoOscuro(valor) {
    modoOscuro = valor;
    document.body.classList.toggle('modo-oscuro', modoOscuro);
    localStorage.setItem('modoOscuro', String(modoOscuro));
  }
  modoOscuroBtn.addEventListener('click', () => {
    aplicarModoOscuro(!modoOscuro);
  });

  // Exportar / Importar
  exportarBtn.addEventListener('click', () => {
    const todos = selectQuery("SELECT * FROM Calendario ORDER BY Fecha ASC, rowid ASC");
    abrirImportExport('Exportar Eventos', JSON.stringify(todos, null, 2), true, 'export');
  });

  importarBtn.addEventListener('click', () => {
    abrirImportExport('Importar Eventos', '', false, 'import');
  });

  // ==========================
  // Inicio
  // ==========================
  cargarMeses();
  cargarAnios();

  // Estado inicial: mes/año actuales
  const now = new Date();
  mesSelect.value = now.getMonth();
  anioSelect.value = now.getFullYear();

  // Modo oscuro guardado
  const storedDark = localStorage.getItem('modoOscuro') === 'true';
  aplicarModoOscuro(storedDark);

  // Render inicial
  renderCalendario(parseInt(mesSelect.value), parseInt(anioSelect.value));
});
