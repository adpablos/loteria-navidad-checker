# 🎄 Lotería Navidad Checker

¿Cansado de revisar manualmente tus números de la Lotería de Navidad? ¿Te toca gestionar decenas de participaciones para familia, amigos o compañeros de trabajo? ¡Este proyecto es para ti!

> ⚠️ **Importante**: Esta es una herramienta de "juguete" creada con fines educativos y de diversión. Para verificar premios oficialmente, utiliza siempre los [canales oficiales de Loterías y Apuestas del Estado](https://www.loteriasyapuestas.es/es). No nos hacemos responsables de posibles errores en la comprobación.

## 🌟 La Historia

Todo empezó con un problema común: gestionar los números de Lotería de Navidad compartidos entre familia y amigos. Ya sabes, ese momento del 22 de diciembre donde tienes que estar pendiente de múltiples números mientras intentas trabajar, comer o vivir tu vida 😅

En lugar de estar pegado a la TV o actualizando constantemente la web oficial, creamos un sistema que:
- ✨ Comprueba automáticamente tus números
- 📱 Te avisa si te toca algo
- 📊 Gestiona todas las participaciones
- 💰 Calcula exactamente cuánto ha tocado a cada uno

## 🎯 Un Proyecto de Aprendizaje

Este proyecto nació con dos objetivos principales:
1. 🎯 Resolver un problema real de forma divertida
2. 📚 Aprender y experimentar con nuevas tecnologías

Durante el desarrollo, he aprendido y aplicado conceptos como:
- 💾 Sistemas de caché con TTL dinámico
- 🚦 Rate limiting para proteger APIs
- 📊 Métricas y monitorización
- 🔄 Integración con Google Apps Script
- 🤖 Desarrollo asistido por IA

Todo el proyecto se ha desarrollado en tiempo récord gracias a la ayuda de herramientas de IA, pero sin sacrificar calidad ni buenas prácticas. ¡La tecnología moderna es asombrosa! 🚀

## 🎯 Perfecto Para

- 👨‍👩‍👧‍👦 Grupos familiares que comparten números
- 🏢 Empresas que reparten lotería entre empleados
- 🏫 Asociaciones que venden participaciones
- 🎯 Cualquiera que quiera automatizar la comprobación de sus números

## 📦 Componentes

### 1. API REST (`/api`)
API Node.js que se encarga de consultar y cachear los resultados oficiales.
[Ver documentación de la API](api/README.md)

### 2. Google Sheets Client (`/sheets-client`)
Gestiona tus números en Google Sheets y recibe notificaciones automáticas.
[Ver documentación del cliente](sheets-client/README.md)

## 🚀 ¿Cómo Empezar?

Tienes dos opciones para usar este proyecto:

### 1. 🌐 Usar la API Pública
La forma más rápida de empezar: usa nuestra API ya desplegada en Railway.

```javascript
const API_URL = "https://loteria-navidad-checker-production.up.railway.app";
```

> ⚠️ **Nota**: Esta API es gratuita y se ofrece "tal cual", sin garantías de disponibilidad. Si necesitas un servicio con garantías, considera desplegar tu propia instancia.

### 2. 🛠️ Desplegar Tu Propia API
¿Prefieres tener el control total? ¡Adelante!

1. **Opción Local:**
   ```bash
   git clone https://github.com/adpablos/loteria-navidad-checker
   cd loteria-navidad-checker/api
   npm install
   npm start
   ```

2. **Despliegue en la Nube:**
   - Puedes desplegar en Railway ([guía de despliegue](docs/deployment.md))
   - O en cualquier otro servicio como Heroku, DigitalOcean, etc.

### 3. 📊 Configurar Google Sheets
Independientemente de qué API uses:
1. Crea una copia de [esta plantilla](https://docs.google.com/spreadsheets/...)
2. Configura la URL de la API en el script
3. ¡Listo para usar!

## 📝 Documentación

- [Documentación técnica de la API](api/README.md)

## 🤝 Contribuir

¿Tienes ideas para mejorar el proyecto? ¿Has encontrado un bug? ¿Quieres añadir una feature? ¡Las contribuciones son más que bienvenidas! 

Este proyecto es ideal para:
- 🎓 Aprender sobre desarrollo de APIs
- 🔧 Experimentar con sistemas de caché
- 📊 Practicar con métricas y monitorización
- 🤖 Ver cómo la IA puede ayudar en el desarrollo

## 📜 Licencia

MIT License - ¡Siéntete libre de usar y modificar!

## 🤝 Agradecimientos

Este proyecto no sería posible sin:
- 🤖 La asistencia de herramientas de IA que han acelerado el desarrollo
- 📚 La comunidad open source y sus increíbles herramientas
- 🎓 Las ganas de aprender y experimentar
- ☕ Mucho café

> 🎮 Recuerda: ¡Esto es un proyecto "de juguete"! Diviértete usándolo, aprende de su código, pero para comprobar premios oficialmente, usa siempre los canales oficiales.

---

Made with ❤️, ☕ and 🤖 | [Sígueme en GitHub](https://github.com/adpablos)