# EA FC 26 Career Tracker — Brief de Proyecto

> Documento de planeación generado tras una entrevista de definición de requisitos. Úsalo como referencia y como prompt base para ir construyendo la app en tu editor.

---

## 1. Objetivo del proyecto

Crear una aplicación web personal para organizar la información de tus partidas de modo carrera en EA FC 26: plantillas, fichajes deseados e información general de cada equipo que diriges. Sustituye la libreta física y las notas del celular, que actualmente te hacen perder información o tardarte demasiado en encontrarla.

## 2. Usuario

Tú (Carlos), de forma personal, mientras juegas. Uso principal desde la PC en una ventana aparte; acceso ocasional desde el celular. Es también una pieza de portafolio, pero la prioridad #1 es que sea una herramienta que realmente uses.

## 3. Problema que resuelve

Hoy llevas el control en libreta + notas del celular: información dispersa, se te olvida, y es lento de mantener. Necesitas un solo lugar centralizado, rápido de consultar y actualizar entre sesiones de juego.

## 4. Decisiones de arquitectura

| Decisión | Elegido | Razón |
|---|---|---|
| Stack | HTML + CSS + JavaScript vanilla | Mantener el proyecto simple, igual que Dulce Antojito |
| Almacenamiento | `localStorage` del navegador | No necesitas sincronización entre dispositivos por ahora; cero backend |
| Dispositivos | PC (principal) + celular (ocasional) | Cada dispositivo tiene su propia copia de datos (no sincronizada) |
| Diseño | Responsive (mobile + desktop) | Debe verse y usarse bien también desde el celular |
| Hosting | GitHub Pages (como tus otros proyectos) | Consistente con tu portafolio actual |

## 5. Estructura de datos (modelo en localStorage)

```json
{
  "equipos": [
    {
      "id": "equipo_1718800000000",
      "nombre": "Tottenham Hotspur",
      "infoGeneral": {
        "objetivoTemporada": "",
        "objetivoLargoPlazo": "",
        "presupuestoTransferencias": 0,
        "presupuestoSalarial": 0,
        "divisionLiga": "",
        "reglasPropias": [],
        "notas": [
          { "fecha": "2026-06-19", "texto": "" }
        ]
      },
      "plantilla": [
        {
          "id": "jugador_1",
          "nombre": "",
          "posiciones": ["CB"],
          "edad": 0,
          "nacionalidad": "",
          "valoracion": 0,
          "potencial": 0,
          "valorMercado": 0,
          "estado": "Titular",
          "dorsal": 0,
          "contratoAniosRestantes": 0,
          "notas": ""
        }
      ],
      "fichajesDeseados": [
        {
          "id": "fichaje_1",
          "nombre": "",
          "clubActual": "",
          "posiciones": ["CAM"],
          "edad": 0,
          "valoracion": 0,
          "potencial": 0,
          "valorMercadoEstimado": 0,
          "prioridad": "Alta",
          "estado": "Pendiente",
          "notas": ""
        }
      ]
    }
  ]
}
```

**Posiciones específicas a usar (como en el juego):** GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF.

**Valores de `estado` (plantilla):** Titular, Suplente, Rotación.

**Valores de `prioridad` (fichajes):** Alta, Media, Baja.

**Valores de `estado` (fichajes):** Pendiente, En negociación, Fichado, Descartado.

## 6. Funcionalidades del MVP

### 6.1 Pantalla principal — Lista de equipos
- Ver todos tus equipos/saves
- Crear nuevo equipo
- Editar nombre / eliminar equipo
- Entrar a un equipo

### 6.2 Pestaña Plantilla
- CRUD completo de jugadores (crear, editar, eliminar)
- Filtro por posición específica
- **Resumen visual por posición**: conteo de jugadores por cada posición (para detectar huecos o sobrepoblación)
- Buscador por nombre

### 6.3 Pestaña Fichajes Deseados
- CRUD completo de fichajes
- Filtro por posición, prioridad y estado
- Buscador por nombre

### 6.4 Pestaña Información General
- Objetivo de temporada y objetivo a largo plazo
- Presupuesto de transferencias y salarial
- División/liga actual
- Reglas propias del save (lista simple, opcional)
- Bitácora de notas libres con fecha

### 6.5 Respaldo de datos
- Botón **"Descargar respaldo"**: exporta todo (`equipos` completo) a un archivo `.json`
- Protege contra pérdida de datos por limpieza de caché, cambio de navegador, etc.

### 6.6 Responsive
- Usable cómodamente desde celular (formularios, filtros y botones con buen tamaño táctil)

## 7. Fuera de alcance por ahora (V2 / mejoras futuras)

- **Importar archivo estructurado** (CSV con columnas fijas) para cargar jugadores/fichajes masivamente
- Sincronización de datos entre dispositivos (requeriría backend + base de datos)
- Identidad visual definitiva (se puede iterar después de tener la funcionalidad andando)

