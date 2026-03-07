# PocketITCheck - SPA & PWA

**Inventory | Diagnostics | Maintenance | Repairs**

PocketITCheck es una Aplicación Web Progresiva (PWA) de Página Única (SPA) contenida íntegramente en un solo archivo `index.html`. Está diseñada para ser una herramienta rápida, extremadamente portátil y que funciona sin necesidad de un servidor *backend*. Permite a auditores, técnicos de soporte y administradores de TI llevar un registro organizado, multi-oficina y offline de los activos informáticos con una experiencia tipo aplicación nativa en dispositivos móviles.

## ✨ Características Principales

- **Diseño Todo-en-Uno (Zero-Install):** Todo el código vive en un solo archivo. Simplemente ábrelo y comienza a trabajar.
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
- **Privacidad Total:** Los datos se guardan localmente en el navegador (`localStorage`), garantizando que la información nunca salga de tu dispositivo.

---

## 🚀 Cómo usar e Instalar

### Uso Rápido
1. Abre `index.html` en cualquier navegador moderno.
2. Comienza a registrar oficinas y equipos.

### Instalación como App (PWA) - Opción Recomendada
Para disfrutar de la experiencia completa sin barras de navegación y con soporte offline:
1. **Sube los archivos** (`index.html`, `manifest.json`, `sw.js`, `icon-512.png`) a un servicio de hosting con HTTPS (como **GitHub Pages**).
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
  - **Google Fonts:** Tipografía *Outfit* para una estética moderna y premium.

---

## 📜 Licencia y Derechos de Autor

PocketITCheck está protegido bajo la **Licencia MIT**.

Esto significa que eres libre de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software, siempre y cuando se incluya el aviso de copyright original.

---

## 👨‍💻 Créditos

Desarrollado por **Carlos Noguera**  
🌐 Web: [https://raziel986.github.io/PocketITCheck/](https://raziel986.github.io/PocketITCheck/)
