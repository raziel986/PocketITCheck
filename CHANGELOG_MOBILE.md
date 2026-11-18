# PocketITCheck - Changelog Optimización Móvil y Prevención de Errores

## Versión 2.1 - Optimización Móvil y Robustecimiento (2026-11-18)

### 🆕 Nuevas Funcionalidades

#### Optimización para Técnico Móvil
- **autoResizeTextarea()**: Textareas se ajustan automáticamente a su contenido, evitando recortes y mejorando la usabilidad en móviles
- **handleMobileFormScroll()**: Previene el problema del "viewport jump" en iOS cuando el teclado aparece, manteniendo fijos el FAB y la bottom nav
- **showStatusBanner()**: Notificaciones inline arriba del bottom nav reemplazando alerts bloqueantes; tipos info/success/error con auto-ocultado
- **validateRequiredFields()**: Validación robusta de campos obligatorios antes del submit del formulario
- **showErrorSummary()**: Muestra un resumen consolidado de todos los errores de validación en el formulario
- **safeFetch()**: Función wrapper para fetch con manejo centralizado de errores y banners de notificación

### 📱 Mejoras Móviles

#### Touch Targets y Gestos
- Todos los controles tienen `min-height: 48px` (cumple WCAG 2.5.5 Target Size)
- `touch-action: manipulation` en todos los elementos interactivos para reducir latencia y prevenir zoom accidental
- Pull-to-refresh en ambos contenedores de tablas (#officesTable, #inventoryTable)
- FAB posicionado con `env(safe-area-inset-bottom)` para compatibilidad con dispositivos con notch

#### Layouts Responsivos
- **Portrait**: Formularios de una columna, targets táctiles grandes
- **Landscape (corto)**: Menor padding, inputs 44px mínimo, toolbar adaptada
- **Tablet+**: Layouts de 2-4 columnas, grids adaptativos
- **Diagnóstico**: Grid de 2 columnas en landscape, single column en mobile

#### Rendimiento Móvil
- `-webkit-text-size-adjust: 100%` previene escalado de texto inesperado
- `overscroll-behavior: contain` en bottom nav evita conflictos con gestos de sistema
- `backface-visibility` optimizations en transiciones
- Debounce en eventos de touch para prevenir eventos múltiples

### 🛡️ Prevención de Errores en Procedimientos

#### Validación de Formularios
- **officeForm**: Valida campos obligatorios (company, depto, location, auditor)
- **equipForm**: Valida campos obligatorios (type, model, serial, assetTag, status, user)
- **Errores mostrados**: Resumen consolidado en lugar de validación individual silenciosa
- **Prevención**: Submit se bloquea si faltan campos requeridos

#### Manejo de Errores Async
- **safeFetch()**: Todos los operations fetch ahora tienen manejo de errores
- **showStatusBanner()**: Errores se comunican al usuario de forma visible, no se silencian
- **Timeouts apropiados**: Banners auto-ocultan después de 3-5 segundos
- **Logs de consola**: Errores se registran para debugging

#### Estado y Inicialización
- Todas las funciones móviles se ejecutan dentro de `DOMContentLoaded`
- Verificación `!el` antes de operar sobre elementos
- Bandera `isRefreshing` para prevenir pull-to-refresh múltiples concurrentes
- Limpeza de event listeners y elementos temporales (banners, error summaries)

### 📊 Archivos Modificados

| Archivo | Líneas Añadidas | Propósito Principal |
|---------|-----------------|---------------------|
| `js/ui.js` | ~301 | Funciones de optimización móvil y validación |
| `app.js` | ~331 | Integración de validaciones, inicializaciones, hooks |
| `index.css` | ~236+ | Estilos responsive, targets táctiles, media queries |
| `IMPLEMENTATION_SUMMARY.md` | Nuevo | Documentación completa de implementación |
| `CHANGELOG_MOBILE.md` | Nuevo | Registro de cambios de esta sesión |

### 🐛 Correcciones de Bugs

1. **toggleLanguage bug**: Función ahora exportada y llamada correctamente desde index.html
2. **Fragmento roto en app.js:390**: Código undefined removido, ahora funcional
3. **Field mode KeyN**: Atajo añadido para "Add new equipment"
4. **Pull-to-refresh**: Ahora funciona en ambos table containers con delay de 300ms para estabilidad
5. **Textarea init**: `autoResizeTextarea()` llamado en DOMContentLoaded para todos los textareas

### 🚀 Mejoras en Flujo de Trabajo Móvil

1. **Antes**: Formularios que se escapaban, alerts bloqueantes, targets táctiles pequeños
2. **Ahora**: Formularios que se ajustan, notificaciones inline, targets 48px, pull-to-refresh

### ⌨️ Atajos Móviles Agregados

- `KeyN` en field mode: Abrir formulario de nuevo equipo
- `F1` en cualquier momento: Mostrar overlay de ayuda con todos los atajos
- Pull-down en tablas: Refrescar datos

### 📱 Compatibilidad

- **Desktop**: Funcionalidad completa sin cambios visibles
- **Móvil (iOS/Android)**: Optimizaciones completas, sin breakages
- **Tablet**: Layouts adaptativos entre phone y desktop
- **PWA**: Instalable, funciona offline, todos los nuevos features disponibles

### 🔮 Próximas Mejoras Planificadas

- Integración con cámara para fotos del equipo (pending en esta sesión)
- Offline queue para cuando no hay conexión
- Sync selectivo a la nube
- Modo "offline-first" con colas de sincronización