## 8. Criterios de calidad

- Puedes registrar un equipo nuevo y empezar a anotar jugadores en menos de 1 minuto
- El resumen por posición te dice de un vistazo dónde te faltan piezas
- Ningún dato se pierde al cerrar el navegador (persistencia correcta en localStorage)
- La app es cómoda de usar desde el celular, no solo "se ve bien"
- El respaldo exportado contiene toda la información y se puede abrir/leer como JSON válido

## 9. Roadmap de desarrollo recomendado (por fases)

No construyas todo de un jalón. Avanza fase por fase, probando cada una antes de seguir:

1. **Fase 1 — Estructura base de datos:** funciones JS para crear/leer/actualizar/eliminar en localStorage (capa de datos, sin UI todavía)
2. **Fase 2 — Pantalla principal:** lista de equipos + crear/eliminar equipo
3. **Fase 3 — Plantilla:** formulario + listado + CRUD de jugadores
4. **Fase 4 — Filtros y resumen por posición** en Plantilla
5. **Fase 5 — Fichajes Deseados:** formulario + listado + CRUD + filtros
6. **Fase 6 — Información General:** objetivos, presupuesto, reglas, bitácora de notas
7. **Fase 7 — Buscador por nombre** (Plantilla y Fichajes)
8. **Fase 8 — Respaldo/exportar a JSON**
9. **Fase 9 — Responsive y pulido visual final**

## 10. Siguiente acción recomendada

Empieza por la **Fase 1**. Cuando uses tu agente de IA en el editor, pídele explícitamente que trabaje **solo esa fase** y que te explique las decisiones clave, en vez de generar toda la app de golpe — así mantienes el control del código y aprendes en el proceso, como ya vienes haciendo con tus otros proyectos.

---

## Prompt para iniciar el desarrollo (Fase 1)

Copia y pega esto en tu editor/agente de IA para arrancar:

```
Estoy construyendo una app web personal para llevar el control de mis partidas
de modo carrera en EA FC 26 (plantilla, fichajes deseados, información general
por equipo). Stack: HTML + CSS + JavaScript vanilla, sin frameworks, sin
backend. Todos los datos se guardan en localStorage del navegador.

Quiero que trabajemos SOLO la Fase 1 por ahora: la capa de datos.

Necesito un archivo JavaScript (ej. `storage.js`) con funciones para manejar
esta estructura en localStorage bajo la key "fc26_career_tracker":

{
  "equipos": [
    {
      "id": string,
      "nombre": string,
      "infoGeneral": {
        "objetivoTemporada": string,
        "objetivoLargoPlazo": string,
        "presupuestoTransferencias": number,
        "presupuestoSalarial": number,
        "divisionLiga": string,
        "reglasPropias": string[],
        "notas": [{ "fecha": string, "texto": string }]
      },
      "plantilla": [
        {
          "id": string,
          "nombre": string,
          "posiciones": string[], // ej. ["CB"], usando posiciones específicas de EA FC: GK, CB, LB, RB, LWB, RWB, CDM, CM, CAM, LM, RM, LW, RW, ST, CF
          "edad": number,
          "nacionalidad": string,
          "valoracion": number,
          "potencial": number,
          "valorMercado": number,
          "estado": "Titular" | "Suplente" | "Rotación",
          "dorsal": number,
          "contratoAniosRestantes": number,
          "notas": string
        }
      ],
      "fichajesDeseados": [
        {
          "id": string,
          "nombre": string,
          "clubActual": string,
          "posiciones": string[],
          "edad": number,
          "valoracion": number,
          "potencial": number,
          "valorMercadoEstimado": number,
          "prioridad": "Alta" | "Media" | "Baja",
          "estado": "Pendiente" | "En negociación" | "Fichado" | "Descartado",
          "notas": string
        }
      ]
    }
  ]
}

Necesito funciones para:
- Inicializar el storage si no existe
- Obtener todos los equipos
- Crear un equipo nuevo (genera id único, infoGeneral vacía, plantilla y
  fichajesDeseados como arrays vacíos)
- Editar nombre de un equipo
- Eliminar un equipo
- Agregar/editar/eliminar un jugador dentro de la plantilla de un equipo
- Agregar/editar/eliminar un fichaje deseado dentro de un equipo
- Actualizar la infoGeneral de un equipo
- Exportar todo el storage como archivo .json descargable

No quiero todavía la interfaz visual (HTML/CSS) ni las demás fases — solo esta
capa de datos en JavaScript puro, bien comentada, para que pueda entenderla y
probarla en consola antes de seguir con la pantalla principal.
```

---

*Documento generado a partir de una entrevista de definición de requisitos. Plantilla y fichajes basados en un ejemplo real de tu carrera con Tottenham Hotspur.*