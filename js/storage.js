/**
 * EA FC 26 Career Tracker - Capa de Datos (localStorage)
 * 
 * Este archivo gestiona la persistencia de datos bajo la clave "fc26_career_tracker".
 * Proporciona validaciones básicas e integridad de datos para equipos, plantilla,
 * fichajes deseados e información general del modo carrera.
 */

// Constantes globales
const STORAGE_KEY = "fc26_career_tracker";

// Catálogos válidos para validación de datos según EA FC 26
const POSICIONES_VALIDAS = ["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST", "CF"];
const ESTADOS_PLANTILLA_VALIDOS = ["Titular", "Suplente", "Rotación"];
const PRIORIDADES_FICHAJE_VALIDAS = ["Alta", "Media", "Baja"];
const ESTADOS_FICHAJE_VALIDOS = ["Pendiente", "En negociación", "Fichado", "Descartado"];

// ==========================================
// 1. Persistencia y Utilidades Internas
// ==========================================

/**
 * Inicializa el almacenamiento en localStorage si no existe.
 */
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    const defaultData = {
      equipos: []
    };
    saveStorage(defaultData);
    console.log("Storage inicializado con éxito.");
  }
}

/**
 * Obtiene y parsea todo el objeto de datos de localStorage.
 * @returns {Object} El objeto de datos completo.
 */
function getStorage() {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error al parsear los datos de localStorage:", error);
    return { equipos: [] };
  }
}

/**
 * Guarda el objeto de datos completo en localStorage.
 * @param {Object} data - El objeto de datos a guardar.
 */
function saveStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
    alert("Error de almacenamiento: No se pudieron guardar los cambios.");
  }
}

/**
 * Genera un ID único con un prefijo descriptivo.
 * @param {string} prefix - Prefijo para el ID (ej. 'equipo', 'jugador').
 * @returns {string} ID único.
 */
function generarIdUnico(prefix) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
}

// ==========================================
// 2. Gestión de Equipos
// ==========================================

/**
 * Obtiene todos los equipos registrados.
 * @returns {Array} Array de equipos.
 */
function getEquipos() {
  const data = getStorage();
  return data.equipos || [];
}

/**
 * Obtiene un equipo por su ID.
 * @param {string} id - ID del equipo.
 * @returns {Object|null} El equipo encontrado o null.
 */
function getEquipoById(id) {
  const equipos = getEquipos();
  return equipos.find(e => e.id === id) || null;
}

/**
 * Crea un equipo nuevo con infoGeneral vacía, plantilla y fichajes vacíos.
 * @param {string} nombre - Nombre del equipo (ej. "Tottenham Hotspur").
 * @returns {Object} El equipo creado.
 */
function crearEquipo(nombre) {
  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    throw new Error("El nombre del equipo es obligatorio y debe ser una cadena válida.");
  }

  const data = getStorage();
  const nuevoEquipo = {
    id: generarIdUnico("equipo"),
    nombre: nombre.trim(),
    infoGeneral: {
      objetivoTemporada: "",
      objetivoLargoPlazo: "",
      presupuestoTransferencias: 0,
      presupuestoSalarial: 0,
      divisionLiga: "",
      reglasPropias: [],
      notas: []
    },
    plantilla: [],
    fichajesDeseados: []
  };

  data.equipos.push(nuevoEquipo);
  saveStorage(data);
  return nuevoEquipo;
}

/**
 * Edita el nombre de un equipo existente.
 * @param {string} id - ID del equipo a editar.
 * @param {string} nuevoNombre - Nuevo nombre del equipo.
 * @returns {Object} El equipo editado.
 */
