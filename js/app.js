/**
 * EA FC 26 Career Tracker - Script de Pruebas y Consola (Fase 1)
 * 
 * Este archivo actúa como puente para probar la capa de datos en la consola
 * del navegador. Expone la función global `probarTracker()` para verificar
 * automáticamente el funcionamiento de storage.js.
 */

console.log("%c⚽ EA FC 26 Career Tracker — Capa de Datos Cargada", "color: #00ff88; font-weight: bold; font-size: 16px;");
console.log("Ejecuta %cprobarTracker()%c en la consola para iniciar una prueba automatizada del almacenamiento.", "color: #ffaa00; font-weight: bold;", "color: inherit;");
console.log("Funciones globales disponibles para probar manualmente:");
console.log("- %cgetEquipos()%c: Obtener todos los equipos", "color: #00bfff;", "");
console.log("- %ccrearEquipo(nombre)%c: Crear equipo nuevo", "color: #00bfff;", "");
console.log("- %ceditarNombreEquipo(id, nuevoNombre)%c: Editar nombre de equipo", "color: #00bfff;", "");
console.log("- %celiminarEquipo(id)%c: Eliminar equipo", "color: #00bfff;", "");
console.log("- %cagregarJugador(equipoId, jugadorData)%c: Añadir jugador a plantilla", "color: #00bfff;", "");
console.log("- %ceditarJugador(equipoId, jugadorId, data)%c: Editar jugador", "color: #00bfff;", "");
console.log("- %celiminarJugador(equipoId, jugadorId)%c: Eliminar jugador", "color: #00bfff;", "");
console.log("- %cagregarFichajeDeseado(equipoId, fichajeData)%c: Añadir fichaje deseado", "color: #00bfff;", "");
console.log("- %ceditarFichajeDeseado(equipoId, fichajeId, data)%c: Editar fichaje", "color: #00bfff;", "");
console.log("- %celiminarFichajeDeseado(equipoId, fichajeId)%c: Eliminar fichaje", "color: #00bfff;", "");
console.log("- %cactualizarInfoGeneral(equipoId, infoData)%c: Actualizar info general del equipo", "color: #00bfff;", "");
console.log("- %cexportarStorageJSON()%c: Descargar respaldo JSON", "color: #00bfff;", "");

/**
 * Ejecuta una prueba automática de todos los métodos CRUD y validaciones.
 */
