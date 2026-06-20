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

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // ESTADOS Y PERSISTENCIA DE LA APLICACIÓN
  // ==========================================
  let activeTeamId = localStorage.getItem("fc26_active_team_id") || null;
  let currentOpenTeamId = sessionStorage.getItem("fc26_open_team_id") || null;

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

    // Configurar contenidos de cabecera
    teamViewName.textContent = equipo.nombre;
    actualizarHeaderContadores(equipo);

    // Ocultar Dashboard, Mostrar Vista de Equipo
    vistaDashboard.style.display = "none";
    vistaEquipo.style.display = "block";

    // Por defecto abrimos la pestaña Plantilla
    cambiarPestana("tab-plantilla");

    // Limpiar formulario y renderizar la plantilla actual del club
    resetFormularioJugador();
    renderPlantilla();
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

    if (jugadores.length === 0) {
      plantillaTbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
            No hay jugadores registrados en la plantilla. ¡Agrégalos usando el formulario de la izquierda!
          </td>
        </tr>
      `;
      return;
    }

    // Ordenar jugadores por dorsal
    const jugadoresOrdenados = [...jugadores].sort((a, b) => a.dorsal - b.dorsal);

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

  // Cerrar modales haciendo click fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === editModal) cerrarModalRenombrar();
    if (e.target === confirmModal) cerrarModalConfirmacion();
    if (e.target === confirmJugadorModal) cerrarModalEliminarJugador();
  });

  // Exportar respaldo JSON
  btnExportar.addEventListener("click", () => {
    exportarStorageJSON();
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
