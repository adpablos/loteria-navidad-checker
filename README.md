# 🎄 Lotería Navidad Checker

Gestiona y comprueba automáticamente tus números de la Lotería de Navidad. Una solución completa que combina una interfaz amigable en Google Sheets con un robusto backend para el seguimiento en tiempo real de los premios.

## 🌟 Historia

Este proyecto nació de la necesidad de gestionar eficientemente los números de Lotería de Navidad compartidos entre familia y amigos. En lugar de revisar manualmente cada número durante el sorteo, esta herramienta automatiza todo el proceso, desde el seguimiento de quién tiene qué número hasta la notificación de premios.

## 🎯 Perfecto Para

- Grupos familiares que comparten números
- Empresas que reparten lotería entre empleados
- Asociaciones que venden participaciones
- Cualquiera que quiera gestionar múltiples números de lotería

## ✨ Características

- 📊 Interfaz intuitiva en Google Sheets
- 🔄 Actualización en tiempo real durante el sorteo
- 📧 Notificaciones automáticas por email
- 💰 Cálculo automático de premios
- 🚀 API REST con caché inteligente
- 🛡️ Protección contra sobrecarga (Rate Limiting)
- 📝 Logging detallado
- 🧪 Modo simulación para pruebas

## 🏗️ Arquitectura

### Frontend (Google Apps Script)
- Gestión de datos en hojas de cálculo
- Interfaz de usuario mediante menús personalizados
- Sistema de notificaciones por email
- Validación de datos y cálculos automáticos

### Backend (Node.js + Railway)
- API REST con Express
- Sistema de caché con TTL dinámico
- Rate limiting por IP
- Logging estructurado con Pino
- Proxy seguro para la API oficial

## 🚀 Inicio Rápido

1. **Configura la hoja de cálculo:**
```bash
# 1. Crea una copia de la plantilla
# 2. Abre el editor de scripts
# 3. Actualiza la URL del proxy
```

2. **Despliega el backend:**
```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/loteria-navidad-checker.git

# Instala dependencias
npm install

# Configura las variables de entorno
cp .env.example .env

# Inicia el servidor
npm start
```

## 🛠️ Tecnologías

- **Frontend:**
  - Google Apps Script
  - Google Sheets API
  - HTML/CSS para interfaces personalizadas

- **Backend:**
  - Node.js
  - Express
  - Pino (logging)
  - node-fetch
  - express-rate-limit

## 📦 Estructura del Proyecto

```
loteria-navidad-checker/
├── Code.gs                 # Google Apps Script
├── config.js              # Configuración centralizada
├── index.js              # Punto de entrada del servidor
├── cache.js              # Sistema de caché
├── services/
│   └── LotteryApiService.js
└── utils/
    ├── logger.js
    └── lotteryUtils.js
```

## 🔧 Configuración

### Variables de Entorno
```env
PORT=3000
LOG_LEVEL=info
RATE_LIMIT_MAX=100
CACHE_TTL=1800
DEFAULT_DRAW_ID=1259409102
```

### Railway
1. Conecta tu repositorio
2. Configura las variables de entorno
3. ¡Listo para desplegar!

## 📈 Características Avanzadas

- **Caché Inteligente:**
  - TTL dinámico basado en el estado del sorteo
  - Limpieza automática
  - Endpoint manual para limpieza

- **Gestión de Errores:**
  - Logging estructurado
  - Respuestas de error consistentes
  - Fallbacks automáticos

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor, revisa nuestras guías de contribución antes de enviar un PR.

## 📝 Licencia

MIT License - ¡Siéntete libre de usar y modificar!

## 🙏 Agradecimientos

Desarrollado con la ayuda de la comunidad open source y herramientas de IA, demostrando cómo la tecnología moderna puede simplificar tareas tradicionales.

---

Made with ❤️ and 🎄 | [Sígueme en GitHub](https://github.com/adpablos)