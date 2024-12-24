# 📊 Google Sheets Client para Lotería Navidad

La parte más práctica del proyecto: una hoja de cálculo en Google Sheets que hace todo el trabajo sucio por ti. Perfecta para gestionar esos números de lotería que acabas repartiendo entre familia y amigos 😅

## 🎯 ¿Qué hace esto?

- 📝 Gestiona todos tus números en una tabla
- 💰 Calcula premios y participaciones automáticamente
- 📱 Te avisa por email si hay suerte
- 🔄 Durante el sorteo, se actualiza solo cada 5 minutos

## 🚀 Empezar a usar

### 1. Copia la plantilla
1. Abre [esta plantilla](https://docs.google.com/spreadsheets/d/1PaHa4m94kj7kgdh1joHBcrlbr2PBwcoMP-2rWc9Rx4E/edit?usp=sharing)
2. Haz una copia (Archivo > Hacer una copia)
3. ¡Ya tienes tu propia hoja!

### 2. Autoriza el script
La primera vez que uses la hoja, necesitarás dar algunos permisos:

1. Verás un mensaje de "Authorization required" - Haz clic en "Review permissions"
2. Elige tu cuenta de Google
3. Verás un aviso de "Google hasn't verified this app"
   - Es normal, es porque es una app personal
   - Haz clic en "Advanced" y luego en "Go to Premio flash (unsafe)"
4. Revisa los permisos que necesita el script:
   - Acceder a tus hojas de cálculo
   - Enviar emails en tu nombre (para las notificaciones)
   - Ejecutarse automáticamente (para las actualizaciones)
5. Haz clic en "Allow"

> 💡 **¿Por qué estos permisos?** Son necesarios para que el script pueda actualizar la hoja y enviarte notificaciones si hay premios. No se usa para nada más.

### 3. Configura las notificaciones
1. En la celda B7, pon tu email para notificaciones
   - Puedes poner hasta 5 emails separados por comas
   - Ejemplo: `tu@email.com, familiar@email.com`

### 4. Añade tus números
En la tabla principal:
- **Número**: El número del décimo (5 dígitos)
- **Decimos**: Cuántos décimos tienes
- **Quien**: Quién lo compró
- **Para**: Para quién es (familia, amigos...)

## ⚡ Durante el sorteo (22 de diciembre)

La hoja funciona automáticamente:
- 🕒 Se activa sola de 9:00 a 15:00
- 🔄 Actualiza los resultados cada 5 minutos
- 📧 Te avisa por email si toca algo
- 💰 Calcula los premios al momento

## 🎮 Menú "Lotería"

Tienes estas opciones:
- **Actualizar Resultados**: Comprueba todo manualmente
- **Enviar Notificaciones**: Fuerza el envío de avisos
- **Iniciar/Detener Auto-actualización**: 
  - Inicia: Activa las actualizaciones cada 5 minutos
  - Detener: Pausa las actualizaciones automáticas
- **Limpiar Cache**: Si ves algo raro, prueba esto
- **Ver Instrucciones**: Abre la guía detallada

## 📱 Notificaciones por email

Si toca algo, recibirás un email con:
- 🎯 El número premiado
- 💶 Premio por décimo
- 🎊 Cantidad total que te corresponde
- 📊 Detalles de la participación

## 🤔 FAQ

**P: ¿Necesito tener la hoja abierta durante el sorteo?**
R: No, se actualiza sola aunque esté cerrada.

**P: ¿Cada cuánto se actualizan los números?**
R: Durante el sorteo, cada 5 minutos automáticamente.

**P: ¿Puedo tener varios emails para notificaciones?**
R: Sí, hasta 5 emails separados por comas en la celda B7.

**P: ¿Y si quiero actualizar manualmente?**
R: Usa el menú Lotería > Actualizar Resultados.

## 🐛 Solución de problemas

- Si ves `#ERROR!`: 
  - Revisa que el número tenga 5 dígitos
  - Usa el formato correcto (sin espacios ni puntos)

- Si no actualiza:
  - Comprueba tu conexión a internet
  - Usa "Limpiar Cache" en el menú
  - Intenta actualizar manualmente

- Si no llegan los emails:
  - Verifica el email en la celda B7
  - Mira en la carpeta de spam
  - Prueba "Enviar Notificaciones" en el menú

---

¿Dudas? [Abre un issue](https://github.com/adpablos/loteria-navidad-checker/issues) 🤘 