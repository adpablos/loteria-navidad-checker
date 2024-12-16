# Lotería Navidad Checker

Aplicación para la gestión y comprobación de números premiados en la Lotería de Navidad. Permite a un grupo de usuarios introducir y compartir los décimos que han comprado, comprobar automáticamente si han sido premiados y recibir notificaciones por email.

## Características

*   **Gestión de décimos:** Permite a los usuarios introducir los números de la Lotería de Navidad que han comprado, junto con información adicional como quién lo ha comprado, para quién es, cuántos décimos se han comprado y entre cuántas personas se reparte.
*   **Comprobación automática de premios:** Consulta automáticamente la API de [Loterías y Apuestas del Estado](https://www.loteriasyapuestas.es/) a través de un proxy en Railway para obtener los números premiados y comprueba si los décimos introducidos por los usuarios han sido premiados.
*   **Notificaciones por email:** Envía notificaciones por email a los usuarios si sus décimos han sido premiados, indicando el número premiado, el premio por décimo, el número de décimos jugados y el premio total.
*   **Tabla de premios principales:** Muestra una tabla con los premios principales del sorteo (Gordo, Segundo, Tercero, Cuartos y Quintos).
*   **Interfaz sencilla e intuitiva:** Utiliza una Google Spreadsheet como interfaz principal, lo que facilita su uso y comprensión.
*   **Proxy en Railway:** Utiliza un proxy desplegado en Railway para realizar las peticiones a la API de Loterías y Apuestas del Estado, evitando así posibles restricciones de acceso y mejorando la seguridad.
*   **Limitación de peticiones (Rate Limiting):** Implementa un mecanismo para limitar el número de peticiones por IP para evitar abusos.
*   **Caché:** Almacena en caché las respuestas de la API para mejorar el rendimiento y reducir el número de peticiones a la API externa.

## Componentes

*   **Google Apps Script:** Se encarga de la lógica de la aplicación, la interacción con la Google Spreadsheet y el envío de notificaciones.
*   **Railway:** Actúa como proxy para realizar las peticiones a la API de Loterías y Apuestas del Estado.
*   **API de Loterías y Apuestas del Estado:** Proporciona la información sobre los números premiados en el sorteo de la Lotería de Navidad.
*   **Node.js:** Entorno de ejecución para el proxy en Railway.
*   **Express:** Framework web para el proxy en Railway.
*   **node-fetch:** Librería para realizar peticiones HTTP desde el proxy a la API.
*   **pino:** Librería para el logging en el proxy.
*   **express-rate-limit:** Librería para la limitación de peticiones en el proxy.

## Configuración

1. **Google Spreadsheet:**
    *   Crea una copia de la siguiente Google Spreadsheet: [Enlace a la Spreadsheet](https://docs.google.com/spreadsheets/d/1cfpTYarDEG4ZgK8gWmQVo45H1jpVbDyOowPDco8tB-k/edit#gid=0)
    *   Abre el editor de scripts (Herramientas > Editor de secuencias de comandos).
    *   En el archivo `Code.gs`, actualiza la constante `RAILWAY_PROXY_URL` con la URL de tu aplicación en Railway (ver paso 2).
    * Actualiza la constante `DRAW_ID` con el ID del sorteo de la Lotería de Navidad del año en curso. Puedes obtenerlo realizando una petición a la API de Loterías y Apuestas del Estado usando el siguiente comando curl (inspecciona la URL en la herramienta para desarrolladores de tu navegador para obtener las cabeceras actualizadas, ya que estas pueden cambiar):

      ```bash
      curl 'https://www.loteriasyapuestas.es/servicios/proximosv3?game_id=LNAC&num=6' \
        -H 'accept: application/json, text/javascript, */*; q=0.01' \
        -H 'accept-language: en,es-ES;q=0.9,es;q=0.8' \
        -H 'referer: https://www.loteriasyapuestas.es/es/resultados/loteria-nacional/comprobar' \
        -H 'sec-ch-ua: "Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"' \
        -H 'sec-ch-ua-mobile: ?0' \
        -H 'sec-ch-ua-platform: "macOS"' \
        -H 'sec-fetch-dest: empty' \
        -H 'sec-fetch-mode: cors' \
        -H 'sec-fetch-site: same-origin' \
        -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' \
        -H 'x-requested-with: XMLHttpRequest'
      ```

      Busca en la respuesta JSON el objeto con el campo `"nombre": "SORTEO EXTRAORDINARIO DE NAVIDAD"` y obtén el valor del campo `id_sorteo`.
    *   Guarda los cambios.

2. **Railway (Backend):**
    *   Crea una cuenta en [Railway](https://railway.app/).
    *   Crea un nuevo proyecto en Railway y selecciona "GitHub Repo".
    *   Conecta tu proyecto al repositorio de GitHub que contiene el código del proxy (`index.js`, `package.json`, `lotteryApi.js` y `cache.js`).
    *   Una vez que se ha creado el proyecto, ve a la pestaña "Settings" y, en la sección "Domains", genera un dominio para tu servicio. Copia esta URL, la necesitarás en el paso 1.
    *   Ve a la pestaña "Variables" y añade las siguientes variables de entorno:
        *   `LOG_LEVEL`: `info` (o el nivel de log que prefieras)
        *   `RATE_LIMIT_MAX`: `100` (o el número máximo de peticiones por minuto que quieras permitir)
        *   `CACHE_TTL`: `1800` (o el tiempo de vida de la caché en segundos que prefieras)
        *   `DEFAULT_DRAW_ID`: `1259409102` (o el ID del sorteo por defecto que quieras usar)
    *   Haz clic en "Deploy" para desplegar la aplicación.

3. **(Opcional) Crear disparadores:**
    *   En el editor de scripts de Google Apps Script, ejecuta la función `createTrigger` una sola vez para crear los disparadores automáticos. Esto hará que la comprobación de premios y el envío de notificaciones se ejecuten automáticamente cada hora el día del sorteo.

## Código del backend (index.js, lotteryApi.js, cache.js y package.json para Railway)

El código del backend, que debe ir en el repositorio de GitHub conectado a tu proyecto de Railway, se encuentra en los mensajes anteriores de esta conversación. 

Asegúrate de tener los siguientes archivos en tu repositorio:
* `index.js`
* `lotteryApi.js`
* `cache.js`
* `package.json`

## Uso

1. Abre la Google Spreadsheet.
2. Introduce los datos de los décimos en la tabla.
3. En el menú "Loteria", haz clic en "Update Results" para comprobar los premios.
4. En el menú "Loteria", haz clic en "Update Main Awards" para obtener la lista de premios principales.
5. En el menú "Loteria", haz clic en "Send Notifications" para enviar notificaciones por email a los usuarios que hayan ganado algún premio.
6. Opcionalmente, puedes usar el endpoint `/api/lottery/clearcache` de tu proxy en Railway para limpiar la caché manualmente.

## Contribuciones

Las contribuciones son bienvenidas. Si encuentras algún error o tienes alguna sugerencia, por favor, abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la licencia MIT.