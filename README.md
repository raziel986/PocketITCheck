# PocketITCheck - SPA & PWA

**Inventory | Diagnostics | Maintenance | Repairs**

PocketITCheck es una Aplicación Web Progresiva (PWA) de Página Única (SPA) construida con JavaScript modular (ESM), sin servidor *backend*. Está diseñada para ser una herramienta rápida, extremadamente portátil y que funciona offline. Permite a auditores, técnicos de soporte y administradores de TI llevar un registro organizado, multi-oficina de los activos informáticos con una experiencia tipo aplicación nativa en dispositivos móviles.

## ✨ Características Principales

- **Sin backend (Zero-Backend):** Todo funciona en el dispositivo; no hay servidor ni cuentas que configurar. Requiere servirse por HTTP(S) (los módulos ES no cargan desde `file://`).
- **PWA Ready (Mobile First):** Instalable en Android e iOS como una aplicación nativa. Incluye soporte para **Modo Offline** gracias a su Service Worker.
- **Gestión Avanzada de Tablas (DataTables-Like):** 
  - Búsqueda en tiempo real multi-campo.
  - Paginación inteligente y ajustable (10, 25, 50, Todos).
  - Interfaz optimizada para pantallas táctiles (48px target).
- **Módulo de Diagnóstico Técnico Integrado:**
  - Checklist granular de Hardware (Energía, Almacenamiento, RAM, Térmico, Limpieza).
  - Checklist granular de Software (Sistema Operativo, Seguridad, Rendimiento, Licencias).
  - Subcategorías detalladas con descripciones técnicas (S.M.A.R.T., Firewall, Drivers, etc.).
  - Vinculación automática del estado general con las subcategorías.
- **Plan de Mantenimiento IT:**
  - Generación automática de planes de mantenimiento preventivo y correctivo.
  - Plan Maestro consolidado en formato de tabla horizontal (Landscape).
  - Guías técnicas paso a paso para cada diagnóstico con fallos.
- **Reportes PDF Profesionales:** 
  - **Inventario de Equipos IT:** Dashboard de resumen, datos del auditor, paginación, firmas y sellos.
  - **Plan de Mantenimiento IT:** Tabla consolidada con equipos, diagnósticos y acciones requeridas.
  - **Firmas y Sellos:** Bloques de firma del auditor técnico, sello de la empresa y firma de aprobación.
  - **Propiedades Documentales:** Metadatos internos (Título, Autor) configurados automáticamente.
- **Atributos Dinámicos por Categoría:** Formulario inteligente que muestra campos específicos según el tipo de equipo (Laptop, Desktop, etc.).
- **Privacidad Total:** Los datos (incluidas las fotos) se guardan localmente en IndexedDB, garantizando que la información nunca salga de tu dispositivo.
- **Foto por equipo:** Captura con la cámara nativa, se comprime antes de guardarse y se incluye como apéndice en el PDF de inventario.

---

## 🚀 Cómo usar e Instalar

### Uso Rápido (local)
Sirve la carpeta con cualquier servidor estático; por ejemplo:
```bash
python -m http.server 8765
```
Después abre `http://localhost:8765/`. No funciona abriendo `index.html` con doble clic, porque los módulos ES requieren HTTP.

### Instalación como App (PWA) - Opción Recomendada
Para disfrutar de la experiencia completa sin barras de navegación y con soporte offline:
1. **Sube todos los archivos** del proyecto (incluidos `manifest.json`, `sw.js`, `icon-192.png` e `icon-512.png`) a un hosting con **HTTPS** (como **GitHub Pages**). El service worker y el aviso de instalación solo funcionan en HTTPS (o `localhost`). Si abres la app por HTTP desde el móvil, verás un aviso: los formularios y las fotos siguen funcionando, pero no la instalación ni el modo offline.
2. Abre la URL en tu móvil.
3. **Android**: Pulsa "Instalar" en el aviso inferior o en el menú de Chrome.
4. **iOS (iPhone)**: Pulsa el botón "Compartir" en Safari y selecciona **"Agregar a la pantalla de inicio"**.

---

## 🛠️ Tecnologías Utilizadas

- **Núcleo:** HTML5, CSS3 (*Glassmorphism*), Vanilla JavaScript (ES6+).
- **PWA:** Web App Manifest y Service Workers para almacenamiento en caché y offline.
- **Librerías (CDN):**
  - [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable): Generación de reportes de auditoría y planes de mantenimiento.
  - [SweetAlert2](https://sweetalert2.github.io/): Alertas y confirmaciones interactivas.
  - **Google Fonts:** Tipografías *Inter* y *Manrope* para una estética moderna y premium.

---

## 📜 Licencia y Derechos de Autor

PocketITCheck está protegido bajo la **Licencia MIT**.

Esto significa que eres libre de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software, siempre y cuando se incluya el aviso de copyright original.

---

## 👨‍💻 Créditos

Desarrollado por **Carlos Noguera**  
🌐 Web: [https://raziel986.github.io/PocketITCheck/](https://raziel986.github.io/PocketITCheck/)
