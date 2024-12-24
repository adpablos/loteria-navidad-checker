# 🎄 Lotería Navidad Checker

Una pequeña herramienta para automatizar la comprobación de números de la Lotería de Navidad. Perfecta si, como yo, te toca gestionar un montón de participaciones para familia y amigos 😅

> ⚠️ **Importante**: Para verificar premios oficialmente, utiliza siempre los [canales oficiales de Loterías y Apuestas del Estado](https://www.loteriasyapuestas.es/es/).

## 🌟 ¿Por qué existe esto?

Todo empezó un 22 de diciembre, intentando trabajar mientras comprobaba decenas de números de lotería. Ya sabes, ese momento donde tienes mil pestañas abiertas con el comprobador oficial, la TV de fondo y el WhatsApp echando humo con la familia preguntando si ha tocado algo 😅

Así que me puse manos a la obra y creé algo que:
- ✨ Comprueba los números automáticamente
- 📱 Me avisa si hay suerte
- 📊 Gestiona todas las participaciones
- 💰 Calcula lo que toca a cada uno

## 🎯 Un Proyecto Personal

Durante el desarrollo he trasteado con:
- 💾 Sistemas de caché con TTL dinámico
- 🚦 Rate limiting para no saturar APIs
- 📊 Métricas y monitorización
- 🔄 Integración con Google Apps Script
- 🤖 Desarrollo asistido por IA

## 📦 Componentes

### 1. API REST (`/backend`)
API Node.js que se encarga de consultar y cachear los resultados oficiales.
[Ver documentación de la API](backend/README.md)

### 2. Google Sheets Client (`/sheets-client`)
Gestiona tus números en Google Sheets y recibe notificaciones automáticas.
[Ver documentación del cliente](sheets-client/README.md)

## 🚀 ¿Cómo Empezar?

Tienes dos opciones:

### 1. 🌐 Usar la API Pública
La forma más rápida: usa la API que ya tengo desplegada en Railway.

```javascript
const API_URL = "https://loteria-navidad-checker-production.up.railway.app";
```

> ⚠️ **Nota**: Esta API es gratuita y sin garantías de disponibilidad. Si necesitas algo más serio, mejor monta tu propia instancia.

### 2. 🛠️ Montar Tu Propia API

1. **En local:**
   ```bash
   git clone https://github.com/adpablos/loteria-navidad-checker
   cd loteria-navidad-checker/api
   npm install
   npm start
   ```

2. **En la nube:**
   - Puedes desplegar en Railway ([guía de despliegue](https://docs.railway.com/quick-start))
   - O donde prefieras vaya! Heroku, DigitalOcean, AWS, Google Cloud, Azure...

> 💡 **Tip**: Para usar la hoja de cálculo, revisa la [documentación del cliente](sheets-client/README.md).

## 🤝 Contribuciones

¿Has encontrado un bug? ¿Se te ocurre alguna mejora? Las contribuciones son bienvenidas 🙌

## 📜 Licencia

MIT License - Úsalo como quieras

## 🙏 Agradecimientos

Este proyecto no sería posible sin:
- 🤖 La ayuda de herramientas de IA que han agilizado el desarrollo
- 📚 La comunidad open source
- 🎓 Las ganas de aprender y experimentar
- ☕ Mucho café

---

Made with ❤️ by [Alex de Pablos](https://alexdepablos.com) | [GitHub](https://github.com/adpablos)