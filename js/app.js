/**
 * Formatea un valor numérico a una representación monetaria compacta (ej. €45M, €850K).
 * @param {number} valor - El número a formatear.
 * @returns {string} El valor formateado.
 */
function formatearMonedaCompacta(valor) {
  if (valor === undefined || valor === null || isNaN(valor)) return "€0";
  
  if (valor >= 1000000) {
    const millon = valor / 1000000;
    const formateado = Number(millon.toFixed(2));
    return `€${formateado}M`;
  }
  
  if (valor >= 1000) {
    const miles = valor / 1000;
    const formateado = Number(miles.toFixed(2));
    return `€${formateado}K`;
  }
  
  return `€${valor}`;
}

/**
 * Renderiza los badges de posiciones con sus respectivos contadores de forma genérica.
 * @param {Array} items - Listado de jugadores o fichajes.
 * @param {HTMLElement} container - Contenedor en el DOM.
 * @param {string|null} filtroActivo - Filtro de posición seleccionado.
 * @param {Function} callback - Acción a ejecutar tras el click (pasa la posición clickeada o null).
 */
function renderizarBadgesPosicion(items, container, filtroActivo, callback) {
  const posicionesFifa = ["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"];
  const counts = {};
  posicionesFifa.forEach(pos => counts[pos] = 0);

  items.forEach(item => {
    if (Array.isArray(item.posiciones)) {
      item.posiciones.forEach(pos => {
        if (counts[pos] !== undefined) counts[pos]++;
      });
    }
  });

  container.innerHTML = "";
  posicionesFifa.forEach(pos => {
    const count = counts[pos];
    const esActivo = pos === filtroActivo;

    const badge = document.createElement("div");
    badge.className = `pos-summary-card ${esActivo ? "active" : ""}`;
    badge.innerHTML = `${pos} <span class="badge-count">${count}</span>`;

    badge.addEventListener("click", () => {
      const nuevoFiltro = (filtroActivo === pos) ? null : pos;
      callback(nuevoFiltro);
    });

    container.appendChild(badge);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Estados y persistencia de la sesión
  let activeTeamId = localStorage.getItem("fc26_active_team_id") || null;
  let currentOpenTeamId = sessionStorage.getItem("fc26_open_team_id") || null;
  let filtroPosicionActivo = null;

  // Estados de filtros para Fichajes Deseados
  let filtroFichajePosicion = null;
  let filtroFichajePrioridad = "";
  let filtroFichajeEstado = "";

  // ==========================================
  // ELEMENTOS DEL DOM - GENERALES Y NAVEGACIÓN
  // ==========================================
  const vistaDashboard = document.getElementById("vista-dashboard");
  const vistaEquipo = document.getElementById("vista-equipo");
  
  // Dashboard
  const crearForm = document.getElementById("crear-equipo-form");
  const nuevoNombreInput = document.getElementById("nuevo-equipo-nombre");
  const equiposGrid = document.getElementById("equipos-grid");
  const btnExportar = document.getElementById("btn-exportar");
  const activeSaveContainer = document.getElementById("carrera-activa-container");
  const activeTeamTitle = document.getElementById("active-team-title");
  const activeTeamSubtitle = document.getElementById("active-team-subtitle");

  // Detalle Equipo
  const btnVolverDashboard = document.getElementById("btn-volver-dashboard");
  const teamViewName = document.getElementById("team-view-name");
  const teamHeaderSquadCount = document.getElementById("team-header-squad-count");
  const teamHeaderTransfersCount = document.getElementById("team-header-transfers-count");
  const posicionesResumenContainer = document.getElementById("posiciones-resumen-container");
  const btnVerTodos = document.getElementById("btn-ver-todos");

  // Pestañas (Tabs)
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  // ==========================================
  // ELEMENTOS DEL DOM - CRUD DE PLANTILLA
  // ==========================================
  const formJugador = document.getElementById("form-jugador");
  const formJugadorTitulo = document.getElementById("form-jugador-titulo");
  const inputJugadorId = document.getElementById("jugador-id");
  const inputJugadorNombre = document.getElementById("jugador-nombre");
  const inputJugadorNacionalidad = document.getElementById("jugador-nacionalidad");
  const checkboxesPosicion = document.getElementsByName("posicion");
  const inputJugadorEdad = document.getElementById("jugador-edad");
  const inputJugadorDorsal = document.getElementById("jugador-dorsal");
  const selectJugadorEstado = document.getElementById("jugador-estado");
  const inputJugadorValoracion = document.getElementById("jugador-valoracion");
  const inputJugadorPotencial = document.getElementById("jugador-potencial");
  const inputJugadorContrato = document.getElementById("jugador-contrato");
  const inputJugadorValorMercado = document.getElementById("jugador-valormercado");
  const inputJugadorNotas = document.getElementById("jugador-notas");
  
  const btnCancelarJugador = document.getElementById("btn-cancelar-jugador");
  const btnGuardarJugador = document.getElementById("btn-guardar-jugador");
  const plantillaTbody = document.getElementById("plantilla-tbody");

  // ==========================================
  // ELEMENTOS DEL DOM - CRUD DE FICHAJES DESEADOS
  // ==========================================
  const formFichaje = document.getElementById("form-fichaje");
  const formFichajeTitulo = document.getElementById("form-fichaje-titulo");
  const inputFichajeId = document.getElementById("fichaje-id");
  const inputFichajeNombre = document.getElementById("fichaje-nombre");
  const inputFichajeClub = document.getElementById("fichaje-club");
  const checkboxesPosicionFichaje = document.getElementsByName("posicion-fichaje");
  const inputFichajeEdad = document.getElementById("fichaje-edad");
  const inputFichajeValorMercado = document.getElementById("fichaje-valormercado");
  const inputFichajeValoracion = document.getElementById("fichaje-valoracion");
  const inputFichajePotencial = document.getElementById("fichaje-potencial");
  const selectFichajePrioridad = document.getElementById("fichaje-prioridad");
  const selectFichajeEstado = document.getElementById("fichaje-estado");
  const inputFichajeNotas = document.getElementById("fichaje-notas");

  const btnCancelarFichaje = document.getElementById("btn-cancelar-fichaje");
  const btnGuardarFichaje = document.getElementById("btn-guardar-fichaje");
  const fichajesTbody = document.getElementById("fichajes-tbody");

  const posicionesResumenFichajesContainer = document.getElementById("posiciones-resumen-fichajes-container");
  const btnVerTodosFichajes = document.getElementById("btn-ver-todos-fichajes");
  const selectFiltroFichajePrioridad = document.getElementById("filtro-fichaje-prioridad");
  const selectFiltroFichajeEstado = document.getElementById("filtro-fichaje-estado");

  // ==========================================
  // ELEMENTOS DEL DOM - MODALES PERSONALIZADOS
  // ==========================================
  
  // Modal Renombrar Equipo
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-equipo-form");
  const editIdInput = document.getElementById("edit-equipo-id");
  const editNombreInput = document.getElementById("edit-equipo-nombre");
  const btnCancelarEdit = document.getElementById("btn-cancelar-edit");

  // Modal Eliminar Equipo
  const confirmModal = document.getElementById("confirm-modal");
  const deleteIdInput = document.getElementById("delete-equipo-id");
  const deleteNombreDisplay = document.getElementById("delete-equipo-nombre");
  const btnCancelarDelete = document.getElementById("btn-cancelar-delete");
  const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");

  // Modal Eliminar Jugador
  const confirmJugadorModal = document.getElementById("confirm-jugador-modal");
  const deleteJugadorIdInput = document.getElementById("delete-jugador-id");
  const deleteJugadorEquipoIdInput = document.getElementById("delete-jugador-equipo-id");
  const deleteJugadorNombreDisplay = document.getElementById("delete-jugador-nombre");
  const btnCancelarDeleteJugador = document.getElementById("btn-cancelar-delete-jugador");
  const btnConfirmarDeleteJugador = document.getElementById("btn-confirmar-delete-jugador");

  // Modal Eliminar Fichaje
  const confirmFichajeModal = document.getElementById("confirm-fichaje-modal");
  const deleteFichajeIdInput = document.getElementById("delete-fichaje-id");
  const deleteFichajeEquipoIdInput = document.getElementById("delete-fichaje-equipo-id");
  const deleteFichajeNombreDisplay = document.getElementById("delete-fichaje-nombre");
  const btnCancelarDeleteFichaje = document.getElementById("btn-cancelar-delete-fichaje");
  const btnConfirmarDeleteFichaje = document.getElementById("btn-confirmar-delete-fichaje");

  // Elementos DOM de Información General y Bitácora
  const formInfoGeneral = document.getElementById("form-info-general");
  const inputInfoLiga = document.getElementById("info-liga");
  const inputInfoPresupuestoTransferencias = document.getElementById("info-presupuesto-transferencias");
  const inputInfoPresupuestoSalarial = document.getElementById("info-presupuesto-salarial");
  const inputInfoObjetivoTemporada = document.getElementById("info-objetivo-temporada");
  const inputInfoObjetivoLargoPlazo = document.getElementById("info-objetivo-largo-plazo");

  const listaReglasPropias = document.getElementById("lista-reglas-propias");
  const formAgregarRegla = document.getElementById("form-agregar-regla");
  const inputNuevaReglaTexto = document.getElementById("nueva-regla-texto");

  const formAgregarNota = document.getElementById("form-agregar-nota");
  const inputNuevaNotaTexto = document.getElementById("nueva-nota-texto");
  const feedNotas = document.getElementById("feed-notas");

  // Modal Delete Nota
  const confirmNotaModal = document.getElementById("confirm-nota-modal");
  const deleteNotaIndexInput = document.getElementById("delete-nota-index");
  const deleteNotaEquipoIdInput = document.getElementById("delete-nota-equipo-id");
  const deleteNotaPreviewDisplay = document.getElementById("delete-nota-preview");
  const btnCancelarDeleteNota = document.getElementById("btn-cancelar-delete-nota");
  const btnConfirmarDeleteNota = document.getElementById("btn-confirmar-delete-nota");

  // ==========================================
  // 1. CONTROL DE NAVEGACIÓN Y TABS
  // ==========================================

  /**
   * Abre la vista detallada de un equipo.
   * @param {string} id - ID del equipo a abrir.
   */
  function abrirVistaEquipo(id) {
    const equipo = getEquipoById(id);
    if (!equipo) {
      cerrarVistaEquipo();
      return;
    }

    currentOpenTeamId = id;
    sessionStorage.setItem("fc26_open_team_id", id);
    filtroPosicionActivo = null;

    // Configurar contenidos de cabecera
    teamViewName.textContent = equipo.nombre;
    actualizarHeaderContadores(equipo);

    // Ocultar Dashboard, Mostrar Vista de Equipo
    vistaDashboard.style.display = "none";
    vistaEquipo.style.display = "block";

    // Por defecto abrimos la pestaña Plantilla
    cambiarPestana("tab-plantilla");

    // Limpiar filtros de Fichajes Deseados al abrir equipo
    filtroFichajePosicion = null;
    filtroFichajePrioridad = "";
    filtroFichajeEstado = "";
    if (selectFiltroFichajePrioridad) selectFiltroFichajePrioridad.value = "";
    if (selectFiltroFichajeEstado) selectFiltroFichajeEstado.value = "";

    // Limpiar formulario y renderizar la plantilla actual del club
    resetFormularioJugador();
    resetFormularioFichaje();
    renderPlantilla();
    renderFichajes();
    renderInfoGeneral();
  }

  /**
   * Cierra la vista del equipo y vuelve al Dashboard principal.
   */
  function cerrarVistaEquipo() {
    currentOpenTeamId = null;
    sessionStorage.removeItem("fc26_open_team_id");

    vistaEquipo.style.display = "none";
    vistaDashboard.style.display = "block";

    // Sincronizar listados y banner activo
    renderEquipos();
    if (activeTeamId) {
      seleccionarEquipo(activeTeamId);
    }
  }

  /**
   * Cambia el panel de contenido visible de las pestañas internas.
   * @param {string} tabId - ID de la pestaña a activar.
   */
  function cambiarPestana(tabId) {
    // Desactivar todos los botones y paneles
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabPanels.forEach(panel => panel.classList.remove("active"));

    // Activar el correspondiente
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const activePanel = document.getElementById(tabId);

    if (activeBtn && activePanel) {
      activeBtn.classList.add("active");
      activePanel.classList.add("active");
    }

    if (tabId === "tab-info") {
      renderInfoGeneral();
    }
  }

  /**
   * Sincroniza los contadores de la cabecera del equipo abierto.
   * @param {Object} equipo - El equipo actual.
   */
  function actualizarHeaderContadores(equipo) {
    if (!equipo) return;
    const squadCount = equipo.plantilla ? equipo.plantilla.length : 0;
    const transfersCount = equipo.fichajesDeseados ? equipo.fichajesDeseados.length : 0;

    teamHeaderSquadCount.textContent = squadCount;
    teamHeaderTransfersCount.textContent = transfersCount;
  }

  // Enlazar clics de las pestañas
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      cambiarPestana(tabId);
    });
  });

  // Enlazar botón volver
  btnVolverDashboard.addEventListener("click", cerrarVistaEquipo);

  // ==========================================
  // 2. GESTIÓN DE SELECCIÓN EN DASHBOARD (Save Activo)
  // ==========================================

  function seleccionarEquipo(id) {
    if (!id) {
      activeTeamId = null;
      localStorage.removeItem("fc26_active_team_id");
      activeSaveContainer.classList.remove("active");
      activeTeamTitle.textContent = "Ninguna carrera seleccionada";
      activeTeamSubtitle.textContent = "Haz clic en una de tus carreras abajo para empezar a planificar tu plantilla o haz clic en Gestionar.";
      return;
    }

    const equipo = getEquipoById(id);
    if (!equipo) {
      seleccionarEquipo(null);
      return;
    }

    activeTeamId = id;
    localStorage.setItem("fc26_active_team_id", id);

    activeSaveContainer.classList.add("active");
    activeTeamTitle.textContent = equipo.nombre;

    const totalPlantilla = equipo.plantilla ? equipo.plantilla.length : 0;
    const totalFichajes = equipo.fichajesDeseados ? equipo.fichajesDeseados.length : 0;
    activeTeamSubtitle.textContent = `Plantilla: ${totalPlantilla} jugadores | Fichajes en carpeta: ${totalFichajes} jugadores. (Fase 3: Gestión completa próximamente)`;
  }

  // ==========================================
  // 3. RENDERIZADO DEL DASHBOARD (Lista de Equipos)
  // ==========================================

  function renderEquipos() {
    const equipos = getEquipos();
    equiposGrid.innerHTML = "";

    if (activeTeamId && !equipos.some(e => e.id === activeTeamId)) {
      seleccionarEquipo(null);
    }

    if (equipos.length === 0) {
      equiposGrid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state-title">Tu pizarra de director técnico está vacía</h3>
          <p class="empty-state-text">¡Crea tu primer save de modo carrera escribiendo el nombre de tu club arriba!</p>
        </div>
      `;
      return;
    }

    equipos.forEach(equipo => {
      const totalPlantilla = equipo.plantilla ? equipo.plantilla.length : 0;
      const totalFichajes = equipo.fichajesDeseados ? equipo.fichajesDeseados.length : 0;
      const esActivo = equipo.id === activeTeamId;

      const card = document.createElement("div");
      card.className = `team-card ${esActivo ? "active-save" : ""}`;
      card.innerHTML = `
        <div class="team-card-header">
          <h3 class="team-card-title" title="${equipo.nombre}">${equipo.nombre}</h3>
          ${esActivo ? `<span class="active-save-badge">Activo</span>` : ""}
        </div>
        
        <div class="team-stats">
          <div class="stat-item">
            <span class="stat-label">Plantilla</span>
            <span class="stat-value">${totalPlantilla}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Fichajes</span>
            <span class="stat-value">${totalFichajes}</span>
          </div>
        </div>

        <div class="team-actions">
          <button class="btn btn-primary btn-gestionar" data-id="${equipo.id}">
            Gestionar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div class="actions-left">
            <button class="btn btn-secondary btn-icon btn-renombrar" data-id="${equipo.id}" data-nombre="${equipo.nombre}" title="Renombrar club">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
            </button>
            <button class="btn btn-danger btn-icon btn-eliminar" data-id="${equipo.id}" data-nombre="${equipo.nombre}" title="Eliminar carrera">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".team-actions") || e.target.closest(".btn-icon")) {
          return;
        }
        seleccionarEquipo(equipo.id);
        renderEquipos();
      });

      equiposGrid.appendChild(card);
    });

    // Eventos de botones en tarjetas
    equiposGrid.querySelectorAll(".btn-gestionar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        seleccionarEquipo(id);
        abrirVistaEquipo(id);
      });
    });

    equiposGrid.querySelectorAll(".btn-renombrar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        const nombre = e.currentTarget.getAttribute("data-nombre");
        abrirModalRenombrar(id, nombre);
      });
    });

    equiposGrid.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        const nombre = e.currentTarget.getAttribute("data-nombre");
        abrirModalConfirmacion(id, nombre);
      });
    });
  }

  // ==========================================
  // 4. CRUD DE PLANTILLA (JUGADORES)
  // ==========================================

  /**
   * Renderiza el listado de jugadores del equipo abierto en la tabla.
   */
  function renderPlantilla() {
    plantillaTbody.innerHTML = "";
    const equipo = getEquipoById(currentOpenTeamId);
    if (!equipo) return;

    actualizarHeaderContadores(equipo);

    const jugadores = equipo.plantilla || [];

    // --- CONTEO Y RENDERIZADO DE BADGES POR POSICIÓN ---
    renderizarBadgesPosicion(jugadores, posicionesResumenContainer, filtroPosicionActivo, (pos) => {
      filtroPosicionActivo = pos;
      renderPlantilla();
    });

    // Controlar visibilidad del botón "Ver todos"
    if (filtroPosicionActivo) {
      btnVerTodos.style.display = "inline-flex";
    } else {
      btnVerTodos.style.display = "none";
    }

    // Filtrar jugadores según la posición activa
    let jugadoresFiltrados = [...jugadores];
    if (filtroPosicionActivo) {
      jugadoresFiltrados = jugadores.filter(j => j.posiciones && j.posiciones.includes(filtroPosicionActivo));
    }

    if (jugadoresFiltrados.length === 0) {
      const msg = filtroPosicionActivo
        ? `No hay jugadores registrados en la posición ${filtroPosicionActivo}.`
        : "No hay jugadores registrados en la plantilla. ¡Agrégalos usando el formulario de la izquierda!";
      
      plantillaTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            ${msg}
          </td>
        </tr>
      `;
      return;
    }

    // Ordenar jugadores por dorsal
    const jugadoresOrdenados = jugadoresFiltrados.sort((a, b) => a.dorsal - b.dorsal);

    jugadoresOrdenados.forEach(jugador => {
      // Posiciones con badges
      const posBadges = jugador.posiciones.map(pos => `<span class="player-position-badge">${pos}</span>`).join("");
      
      // Determinar clase de estado
      let estadoClass = "status-rotacion";
      if (jugador.estado === "Titular") estadoClass = "status-titular";
      if (jugador.estado === "Suplente") estadoClass = "status-suplente";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align: center; font-weight: 700; color: #ffffff;">${jugador.dorsal}</td>
        <td>
          <div style="font-weight: 600; color: #ffffff;">${jugador.nombre}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${jugador.nacionalidad}</div>
        </td>
        <td>${posBadges}</td>
        <td style="text-align: center;">${jugador.edad}</td>
        <td style="text-align: center; font-weight: bold; color: var(--primary);">${jugador.valoracion}</td>
        <td style="text-align: right; font-weight: 500; color: #ffffff;">${formatearMonedaCompacta(jugador.valorMercado)}</td>
        <td style="text-align: center;"><span class="player-status-badge ${estadoClass}">${jugador.estado}</span></td>
        <td>
          <div class="player-actions">
            <button class="btn btn-secondary btn-icon btn-editar-jugador" data-id="${jugador.id}" title="Editar jugador">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
            </button>
            <button class="btn btn-danger btn-icon btn-eliminar-jugador" data-id="${jugador.id}" data-nombre="${jugador.nombre}" title="Eliminar jugador">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      `;

      // Enlazar botones de edición y eliminación
      tr.querySelector(".btn-editar-jugador").addEventListener("click", () => {
        cargarJugadorEnFormulario(jugador);
      });

      tr.querySelector(".btn-eliminar-jugador").addEventListener("click", () => {
        abrirModalEliminarJugador(jugador.id, jugador.nombre);
      });

      plantillaTbody.appendChild(tr);
    });
  }

  /**
   * Resetea el formulario de jugador a su estado inicial.
   */
  function resetFormularioJugador() {
    formJugador.reset();
    inputJugadorId.value = "";
    formJugadorTitulo.textContent = "Agregar Jugador";
    btnCancelarJugador.style.display = "none";
    btnGuardarJugador.textContent = "Guardar Jugador";
    
    // Desmarcar checkboxes
    checkboxesPosicion.forEach(cb => cb.checked = false);
  }

  /**
   * Carga los datos de un jugador en el formulario para editarlo.
   * @param {Object} jugador - Datos del jugador.
   */
  function cargarJugadorEnFormulario(jugador) {
    formJugadorTitulo.textContent = "Editar Jugador";
    btnCancelarJugador.style.display = "inline-flex";
    btnGuardarJugador.textContent = "Actualizar Jugador";

    inputJugadorId.value = jugador.id;
    inputJugadorNombre.value = jugador.nombre;
    inputJugadorNacionalidad.value = jugador.nacionalidad;
    inputJugadorEdad.value = jugador.edad;
    inputJugadorDorsal.value = jugador.dorsal;
    selectJugadorEstado.value = jugador.estado;
    inputJugadorValoracion.value = jugador.valoracion;
    inputJugadorPotencial.value = jugador.potencial;
    inputJugadorContrato.value = jugador.contratoAniosRestantes;
    inputJugadorValorMercado.value = jugador.valorMercado;
    inputJugadorNotas.value = jugador.notas || "";

    // Cargar posiciones marcadas
    checkboxesPosicion.forEach(cb => {
      cb.checked = jugador.posiciones.includes(cb.value);
    });

    // Hacer scroll al formulario
    formJugador.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Manejar el submit del formulario de jugador (Agregar/Editar)
  formJugador.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Obtener posiciones seleccionadas
    const posicionesSeleccionadas = [];
    checkboxesPosicion.forEach(cb => {
      if (cb.checked) posicionesSeleccionadas.push(cb.value);
    });

    if (posicionesSeleccionadas.length === 0) {
      alert("Debes elegir al menos una posición para el jugador.");
      return;
    }

    const jugadorData = {
      nombre: inputJugadorNombre.value.trim(),
      nacionalidad: inputJugadorNacionalidad.value.trim(),
      posiciones: posicionesSeleccionadas,
      edad: Number(inputJugadorEdad.value),
      dorsal: Number(inputJugadorDorsal.value),
      estado: selectJugadorEstado.value,
      valoracion: Number(inputJugadorValoracion.value),
      potencial: Number(inputJugadorPotencial.value),
      contratoAniosRestantes: Number(inputJugadorContrato.value),
      valorMercado: Number(inputJugadorValorMercado.value),
      notas: inputJugadorNotas.value.trim()
    };

    const jugadorId = inputJugadorId.value;

    try {
      if (jugadorId) {
        // Modo Edición
        editarJugador(currentOpenTeamId, jugadorId, jugadorData);
      } else {
        // Modo Agregar
        agregarJugador(currentOpenTeamId, jugadorData);
      }

      // Limpiar y renderizar
      resetFormularioJugador();
      renderPlantilla();
    } catch (error) {
      alert(error.message);
    }
  });

  // Cancelar edición
  btnCancelarJugador.addEventListener("click", resetFormularioJugador);

  // ==========================================
  // 5. CONTROL DE MODALES PERSONALIZADOS
  // ==========================================

  // Modal Renombrar Equipo
  function abrirModalRenombrar(id, nombre) {
    editIdInput.value = id;
    editNombreInput.value = nombre;
    editModal.classList.add("active");
    setTimeout(() => editNombreInput.focus(), 100);
  }

  function cerrarModalRenombrar() {
    editModal.classList.remove("active");
    editForm.reset();
  }

  // Modal Confirmación Eliminar Equipo
  function abrirModalConfirmacion(id, nombre) {
    deleteIdInput.value = id;
    deleteNombreDisplay.textContent = nombre;
    confirmModal.classList.add("active");
  }

  function cerrarModalConfirmacion() {
    confirmModal.classList.remove("active");
    deleteNombreDisplay.textContent = "";
    deleteIdInput.value = "";
  }

  // Modal Confirmación Eliminar Jugador
  function abrirModalEliminarJugador(id, nombre) {
    deleteJugadorIdInput.value = id;
    deleteJugadorEquipoIdInput.value = currentOpenTeamId;
    deleteJugadorNombreDisplay.textContent = nombre;
    confirmJugadorModal.classList.add("active");
  }

  function cerrarModalEliminarJugador() {
    confirmJugadorModal.classList.remove("active");
    deleteJugadorNombreDisplay.textContent = "";
    deleteJugadorIdInput.value = "";
    deleteJugadorEquipoIdInput.value = "";
  }

  // ==========================================
  // 6. EVENT LISTENERS - GENERALES Y MODALES
  // ==========================================

  // Crear Equipo nuevo
  crearForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = nuevoNombreInput.value.trim();
    if (nombre) {
      try {
        const nuevoClub = crearEquipo(nombre);
        nuevoNombreInput.value = "";
        
        seleccionarEquipo(nuevoClub.id);
        renderEquipos();
        // Abrir automáticamente el nuevo equipo para una mejor UX
        abrirVistaEquipo(nuevoClub.id);
      } catch (error) {
        alert(error.message);
      }
    }
  });

  // Guardar cambio de nombre en el modal
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const nuevoNombre = editNombreInput.value.trim();

    if (id && nuevoNombre) {
      try {
        editarNombreEquipo(id, nuevoNombre);
        cerrarModalRenombrar();
        
        if (id === activeTeamId) {
          seleccionarEquipo(id);
        }
        
        renderEquipos();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  // Confirmar eliminación del equipo
  btnConfirmarDelete.addEventListener("click", () => {
    const id = deleteIdInput.value;
    if (id) {
      try {
        eliminarEquipo(id);
        
        if (id === activeTeamId) {
          seleccionarEquipo(null);
        }
        
        cerrarModalConfirmacion();
        renderEquipos();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  // Confirmar eliminación de jugador
  btnConfirmarDeleteJugador.addEventListener("click", () => {
    const jugadorId = deleteJugadorIdInput.value;
    const equipoId = deleteJugadorEquipoIdInput.value;
    
    if (jugadorId && equipoId) {
      try {
        eliminarJugador(equipoId, jugadorId);
        cerrarModalEliminarJugador();
        renderPlantilla();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  // Cancelar modales
  btnCancelarEdit.addEventListener("click", cerrarModalRenombrar);
  btnCancelarDelete.addEventListener("click", cerrarModalConfirmacion);
  btnCancelarDeleteJugador.addEventListener("click", cerrarModalEliminarJugador);
  btnCancelarDeleteFichaje.addEventListener("click", cerrarModalEliminarFichaje);
  btnCancelarDeleteNota.addEventListener("click", cerrarModalEliminarNota);

  // Cerrar modales haciendo click fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === editModal) cerrarModalRenombrar();
    if (e.target === confirmModal) cerrarModalConfirmacion();
    if (e.target === confirmJugadorModal) cerrarModalEliminarJugador();
    if (e.target === confirmFichajeModal) cerrarModalEliminarFichaje();
    if (e.target === confirmNotaModal) cerrarModalEliminarNota();
  });

  // Exportar respaldo JSON
  btnExportar.addEventListener("click", () => {
    exportarStorageJSON();
  });

  // Limpiar filtro de posiciones
  btnVerTodos.addEventListener("click", () => {
    filtroPosicionActivo = null;
    renderPlantilla();
  });

  // ==========================================
  // LÓGICA DE FICHAJES DESEADOS
  // ==========================================

  /**
   * Renderiza el listado de fichajes deseados en la tabla con sus filtros.
   */
  function renderFichajes() {
    fichajesTbody.innerHTML = "";
    const equipo = getEquipoById(currentOpenTeamId);
    if (!equipo) return;

    actualizarHeaderContadores(equipo);

    const fichajes = equipo.fichajesDeseados || [];

    // Renderizar los badges de posiciones
    renderizarBadgesPosicion(fichajes, posicionesResumenFichajesContainer, filtroFichajePosicion, (pos) => {
      filtroFichajePosicion = pos;
      renderFichajes();
    });

    // Controlar visibilidad del botón "Ver todos" en fichajes
    const algunFiltroActivo = filtroFichajePosicion || filtroFichajePrioridad || filtroFichajeEstado;
    if (algunFiltroActivo) {
      btnVerTodosFichajes.style.display = "inline-flex";
    } else {
      btnVerTodosFichajes.style.display = "none";
    }

    // Filtrar fichajes combinadamente
    let filtered = [...fichajes];

    if (filtroFichajePosicion) {
      filtered = filtered.filter(f => f.posiciones && f.posiciones.includes(filtroFichajePosicion));
    }
    if (filtroFichajePrioridad) {
      filtered = filtered.filter(f => f.prioridad === filtroFichajePrioridad);
    }
    if (filtroFichajeEstado) {
      filtered = filtered.filter(f => f.estado === filtroFichajeEstado);
    }

    if (filtered.length === 0) {
      let msg = "No hay fichajes en carpeta con los filtros seleccionados.";
      if (fichajes.length === 0) {
        msg = "No hay fichajes en tu carpeta de seguimiento. ¡Agrégalos usando el formulario de la izquierda!";
      }
      fichajesTbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            ${msg}
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(fichaje => {
      const posBadges = fichaje.posiciones.map(pos => `<span class="player-position-badge">${pos}</span>`).join("");
      
      let prioridadClass = "priority-baja";
      if (fichaje.prioridad === "Alta") prioridadClass = "priority-alta";
      if (fichaje.prioridad === "Media") prioridadClass = "priority-media";

      let estadoClass = "status-fichaje-pendiente";
      if (fichaje.estado === "En negociación") estadoClass = "status-fichaje-negociacion";
      if (fichaje.estado === "Fichado") estadoClass = "status-fichaje-fichado";
      if (fichaje.estado === "Descartado") estadoClass = "status-fichaje-descartado";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: #ffffff;">${fichaje.nombre}</div>
        </td>
        <td>
          <div style="color: #ffffff;">${fichaje.clubActual}</div>
        </td>
        <td>${posBadges}</td>
        <td style="text-align: center;">${fichaje.edad}</td>
        <td style="text-align: center; font-weight: bold; color: var(--primary);">${fichaje.valoracion}</td>
        <td style="text-align: center; font-weight: bold; color: var(--accent);">${fichaje.potencial}</td>
        <td style="text-align: right; font-weight: 500; color: #ffffff;">${formatearMonedaCompacta(fichaje.valorMercadoEstimado)}</td>
        <td style="text-align: center;"><span class="priority-badge ${prioridadClass}">${fichaje.prioridad}</span></td>
        <td style="text-align: center;"><span class="status-fichaje-badge ${estadoClass}">${fichaje.estado}</span></td>
        <td>
          <div class="player-actions">
            <button class="btn btn-secondary btn-icon btn-editar-fichaje" data-id="${fichaje.id}" title="Editar fichaje">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
            </button>
            <button class="btn btn-danger btn-icon btn-eliminar-fichaje" data-id="${fichaje.id}" data-nombre="${fichaje.nombre}" title="Eliminar fichaje">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector(".btn-editar-fichaje").addEventListener("click", () => {
        cargarFichajeEnFormulario(fichaje);
      });

      tr.querySelector(".btn-eliminar-fichaje").addEventListener("click", () => {
        abrirModalEliminarFichaje(fichaje.id, fichaje.nombre);
      });

      fichajesTbody.appendChild(tr);
    });
  }

  /**
   * Resetea el formulario de fichaje a su estado inicial.
   */
  function resetFormularioFichaje() {
    formFichaje.reset();
    inputFichajeId.value = "";
    formFichajeTitulo.textContent = "Agregar Fichaje Deseado";
    btnCancelarFichaje.style.display = "none";
    btnGuardarFichaje.textContent = "Guardar Fichaje";
    checkboxesPosicionFichaje.forEach(cb => cb.checked = false);
  }

  /**
   * Carga los datos de un fichaje en el formulario para editarlo.
   */
  function cargarFichajeEnFormulario(fichaje) {
    formFichajeTitulo.textContent = "Editar Fichaje Deseado";
    btnCancelarFichaje.style.display = "inline-flex";
    btnGuardarFichaje.textContent = "Actualizar Fichaje";

    inputFichajeId.value = fichaje.id;
    inputFichajeNombre.value = fichaje.nombre;
    inputFichajeClub.value = fichaje.clubActual;
    inputFichajeEdad.value = fichaje.edad;
    inputFichajeValorMercado.value = fichaje.valorMercadoEstimado;
    inputFichajeValoracion.value = fichaje.valoracion;
    inputFichajePotencial.value = fichaje.potencial;
    selectFichajePrioridad.value = fichaje.prioridad;
    selectFichajeEstado.value = fichaje.estado;
    inputFichajeNotas.value = fichaje.notes || fichaje.notas || "";

    checkboxesPosicionFichaje.forEach(cb => {
      cb.checked = fichaje.posiciones.includes(cb.value);
    });

    formFichaje.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Modal Confirmación Eliminar Fichaje
  function abrirModalEliminarFichaje(id, nombre) {
    deleteFichajeIdInput.value = id;
    deleteFichajeEquipoIdInput.value = currentOpenTeamId;
    deleteFichajeNombreDisplay.textContent = nombre;
    confirmFichajeModal.classList.add("active");
  }

  function cerrarModalEliminarFichaje() {
    confirmFichajeModal.classList.remove("active");
    deleteFichajeNombreDisplay.textContent = "";
    deleteFichajeIdInput.value = "";
    deleteFichajeEquipoIdInput.value = "";
  }

  // Submit del formulario de fichaje
  formFichaje.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const posicionesSeleccionadas = [];
    checkboxesPosicionFichaje.forEach(cb => {
      if (cb.checked) posicionesSeleccionadas.push(cb.value);
    });

    if (posicionesSeleccionadas.length === 0) {
      alert("Debes elegir al menos una posición para el fichaje.");
      return;
    }

    const fichajeData = {
      nombre: inputFichajeNombre.value.trim(),
      clubActual: inputFichajeClub.value.trim(),
      posiciones: posicionesSeleccionadas,
      edad: Number(inputFichajeEdad.value),
      valoracion: Number(inputFichajeValoracion.value),
      potencial: Number(inputFichajePotencial.value),
      valorMercadoEstimado: Number(inputFichajeValorMercado.value),
      prioridad: selectFichajePrioridad.value,
      estado: selectFichajeEstado.value,
      notas: inputFichajeNotas.value.trim()
    };

    const fichajeId = inputFichajeId.value;

    try {
      if (fichajeId) {
        editarFichajeDeseado(currentOpenTeamId, fichajeId, fichajeData);
      } else {
        agregarFichajeDeseado(currentOpenTeamId, fichajeData);
      }

      resetFormularioFichaje();
      renderFichajes();
    } catch (error) {
      alert(error.message);
    }
  });

  btnCancelarFichaje.addEventListener("click", resetFormularioFichaje);

  // Confirmar eliminación
  btnConfirmarDeleteFichaje.addEventListener("click", () => {
    const fichajeId = deleteFichajeIdInput.value;
    const equipoId = deleteFichajeEquipoIdInput.value;
    
    if (fichajeId && equipoId) {
      try {
        eliminarFichajeDeseado(equipoId, fichajeId);
        cerrarModalEliminarFichaje();
        renderFichajes();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  // Filtros combinados de Fichajes
  selectFiltroFichajePrioridad.addEventListener("change", (e) => {
    filtroFichajePrioridad = e.target.value;
    renderFichajes();
  });

  selectFiltroFichajeEstado.addEventListener("change", (e) => {
    filtroFichajeEstado = e.target.value;
    renderFichajes();
  });

  btnVerTodosFichajes.addEventListener("click", () => {
    filtroFichajePosicion = null;
    filtroFichajePrioridad = "";
    filtroFichajeEstado = "";
    selectFiltroFichajePrioridad.value = "";
    selectFiltroFichajeEstado.value = "";
    renderFichajes();
  });

  // ==========================================
  // LÓGICA DE INFORMACIÓN GENERAL Y BITÁCORA
  // ==========================================

  /**
   * Renderiza la información general del equipo abierto, incluyendo
   * datos del club, reglas y bitácora.
   */
  function renderInfoGeneral() {
    const equipo = getEquipoById(currentOpenTeamId);
    if (!equipo) return;

    const info = equipo.infoGeneral || {};

    // Carga de campos del club (solo si no están activos)
    if (document.activeElement !== inputInfoLiga) {
      inputInfoLiga.value = info.divisionLiga || "";
    }
    if (document.activeElement !== inputInfoPresupuestoTransferencias) {
      inputInfoPresupuestoTransferencias.value = info.presupuestoTransferencias !== undefined && info.presupuestoTransferencias !== 0 ? info.presupuestoTransferencias : "";
    }
    if (document.activeElement !== inputInfoPresupuestoSalarial) {
      inputInfoPresupuestoSalarial.value = info.presupuestoSalarial !== undefined && info.presupuestoSalarial !== 0 ? info.presupuestoSalarial : "";
    }
    if (document.activeElement !== inputInfoObjetivoTemporada) {
      inputInfoObjetivoTemporada.value = info.objetivoTemporada || "";
    }
    if (document.activeElement !== inputInfoObjetivoLargoPlazo) {
      inputInfoObjetivoLargoPlazo.value = info.objetivoLargoPlazo || "";
    }

    // Renderizado de Reglas Propias
    listaReglasPropias.innerHTML = "";
    const reglas = info.reglasPropias || [];

    if (reglas.length === 0) {
      listaReglasPropias.innerHTML = `
        <li style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem; text-align: center;">
          No tienes ninguna regla agregada todavía.
        </li>
      `;
    } else {
      reglas.forEach((regla, index) => {
        const li = document.createElement("li");
        li.className = "rule-item";
        li.innerHTML = `
          <span class="rule-text">${regla}</span>
          <button class="btn btn-danger btn-icon btn-eliminar-regla" data-index="${index}" title="Eliminar regla">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        `;
        
        li.querySelector(".btn-eliminar-regla").addEventListener("click", () => {
          eliminarReglaSave(index);
        });

        listaReglasPropias.appendChild(li);
      });
    }

    // Renderizado de la Bitácora de Notas (orden descendente)
    feedNotas.innerHTML = "";
    const notas = info.notas || [];

    if (notas.length === 0) {
      feedNotas.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.85rem; padding: 2rem 1rem; text-align: center;">
          No hay notas en la bitácora todavía.
        </div>
      `;
    } else {
      const notasConIndices = notas.map((nota, index) => ({ nota, index }));
      const notasOrdenadas = [...notasConIndices].reverse();

      notasOrdenadas.forEach(({ nota, index }) => {
        const card = document.createElement("div");
        card.className = "note-card";
        card.innerHTML = `
          <div class="note-card-header">
            <span class="note-date">${nota.fecha}</span>
            <button class="btn btn-danger btn-icon btn-eliminar-nota" data-index="${index}" data-preview="${nota.texto.substring(0, 40)}" title="Eliminar nota">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
          <div class="note-text">${nota.texto}</div>
        `;

        card.querySelector(".btn-eliminar-nota").addEventListener("click", () => {
          const preview = card.querySelector(".btn-eliminar-nota").getAttribute("data-preview");
          abrirModalEliminarNota(index, preview);
        });

        feedNotas.appendChild(card);
      });
    }
  }

  /**
   * Guarda los datos generales en localStorage
   */
  formInfoGeneral.addEventListener("submit", (e) => {
    e.preventDefault();

    const infoGeneralData = {
      divisionLiga: inputInfoLiga.value.trim(),
      presupuestoTransferencias: Number(inputInfoPresupuestoTransferencias.value),
      presupuestoSalarial: Number(inputInfoPresupuestoSalarial.value),
      objetivoTemporada: inputInfoObjetivoTemporada.value.trim(),
      objetivoLargoPlazo: inputInfoObjetivoLargoPlazo.value.trim()
    };

    try {
      actualizarInfoGeneral(currentOpenTeamId, infoGeneralData);
      alert("Cambios guardados con éxito.");
      renderInfoGeneral();
      if (currentOpenTeamId === activeTeamId) {
        seleccionarEquipo(activeTeamId);
      }
    } catch (error) {
      alert(error.message);
    }
  });

  /**
   * Agrega una regla al save
   */
  formAgregarRegla.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = inputNuevaReglaTexto.value.trim();
    if (!texto) return;

    const equipo = getEquipoById(currentOpenTeamId);
    if (!equipo) return;

    const info = equipo.infoGeneral || {};
    const reglas = [...(info.reglasPropias || [])];
    reglas.push(texto);

    try {
      actualizarInfoGeneral(currentOpenTeamId, { reglasPropias: reglas });
      inputNuevaReglaTexto.value = "";
      renderInfoGeneral();
    } catch (error) {
      alert(error.message);
    }
  });

  /**
   * Elimina una regla por su índice
   */
  function eliminarReglaSave(index) {
    const equipo = getEquipoById(currentOpenTeamId);
    if (!equipo) return;

    const info = equipo.infoGeneral || {};
    const reglas = [...(info.reglasPropias || [])];
    reglas.splice(index, 1);

    try {
      actualizarInfoGeneral(currentOpenTeamId, { reglasPropias: reglas });
      renderInfoGeneral();
    } catch (error) {
      alert(error.message);
    }
  }

  /**
   * Agrega una nota a la bitácora
   */
  formAgregarNota.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = inputNuevaNotaTexto.value.trim();
    if (!texto) return;

    const equipo = getEquipoById(currentOpenTeamId);
    if (!equipo) return;

    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    const fechaStr = `${anio}-${mes}-${dia}`;

    const info = equipo.infoGeneral || {};
    const notas = [...(info.notas || [])];
    notas.push({ fecha: fechaStr, texto: texto });

    try {
      actualizarInfoGeneral(currentOpenTeamId, { notas: notas });
      inputNuevaNotaTexto.value = "";
      renderInfoGeneral();
    } catch (error) {
      alert(error.message);
    }
  });

  // Modal Confirmación Eliminar Nota
  function abrirModalEliminarNota(index, preview) {
    deleteNotaIndexInput.value = index;
    deleteNotaEquipoIdInput.value = currentOpenTeamId;
    deleteNotaPreviewDisplay.textContent = `"${preview}..."`;
    confirmNotaModal.classList.add("active");
  }

  function cerrarModalEliminarNota() {
    confirmNotaModal.classList.remove("active");
    deleteNotaPreviewDisplay.textContent = "";
    deleteNotaIndexInput.value = "";
    deleteNotaEquipoIdInput.value = "";
  }

  btnConfirmarDeleteNota.addEventListener("click", () => {
    const index = parseInt(deleteNotaIndexInput.value, 10);
    const equipoId = deleteNotaEquipoIdInput.value;

    if (!isNaN(index) && equipoId) {
      const equipo = getEquipoById(equipoId);
      if (equipo) {
        const info = equipo.infoGeneral || {};
        const notas = [...(info.notas || [])];
        notas.splice(index, 1);

        try {
          actualizarInfoGeneral(equipoId, { notas: notas });
          cerrarModalEliminarNota();
          renderInfoGeneral();
        } catch (error) {
          alert(error.message);
        }
      }
    }
  });

  // ==========================================
  // 7. INICIALIZACIÓN
  // ==========================================
  renderEquipos();
  
  if (activeTeamId) {
    seleccionarEquipo(activeTeamId);
  }

  // Restaurar sesión de equipo abierto si existe en sessionStorage
  if (currentOpenTeamId) {
    abrirVistaEquipo(currentOpenTeamId);
  }
});