function editarNombreEquipo(id, nuevoNombre) {
  if (!nuevoNombre || typeof nuevoNombre !== "string" || nuevoNombre.trim() === "") {
    throw new Error("El nuevo nombre de equipo no es válido.");
  }

  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === id);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${id}`);
  }

  equipo.nombre = nuevoNombre.trim();
  saveStorage(data);
  return equipo;
}

/**
 * Elimina un equipo por completo.
 * @param {string} id - ID del equipo a eliminar.
 * @returns {boolean} True si se eliminó con éxito.
 */
function eliminarEquipo(id) {
  const data = getStorage();
  const index = data.equipos.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error(`No se encontró el equipo con ID: ${id}`);
  }

  data.equipos.splice(index, 1);
  saveStorage(data);
  return true;
}

// ==========================================
// 3. Gestión de Plantilla (Jugadores)
// ==========================================

/**
 * Valida que los datos de un jugador sean correctos antes de insertarlos.
 * @param {Object} jugador - Datos del jugador a validar.
 */
function validarJugador(jugador) {
  if (!jugador.nombre || typeof jugador.nombre !== "string" || jugador.nombre.trim() === "") {
    throw new Error("El nombre del jugador es obligatorio.");
  }

  if (!Array.isArray(jugador.posiciones) || jugador.posiciones.length === 0) {
    throw new Error("El jugador debe tener al menos una posición asignada.");
  }

  jugador.posiciones.forEach(pos => {
    if (!POSICIONES_VALIDAS.includes(pos)) {
      throw new Error(`Posición no válida: ${pos}. Posiciones permitidas: ${POSICIONES_VALIDAS.join(", ")}`);
    }
  });

  if (typeof jugador.edad !== "number" || jugador.edad < 15 || jugador.edad > 50) {
    throw new Error("La edad debe ser un número entre 15 y 50 años.");
  }

  if (!jugador.nacionalidad || typeof jugador.nacionalidad !== "string" || jugador.nacionalidad.trim() === "") {
    throw new Error("La nacionalidad es obligatoria.");
  }

  if (typeof jugador.valoracion !== "number" || jugador.valoracion < 1 || jugador.valoracion > 99) {
    throw new Error("La valoración debe ser un número entre 1 y 99.");
  }

  if (typeof jugador.potencial !== "number" || jugador.potencial < 1 || jugador.potencial > 99) {
    throw new Error("El potencial debe ser un número entre 1 y 99.");
  }

  if (jugador.potencial < jugador.valoracion) {
    throw new Error("El potencial no puede ser menor que la valoración actual.");
  }

  if (typeof jugador.valorMercado !== "number" || jugador.valorMercado < 0) {
    throw new Error("El valor de mercado debe ser un número positivo o cero.");
  }

  if (!ESTADOS_PLANTILLA_VALIDOS.includes(jugador.estado)) {
    throw new Error(`Estado de plantilla no válido: ${jugador.estado}. Permitidos: ${ESTADOS_PLANTILLA_VALIDOS.join(", ")}`);
  }

  if (typeof jugador.dorsal !== "number" || jugador.dorsal < 1 || jugador.dorsal > 99) {
    throw new Error("El dorsal debe ser un número entre 1 y 99.");
  }

  if (typeof jugador.contratoAniosRestantes !== "number" || jugador.contratoAniosRestantes < 0) {
    throw new Error("Los años de contrato restantes deben ser un número no negativo.");
  }
}

/**
 * Agrega un nuevo jugador a la plantilla de un equipo.
 * @param {string} equipoId - ID del equipo al que agregar.
 * @param {Object} jugadorData - Datos del jugador sin el ID.
 * @returns {Object} El jugador creado.
 */
function agregarJugador(equipoId, jugadorData) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  const nuevoJugador = {
    id: generarIdUnico("jugador"),
    nombre: jugadorData.nombre ? jugadorData.nombre.trim() : "",
    posiciones: jugadorData.posiciones || [],
    edad: Number(jugadorData.edad),
    nacionalidad: jugadorData.nacionalidad ? jugadorData.nacionalidad.trim() : "",
    valoracion: Number(jugadorData.valoracion),
    potencial: Number(jugadorData.potencial),
    valorMercado: Number(jugadorData.valorMercado),
    estado: jugadorData.estado,
    dorsal: Number(jugadorData.dorsal),
    contratoAniosRestantes: Number(jugadorData.contratoAniosRestantes),
    notas: jugadorData.notas ? jugadorData.notas.trim() : ""
  };

  validarJugador(nuevoJugador);

  equipo.plantilla.push(nuevoJugador);
  saveStorage(data);
  return nuevoJugador;
}

/**
 * Edita un jugador existente en la plantilla de un equipo.
 * @param {string} equipoId - ID del equipo.
 * @param {string} jugadorId - ID del jugador a editar.
 * @param {Object} jugadorDataActualizada - Campos a actualizar.
 * @returns {Object} El jugador editado.
 */
function editarJugador(equipoId, jugadorId, jugadorDataActualizada) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  const jugador = equipo.plantilla.find(j => j.id === jugadorId);
  if (!jugador) {
    throw new Error(`No se encontró el jugador con ID: ${jugadorId} en este equipo.`);
  }

  // Preparamos objeto de actualización
  const nuevaValoracion = jugadorDataActualizada.valoracion !== undefined ? Number(jugadorDataActualizada.valoracion) : jugador.valoracion;
  let nuevoPotencial = jugadorDataActualizada.potencial !== undefined ? Number(jugadorDataActualizada.potencial) : jugador.potencial;

  // Si la nueva valoración supera el potencial actual del jugador y no se especificó un potencial explícito,
  // ajustamos automáticamente el potencial para que no sea menor a la valoración.
  if (nuevaValoracion > nuevoPotencial && jugadorDataActualizada.potencial === undefined) {
    nuevoPotencial = nuevaValoracion;
  }

  const jugadorClon = {
    ...jugador,
    ...jugadorDataActualizada,
    // Asegurar tipos de datos numéricos si se proveen
    edad: jugadorDataActualizada.edad !== undefined ? Number(jugadorDataActualizada.edad) : jugador.edad,
    valoracion: nuevaValoracion,
    potencial: nuevoPotencial,
    valorMercado: jugadorDataActualizada.valorMercado !== undefined ? Number(jugadorDataActualizada.valorMercado) : jugador.valorMercado,
    dorsal: jugadorDataActualizada.dorsal !== undefined ? Number(jugadorDataActualizada.dorsal) : jugador.dorsal,
    contratoAniosRestantes: jugadorDataActualizada.contratoAniosRestantes !== undefined ? Number(jugadorDataActualizada.contratoAniosRestantes) : jugador.contratoAniosRestantes
  };

  validarJugador(jugadorClon);

  // Actualizamos el objeto real
  Object.assign(jugador, jugadorClon);

  saveStorage(data);
  return jugador;
}

/**
 * Elimina un jugador de la plantilla de un equipo.
 * @param {string} equipoId - ID del equipo.
 * @param {string} jugadorId - ID del jugador.
 * @returns {boolean} True si se eliminó con éxito.
 */
function eliminarJugador(equipoId, jugadorId) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  const index = equipo.plantilla.findIndex(j => j.id === jugadorId);
  if (index === -1) {
    throw new Error(`No se encontró el jugador con ID: ${jugadorId} en este equipo.`);
  }

  equipo.plantilla.splice(index, 1);
  saveStorage(data);
  return true;
}

// ==========================================
// 4. Gestión de Fichajes Deseados
// ==========================================

/**
 * Valida que los datos de un fichaje deseado sean correctos antes de insertarlos.
 * @param {Object} fichaje - Datos del fichaje a validar.
 */
function validarFichajeDeseado(fichaje) {
  if (!fichaje.nombre || typeof fichaje.nombre !== "string" || fichaje.nombre.trim() === "") {
    throw new Error("El nombre del fichaje deseado es obligatorio.");
  }

  if (!fichaje.clubActual || typeof fichaje.clubActual !== "string" || fichaje.clubActual.trim() === "") {
    throw new Error("El club actual del jugador es obligatorio.");
  }

  if (!Array.isArray(fichaje.posiciones) || fichaje.posiciones.length === 0) {
    throw new Error("El jugador debe tener al menos una posición asignada.");
  }

  fichaje.posiciones.forEach(pos => {
    if (!POSICIONES_VALIDAS.includes(pos)) {
      throw new Error(`Posición no válida: ${pos}. Posiciones permitidas: ${POSICIONES_VALIDAS.join(", ")}`);
    }
  });

  if (typeof fichaje.edad !== "number" || fichaje.edad < 15 || fichaje.edad > 50) {
    throw new Error("La edad debe ser un número entre 15 y 50 años.");
  }

  if (typeof fichaje.valoracion !== "number" || fichaje.valoracion < 1 || fichaje.valoracion > 99) {
    throw new Error("La valoración debe ser un número entre 1 y 99.");
  }

  if (typeof fichaje.potencial !== "number" || fichaje.potencial < 1 || fichaje.potencial > 99) {
    throw new Error("El potencial debe ser un número entre 1 y 99.");
  }

  if (fichaje.potencial < fichaje.valoracion) {
    throw new Error("El potencial no puede ser menor que la valoración actual.");
  }

  if (typeof fichaje.valorMercadoEstimado !== "number" || fichaje.valorMercadoEstimado < 0) {
    throw new Error("El valor de mercado estimado debe ser un número positivo o cero.");
  }

  if (!PRIORIDADES_FICHAJE_VALIDAS.includes(fichaje.prioridad)) {
    throw new Error(`Prioridad no válida: ${fichaje.prioridad}. Permitidos: ${PRIORIDADES_FICHAJE_VALIDAS.join(", ")}`);
  }

  if (!ESTADOS_FICHAJE_VALIDOS.includes(fichaje.estado)) {
    throw new Error(`Estado de fichaje no válido: ${fichaje.estado}. Permitidos: ${ESTADOS_FICHAJE_VALIDOS.join(", ")}`);
  }
}

/**
 * Agrega un nuevo fichaje deseado a un equipo.
 * @param {string} equipoId - ID del equipo.
 * @param {Object} fichajeData - Datos del fichaje sin el ID.
 * @returns {Object} El fichaje creado.
 */
function agregarFichajeDeseado(equipoId, fichajeData) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  const nuevoFichaje = {
    id: generarIdUnico("fichaje"),
    nombre: fichajeData.nombre ? fichajeData.nombre.trim() : "",
    clubActual: fichajeData.clubActual ? fichajeData.clubActual.trim() : "",
    posiciones: fichajeData.posiciones || [],
    edad: Number(fichajeData.edad),
    valoracion: Number(fichajeData.valoracion),
    potencial: Number(fichajeData.potencial),
    valorMercadoEstimado: Number(fichajeData.valorMercadoEstimado),
    prioridad: fichajeData.prioridad,
    estado: fichajeData.estado,
    notas: fichajeData.notas ? fichajeData.notas.trim() : ""
  };

  validarFichajeDeseado(nuevoFichaje);

  equipo.fichajesDeseados.push(nuevoFichaje);
  saveStorage(data);
  return nuevoFichaje;
}

/**
 * Edita un fichaje deseado en un equipo.
 * @param {string} equipoId - ID del equipo.
 * @param {string} fichajeId - ID del fichaje.
 * @param {Object} fichajeDataActualizada - Campos actualizados.
 * @returns {Object} El fichaje editado.
 */
function editarFichajeDeseado(equipoId, fichajeId, fichajeDataActualizada) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  const fichaje = equipo.fichajesDeseados.find(f => f.id === fichajeId);
  if (!fichaje) {
    throw new Error(`No se encontró el fichaje deseado con ID: ${fichajeId} en este equipo.`);
  }

  // Preparamos objeto de actualización
  const nuevaValoracion = fichajeDataActualizada.valoracion !== undefined ? Number(fichajeDataActualizada.valoracion) : fichaje.valoracion;
  let nuevoPotencial = fichajeDataActualizada.potencial !== undefined ? Number(fichajeDataActualizada.potencial) : fichaje.potencial;

  // Si la nueva valoración supera el potencial actual del fichaje y no se especificó un potencial explícito,
  // ajustamos automáticamente el potencial para que no sea menor a la valoración.
  if (nuevaValoracion > nuevoPotencial && fichajeDataActualizada.potencial === undefined) {
    nuevoPotencial = nuevaValoracion;
  }

  const fichajeClon = {
    ...fichaje,
    ...fichajeDataActualizada,
    // Asegurar tipos de datos numéricos si se proveen
    edad: fichajeDataActualizada.edad !== undefined ? Number(fichajeDataActualizada.edad) : fichaje.edad,
    valoracion: nuevaValoracion,
    potencial: nuevoPotencial,
    valorMercadoEstimado: fichajeDataActualizada.valorMercadoEstimado !== undefined ? Number(fichajeDataActualizada.valorMercadoEstimado) : fichaje.valorMercadoEstimado
  };

  validarFichajeDeseado(fichajeClon);

  // Actualizamos el objeto real
  Object.assign(fichaje, fichajeClon);

  saveStorage(data);
  return fichaje;
}

/**
 * Elimina un fichaje deseado de un equipo.
 * @param {string} equipoId - ID del equipo.
 * @param {string} fichajeId - ID del fichaje.
 * @returns {boolean} True si se eliminó con éxito.
 */
function eliminarFichajeDeseado(equipoId, fichajeId) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  const index = equipo.fichajesDeseados.findIndex(f => f.id === fichajeId);
  if (index === -1) {
    throw new Error(`No se encontró el fichaje deseado con ID: ${fichajeId} en este equipo.`);
  }

  equipo.fichajesDeseados.splice(index, 1);
  saveStorage(data);
  return true;
}

// ==========================================
// 5. Gestión de Información General
// ==========================================

/**
 * Actualiza la información general de un equipo específico.
 * @param {string} equipoId - ID del equipo.
 * @param {Object} infoGeneralData - Objeto de información general parcial o completo.
 * @returns {Object} La información general actualizada.
 */
function actualizarInfoGeneral(equipoId, infoGeneralData) {
  const data = getStorage();
  const equipo = data.equipos.find(e => e.id === equipoId);
  if (!equipo) {
    throw new Error(`No se encontró el equipo con ID: ${equipoId}`);
  }

  // Si no existe el objeto, lo inicializamos
  if (!equipo.infoGeneral) {
    equipo.infoGeneral = {
      objetivoTemporada: "",
      objetivoLargoPlazo: "",
      presupuestoTransferencias: 0,
      presupuestoSalarial: 0,
      divisionLiga: "",
      reglasPropias: [],
      notas: []
    };
  }

  const info = equipo.infoGeneral;

  if (infoGeneralData.objetivoTemporada !== undefined) {
    info.objetivoTemporada = String(infoGeneralData.objetivoTemporada).trim();
  }
  if (infoGeneralData.objetivoLargoPlazo !== undefined) {
    info.objetivoLargoPlazo = String(infoGeneralData.objetivoLargoPlazo).trim();
  }
  if (infoGeneralData.presupuestoTransferencias !== undefined) {
    const pt = Number(infoGeneralData.presupuestoTransferencias);
    if (isNaN(pt) || pt < 0) throw new Error("El presupuesto de transferencias debe ser un número positivo.");
    info.presupuestoTransferencias = pt;
  }
  if (infoGeneralData.presupuestoSalarial !== undefined) {
    const ps = Number(infoGeneralData.presupuestoSalarial);
    if (isNaN(ps) || ps < 0) throw new Error("El presupuesto salarial debe ser un número positivo.");
    info.presupuestoSalarial = ps;
  }
  if (infoGeneralData.divisionLiga !== undefined) {
    info.divisionLiga = String(infoGeneralData.divisionLiga).trim();
  }
  if (infoGeneralData.reglasPropias !== undefined) {
    if (!Array.isArray(infoGeneralData.reglasPropias)) {
      throw new Error("reglasPropias debe ser un array de cadenas.");
    }
    info.reglasPropias = infoGeneralData.reglasPropias.map(r => String(r).trim());
  }

  // Gestión de notas de la bitácora
  if (infoGeneralData.notas !== undefined) {
    if (!Array.isArray(infoGeneralData.notas)) {
      throw new Error("notas debe ser un array de objetos con fecha y texto.");
    }
    info.notas = infoGeneralData.notas.map(n => {
      if (!n.fecha || !n.texto) {
        throw new Error("Cada nota de la bitácora debe contener 'fecha' y 'texto'.");
      }
      return {
        fecha: String(n.fecha).trim(),
        texto: String(n.texto).trim()
      };
    });
  }

  saveStorage(data);
  return info;
}

// ==========================================
// 6. Exportación de Datos
// ==========================================

/**
 * Genera la descarga del archivo .json estructurado con todos los datos.
 */
function exportarStorageJSON() {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) {
    console.warn("No hay datos en el tracker para exportar.");
    alert("No hay ningún dato guardado en el tracker para exportar.");
    return;
  }

  // Validamos que sea un JSON bien estructurado
  try {
    JSON.parse(rawData);
  } catch (error) {
    console.error("El formato de los datos es inválido.");
    alert("Los datos guardados no son válidos para la exportación.");
    return;
  }

  const blob = new Blob([rawData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  
  const fechaStr = new Date().toISOString().slice(0, 10);
  a.download = `fc26_career_tracker_backup_${fechaStr}.json`;
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log("Archivo JSON de respaldo descargado con éxito.");
}

// Inicialización automática al cargar el script en el entorno del navegador
if (typeof window !== "undefined") {
  initStorage();
}
