# Lotería de Navidad API 🎄

API REST moderna para consultar los resultados los sorteos de la Lotería Nacional de España. Diseñada para ser rápida, fiable y fácil de usar.

## 🌟 Características Técnicas

- 🚀 Express.js con arquitectura modular
- 💾 Sistema de caché inteligente con TTL dinámico
- 📝 Logging estructurado con Pino
- 📊 Métricas y monitorización con endpoints dedicados
- 🔒 Rate limiting por IP
- ✨ Validación de parámetros con express-validator
- 🔍 Trazabilidad con request IDs
- 📚 Documentación OpenAPI/Swagger

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Documentación**: OpenAPI 3.0
- **Logging**: Pino
- **Validación**: express-validator
- **Testing**: Jest
- **CI/CD**: GitHub Actions

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm start

# Tests
npm test
```

## 🔌 Endpoints

### Estado del Sorteo
```http
GET /api/lottery/state
```
Obtiene el estado actual de la celebración del sorteo.

### Información de Décimo
```http
GET /api/lottery/ticket/{drawId}
```
Obtiene información detallada sobre un décimo específico.

### Resultados Completos
```http
GET /api/lottery/results/{drawId}
```
Obtiene los resultados completos de un sorteo.

### Métricas
```http
GET /api/metrics
```
Proporciona métricas de rendimiento y uso.

## ⚙️ Configuración

Variables de entorno disponibles:
```env
PORT=3000
NODE_ENV=development
CACHE_TTL=1800
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📈 Monitorización

La API incluye endpoints de monitorización que proporcionan:
- Estadísticas de caché (hits/misses)
- Tiempos de respuesta
- Códigos de estado HTTP
- Uso de memoria
- Métricas personalizadas

## 🔒 Seguridad

Medidas implementadas:
- Rate limiting por IP
- Validación de parámetros
- Headers de seguridad
- Sanitización de inputs

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Coverage
npm run test:coverage

# Modo watch
npm run test:watch
```

## 📚 Documentación

Swagger UI disponible en:
```
http://localhost:3000/api-docs
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo

- La API está diseñada para ser stateless
- Implementa circuit breakers para llamadas externas
- Usa caché inteligente para optimizar respuestas
- Incluye rate limiting para proteger el servicio

## 🔗 Enlaces Útiles

- [Documentación de la API](http://localhost:3000/api-docs)
- [Changelog](CHANGELOG.md)

---

Parte del proyecto [Lotería Navidad Checker](../README.md) | [GitHub](https://github.com/adpablos)