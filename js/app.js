/**
 * EA FC 26 Career Tracker - Controlador de Interfaz Visual (Fase 2)
 * 
 * Gestiona la interfaz del panel principal de carreras, la selección activa 
 * de saves con diseño de pizarra táctica y la persistencia de sesión.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Estado local
  let activeTeamId = localStorage.getItem("fc26_active_team_id") || null;

  // Referencias a elementos del DOM - Pantalla Principal
  const crearForm = document.getElementById("crear-equipo-form");
  const nuevoNombreInput = document.getElementById("nuevo-equipo-nombre");
  const equiposGrid = document.getElementById("equipos-grid");
  const btnExportar = document.getElementById("btn-exportar");

  // Referencias a la Pizarra Táctica (Save Activo)
  const activeSaveContainer = document.getElementById("carrera-activa-container");
  const activeTeamTitle = document.getElementById("active-team-title");
  const activeTeamSubtitle = document.getElementById("active-team-subtitle");

  // Referencias a elementos del DOM - Modal Renombrar
  const editModal = document.getElementById("edit-modal");
  const editForm = document.getElementById("edit-equipo-form");
  const editIdInput = document.getElementById("edit-equipo-id");
  const editNombreInput = document.getElementById("edit-equipo-nombre");
  const btnCancelarEdit = document.getElementById("btn-cancelar-edit");

  // Referencias a elementos del DOM - Modal Confirmación Eliminar
  const confirmModal = document.getElementById("confirm-modal");
  const deleteIdInput = document.getElementById("delete-equipo-id");
  const deleteNombreDisplay = document.getElementById("delete-equipo-nombre");
  const btnCancelarDelete = document.getElementById("btn-cancelar-delete");
  const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");

  // ==========================================
  // 1. Gestión de Selección (Save Activo)
  // ==========================================

  /**
   * Marca un equipo específico como la carrera seleccionada de forma activa.
   * @param {string|null} id - ID del equipo, o null para limpiar selección.
   */
  function seleccionarEquipo(id) {
    if (!id) {
      activeTeamId = null;
      localStorage.removeItem("fc26_active_team_id");
      
      activeSaveContainer.classList.remove("active");
      activeTeamTitle.textContent = "Ninguna carrera seleccionada";
      activeTeamSubtitle.textContent = "Haz clic en una de tus carreras abajo para empezar a planificar tu plantilla.";
      return;
    }

    const equipo = getEquipoById(id);
    if (!equipo) {
      // Si el equipo fue eliminado, limpiamos selección
      seleccionarEquipo(null);
      return;
    }

    activeTeamId = id;
    localStorage.setItem("fc26_active_team_id", id);

    // Actualizar la Pizarra Táctica visualmente
    activeSaveContainer.classList.add("active");
    activeTeamTitle.textContent = equipo.nombre;

    const totalPlantilla = equipo.plantilla ? equipo.plantilla.length : 0;
    const totalFichajes = equipo.fichajesDeseados ? equipo.fichajesDeseados.length : 0;
    activeTeamSubtitle.textContent = `Plantilla: ${totalPlantilla} jugadores | Fichajes en carpeta: ${totalFichajes} jugadores. (Fase 3: Gestión completa próximamente)`;
  }

  // ==========================================
  // 2. Renderizado de Tarjetas de Equipos
  // ==========================================

  /**
   * Renderiza las tarjetas en el grid de la página.
   */
  function renderEquipos() {
    const equipos = getEquipos();
    equiposGrid.innerHTML = "";

    // Si el equipo seleccionado activo ya no existe en el storage, lo deselecciona
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

      // Hacer que toda la tarjeta sea clickable para seleccionar el save (human aspect / UX fluida)
      card.addEventListener("click", (e) => {
        // Ignorar si el usuario clickea los botones específicos dentro de la tarjeta
        if (e.target.closest(".team-actions") || e.target.closest(".btn-icon")) {
          return;
        }
        seleccionarEquipo(equipo.id);
        renderEquipos();
      });

      equiposGrid.appendChild(card);
    });

    // Enlazar eventos de los botones de acción
    const btnsGestionar = equiposGrid.querySelectorAll(".btn-gestionar");
    const btnsRenombrar = equiposGrid.querySelectorAll(".btn-renombrar");
    const btnsEliminar = equiposGrid.querySelectorAll(".btn-eliminar");

    btnsGestionar.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        seleccionarEquipo(id);
        renderEquipos();
      });
    });

    btnsRenombrar.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        const nombre = e.currentTarget.getAttribute("data-nombre");
        abrirModalRenombrar(id, nombre);
      });
    });

    btnsEliminar.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        const nombre = e.currentTarget.getAttribute("data-nombre");
        abrirModalConfirmacion(id, nombre);
      });
    });
  }

  // ==========================================
  // 3. Control de Modales
  // ==========================================

  // Modal Renombrar
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

  // Modal Confirmación Eliminar
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

  // ==========================================
  // 4. Event Listeners
  // ==========================================

  // Crear Equipo nuevo
  crearForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = nuevoNombreInput.value.trim();
    if (nombre) {
      try {
        const nuevoClub = crearEquipo(nombre);
        nuevoNombreInput.value = "";
        
        // Al crear un save nuevo, lo hacemos el activo automáticamente (toque UX inteligente)
        seleccionarEquipo(nuevoClub.id);
        renderEquipos();
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
        
        // Si el equipo editado era el activo, actualizamos el banner
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
        
        // Si borramos el equipo activo, limpiamos la selección
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

  // Cancelar modales
  btnCancelarEdit.addEventListener("click", cerrarModalRenombrar);
  btnCancelarDelete.addEventListener("click", cerrarModalConfirmacion);

  // Cerrar modales haciendo click fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === editModal) cerrarModalRenombrar();
    if (e.target === confirmModal) cerrarModalConfirmacion();
  });

  // Exportar respaldo JSON
  btnExportar.addEventListener("click", () => {
    exportarStorageJSON();
  });

  // ==========================================
  // 5. Inicialización
  // ==========================================
  renderEquipos();
  
  // Si había un equipo activo previamente, lo cargamos
  if (activeTeamId) {
    seleccionarEquipo(activeTeamId);
  }
});