function probarTracker() {
  console.group("%c🧪 INICIANDO TEST DEL TRACKER DE MODO CARRERA", "color: #ff00ff; font-weight: bold;");
  
  try {
    // 1. Limpieza y preparación
    console.log("%c1. Preparando base de datos limpia...", "color: #aaa; font-weight: bold;");
    localStorage.removeItem("fc26_career_tracker");
    initStorage();
    console.log("Equipos iniciales (debe ser vacío):", getEquipos());

    // 2. Crear equipos
    console.log("\n%c2. Creando equipos de prueba...", "color: #aaa; font-weight: bold;");
    const tot = crearEquipo("Tottenham Hotspur");
    const rm = crearEquipo("Real Madrid");
    console.log("Equipo creado:", tot);
    console.log("Equipo creado:", rm);
    console.log("Lista de equipos:", getEquipos());

    // 3. Editar nombre de equipo
    console.log("\n%c3. Editando nombre de equipo...", "color: #aaa; font-weight: bold;");
    const rmEditado = editarNombreEquipo(rm.id, "Real Madrid C.F.");
    console.log("Equipo editado (debe decir Real Madrid C.F.):", rmEditado);

    // 4. Agregar jugadores a la plantilla
    console.log("\n%c4. Agregando jugadores a plantilla...", "color: #aaa; font-weight: bold;");
    
    // Jugador válido
    const son = agregarJugador(tot.id, {
      nombre: "Heung-min Son",
      posiciones: ["LW", "ST"],
      edad: 31,
      nacionalidad: "Corea del Sur",
      valoracion: 87,
      potencial: 87,
      valorMercado: 45000000,
      estado: "Titular",
      dorsal: 7,
      contratoAniosRestantes: 2,
      notas: "Capitán y referente ofensivo"
    });
    console.log("Jugador agregado con éxito:", son);

    // Jugador válido 2 (joven promesa)
    const gray = agregarJugador(tot.id, {
      nombre: "Archie Gray",
      posiciones: ["RB", "CDM", "CM"],
      edad: 18,
      nacionalidad: "Inglaterra",
      valoracion: 74,
      potencial: 88,
      valorMercado: 12000000,
      estado: "Rotación",
      dorsal: 14,
      contratoAniosRestantes: 6,
      notas: "Excelente polivalencia y potencial"
    });
    console.log("Segundo jugador agregado:", gray);

    // Prueba de validación: Posición incorrecta
    console.log("%cProbando validación fallida (posición 'XYZ')...", "color: #e5c158;");
    try {
      agregarJugador(tot.id, {
        nombre: "Falso Jugador",
        posiciones: ["XYZ"],
        edad: 20,
        nacionalidad: "España",
        valoracion: 80,
        potencial: 85,
        valorMercado: 5000000,
        estado: "Suplente",
        dorsal: 99,
        contratoAniosRestantes: 3,
        notas: ""
      });
      console.error("❌ ERROR: Se permitió registrar una posición inválida.");
    } catch (e) {
      console.log("✅ OK: Error capturado esperado:", e.message);
    }

    // Prueba de validación: Potencial menor que valoración
    console.log("%cProbando validación fallida (potencial < valoración)...", "color: #e5c158;");
    try {
      agregarJugador(tot.id, {
        nombre: "Falso Jugador 2",
        posiciones: ["CB"],
        edad: 20,
        nacionalidad: "España",
        valoracion: 85,
        potencial: 80, // Menor que valoración
        valorMercado: 5000000,
        estado: "Suplente",
        dorsal: 99,
        contratoAniosRestantes: 3,
        notas: ""
      });
      console.error("❌ ERROR: Se permitió registrar un potencial menor a la valoración.");
    } catch (e) {
      console.log("✅ OK: Error capturado esperado:", e.message);
    }

    // 5. Editar jugador
    console.log("\n%c5. Editando un jugador...", "color: #aaa; font-weight: bold;");
    const sonEditado = editarJugador(tot.id, son.id, {
      valoracion: 88, // Subió 1 punto
      dorsal: 10,     // Cambio de dorsal
      notas: "Capitán histórico, ascendido a dorsal 10"
    });
    console.log("Jugador después de edición:", sonEditado);

    // 6. Agregar fichaje deseado
    console.log("\n%c6. Agregando fichajes deseados...", "color: #aaa; font-weight: bold;");
    const target1 = agregarFichajeDeseado(tot.id, {
      nombre: "Nico Williams",
      clubActual: "Athletic Club",
      posiciones: ["LW", "RW"],
      edad: 21,
      valoracion: 84,
      potencial: 89,
      valorMercadoEstimado: 60000000,
      prioridad: "Alta",
      estado: "Pendiente",
      notas: "Cláusula de rescisión accesible"
    });
    console.log("Fichaje deseado agregado:", target1);

    // Fichaje deseado 2
    const target2 = agregarFichajeDeseado(tot.id, {
      nombre: "Gyökeres",
      clubActual: "Sporting CP",
      posiciones: ["ST"],
      edad: 26,
      valoracion: 84,
      potencial: 86,
      valorMercadoEstimado: 75000000,
      prioridad: "Media",
      estado: "En negociación",
      notas: "Delantero potente"
    });
    console.log("Segundo fichaje deseado agregado:", target2);

    // 7. Editar fichaje deseado
    console.log("\n%c7. Editando fichaje deseado...", "color: #aaa; font-weight: bold;");
    const target2Editado = editarFichajeDeseado(tot.id, target2.id, {
      estado: "Fichado",
      prioridad: "Baja",
      notas: "¡Fichado! Proceder a registrar en la plantilla."
    });
    console.log("Fichaje editado:", target2Editado);

    // 8. Actualizar información general
    console.log("\n%c8. Actualizando información general del equipo...", "color: #aaa; font-weight: bold;");
    const infoActualizada = actualizarInfoGeneral(tot.id, {
      objetivoTemporada: "Ganar copa local y entrar en Champions",
      objetivoLargoPlazo: "Ser campeones de Europa en 3 años",
      presupuestoTransferencias: 95000000,
      presupuestoSalarial: 1200000,
      divisionLiga: "Premier League",
      reglasPropias: [
        "Fichar solo canteranos o menores de 23 años",
        "No pagar más de 200k/semana de salario"
      ],
      notas: [
        { fecha: "2026-06-19", texto: "Pretemporada excelente. Fichamos a Gyökeres." }
      ]
    });
    console.log("Información general del equipo:", infoActualizada);

    // 9. Eliminar un equipo
    console.log("\n%c9. Eliminando un equipo de prueba...", "color: #aaa; font-weight: bold;");
    console.log("Equipos antes de eliminar:", getEquipos().map(e => e.nombre));
    eliminarEquipo(rm.id);
    console.log("Equipos después de eliminar Real Madrid (debe quedar solo uno):", getEquipos().map(e => e.nombre));

    // 10. Eliminar jugador y fichaje deseado
    console.log("\n%c10. Eliminando jugador y fichaje deseado...", "color: #aaa; font-weight: bold;");
    const totActualizado = getEquipoById(tot.id);
    console.log("Antes - Jugadores:", totActualizado.plantilla.length, "Fichajes:", totActualizado.fichajesDeseados.length);
    eliminarJugador(tot.id, gray.id);
    eliminarFichajeDeseado(tot.id, target1.id);
    const totDespues = getEquipoById(tot.id);
    console.log("Después - Jugadores (debe ser 1):", totDespues.plantilla.length, "Fichajes (debe ser 1):", totDespues.fichajesDeseados.length);

    console.log("\n%c🔍 Estado final del storage:", "color: #00ff88; font-weight: bold;");
    console.log(getStorage());

    // 11. Descargar copia JSON
    console.log("\n%c11. Probando exportación JSON...", "color: #aaa; font-weight: bold;");
    console.log("Abriendo diálogo de descarga de archivo...");
    exportarStorageJSON();

    console.log("\n%c🎉 ¡TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO! 🎉", "color: #00ff00; font-weight: bold; font-size: 14px;");

  } catch (error) {
    console.error("❌ ERROR DURANTE LAS PRUEBAS:", error);
  } finally {
    console.groupEnd();
  }
}

// Exponer probarTracker de forma global
if (typeof window !== "undefined") {
  window.probarTracker = probarTracker;
}
