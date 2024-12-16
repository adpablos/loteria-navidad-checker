# Loteria Navidad Checker

Aplicación para la gestión y comprobación de números premiados en la Lotería de Navidad. Permite a un grupo de usuarios introducir y compartir los décimos que han comprado, comprobar automáticamente si han sido premiados y recibir notificaciones por email.

## Características

*   **Gestión de décimos:** Permite a los usuarios introducir los números de la Lotería de Navidad que han comprado, junto con información adicional como quién lo ha comprado, para quién es, cuántos décimos se han comprado y entre cuántas personas se reparte.
*   **Comprobación automática de premios:** Consulta automáticamente la API de [Loterías y Apuestas del Estado](https://www.loteriasyapuestas.es/) para obtener los números premiados y comprueba si los décimos introducidos por los usuarios han sido premiados.
*   **Notificaciones por email:** Envía notificaciones por email a los usuarios si sus décimos han sido premiados, indicando el número premiado, el premio por décimo, el número de décimos jugados y el premio total.
*   **Tabla de premios principales:** Muestra una tabla con los premios principales del sorteo (Gordo, Segundo, Tercero, Cuartos y Quintos).
*   **Interfaz sencilla e intuitiva:** Utiliza una Google Spreadsheet como interfaz principal, lo que facilita su uso y comprensión.

## Componentes

*   **Google Apps Script:** Se encarga de la lógica de la aplicación, la interacción con la Google Spreadsheet y el envío de notificaciones.
*   **Railway:** Actúa como proxy para realizar las peticiones a la API de Loterías y Apuestas del Estado, evitando así posibles restricciones de acceso.
*   **API de Loterías y Apuestas del Estado:** Proporciona la información sobre los números premiados en el sorteo de la Lotería de Navidad.

## Configuración

1. **Google Spreadsheet:**
    *   Crea una copia de la siguiente Google Spreadsheet: [Enlace a la Spreadsheet](https://docs.google.com/spreadsheets/d/1cfpTYarDEG4ZgK8gWmQVo45H1jpVbDyOowPDco8tB-k/edit#gid=0)
    *   Abre el editor de scripts (Herramientas > Editor de secuencias de comandos).
2. **Railway (Backend):**
    *   Crea una cuenta en [Railway](https://railway.app/).
    *   Crea un nuevo proyecto en Railway.
    *   Elige "Empty Project".
    *   Conecta tu proyecto a un repositorio de GitHub (puedes usar este mismo repositorio).
    *   Dentro del proyecto, crea un nuevo servicio ("New" -> "Empty Service").
    *   En la pestaña "Settings" -> "Domains" -> "Generate Domain", genera un dominio para tu servicio.
    *   En tu repositorio de GitHub, crea un archivo llamado `index.js` con el código que se proporciona más abajo.
    *   Crea un archivo `package.json` en tu repositorio con el siguiente contenido:

    ```json
    {
      "name": "loteria-proxy",
      "version": "1.0.0",
      "description": "Proxy para la API de loteriasyapuestas.es",
      "main": "index.js",
      "scripts": {
        "start": "node index.js"
      },
      "dependencies": {
        "express": "^4.18.2",
        "node-fetch": "^2.7.0"
      }
    }
    ```
3. **Google Apps Script:**
    *   En el script, actualiza la constante `RAILWAY_PROXY_URL` con la URL de tu aplicación en Railway.
    *   Actualiza la constante `SORTEO_ID` con el ID del sorteo de la Lotería de Navidad del año en curso. Puedes obtenerlo de la API de Loterías y Apuestas del Estado.
    *   Guarda los cambios.
4. **(Opcional) Crear disparadores:**
    *   En el editor de scripts, ejecuta la función `createTrigger` una sola vez para crear los disparadores automáticos. Esto hará que la comprobación de premios y el envío de notificaciones se ejecuten automáticamente cada hora el día del sorteo.

## Uso
1. Abre la Google Spreadsheet.
2. Introduce los datos de los décimos en la tabla.
3. En el menú "Loteria", haz clic en "Actualizar Resultados" para comprobar los premios.
4. En el menú "Loteria", haz clic en "Actualizar Premios Principales" para obtener la lista de premios principales.
5. En el menú "Loteria", haz clic en "Enviar Notificaciones" para enviar notificaciones por email a los usuarios que hayan ganado algún premio.

## Contribuciones
Las contribuciones son bienvenidas. Si encuentras algún error o tienes alguna sugerencia, por favor, abre un issue o envía un pull request.

## Licencia
Este proyecto está bajo la licencia MIT.