# Guía de GS Agenda 2.0

## 1. Subir los cambios a GitHub (desde el navegador)
1. Descomprime el ZIP en tu computador.
2. Abre tu repositorio `GS-Agenda` en GitHub y elige **Add file > Upload files**.
3. Abre la carpeta descomprimida, selecciona todo su contenido (carpeta `app`, `README.md`, `GUIA.md` y los demás archivos) y arrástralo a la página de GitHub.
4. Escribe un mensaje como “GS Agenda 2.0” y pulsa **Commit changes**.
5. Ve a la pestaña **Actions**: se inicia “Compilar GS Agenda APK”. Tarda unos minutos.

Si la compilación sale en rojo, abre el paso que falló, copia el mensaje de error y pégalo en el chat con Claude para corregirlo.

## 2. Instalar en el celular
1. Cuando la compilación salga en verde, entra a ella y descarga el artefacto **GS-Agenda-APK** (llega como ZIP; adentro está `app-debug.apk`).
2. Pásalo al celular (WhatsApp, Drive o cable) y ábrelo para instalar. Si Android lo pide, permite instalar apps de esa fuente.
3. **Esta primera vez desinstala la versión anterior** antes de instalar, porque cambió la firma. Desde ahora, cada versión nueva se instalará encima sin perder datos.
4. Al abrir, crea tu clave de acceso (6 o más caracteres) y acepta las notificaciones. Puedes activar la huella.
5. En **Ajustes > Notificaciones > Revisar**, permite “Alarmas y recordatorios” para que los avisos lleguen al minuto exacto.

## 3. Usarla en el PC (sin instalar programas)
La interfaz es la carpeta `app/src/main/assets/web`. Para tenerla como app de escritorio:

1. Entra a vercel.com con tu cuenta y elige **Add New > Project**, importando el repositorio `GS-Agenda`.
2. En **Root Directory** escribe `app/src/main/assets/web`. Framework: **Other**. No hace falta comando de compilación.
3. Pulsa **Deploy**. Te dará una dirección del tipo `gs-agenda-xxxx.vercel.app`.
4. Ábrela en **Microsoft Edge** y, en el menú ··· > **Aplicaciones > Instalar este sitio como una aplicación**. Queda con su ícono y su propia ventana.

Tus tareas **no se suben a Vercel**: allí solo está el código de la app. Las tareas viven en tu equipo y en tu archivo cifrado de OneDrive. Sin tu clave, nadie puede abrirlas.

Cada vez que subas cambios a GitHub, Vercel actualiza la app del PC sola.

Si prefieres no publicarla, también puedes abrir `index.html` directamente con Edge, aunque así no se instala como aplicación.

## 4. Sincronizar celular y PC con OneDrive
1. En tu OneDrive (la carpeta que se sincroniza en el PC) crea una carpeta llamada **GS Agenda**.
2. En la app del PC: **Ajustes > Sincronización > Conectar carpeta** y elige esa carpeta. Edge pedirá permiso para ver y editar; acéptalo. Se crea el archivo `gs-agenda.datos` y la subcarpeta `solicitudes`.
3. En el celular instala la app de OneDrive con tu cuenta. Luego en GS Agenda: **Ajustes > Sincronización > Elegir archivo existente**, entra a OneDrive > GS Agenda y elige `gs-agenda.datos`.
4. Usa **la misma clave** en los dos. Si la cambias en uno, el otro te la pedirá al sincronizar.

La app sincroniza sola al abrirse, al guardar cambios y cada dos minutos. Si el celular pierde la conexión con el archivo (por ejemplo, tras actualizar OneDrive), vuelve a elegirlo.

En el PC, por seguridad, Edge puede pedir que confirmes el permiso de la carpeta cada vez que abres la app: aparece un aviso con el botón **Permitir acceso**.

## 5. Convertir correos en tareas con Power Automate
Usa conectores estándar de Microsoft 365 (Outlook y OneDrive para la Empresa); no requiere registros de TI.

### Flujo 1: correos marcados con bandera (recomendado)
1. Entra a make.powerautomate.com > **Crear > Flujo de nube automatizado**.
2. Nombre: “GS Agenda: correo marcado”. Desencadenador: **Cuando se marca un correo electrónico** (Office 365 Outlook). Usa la versión más reciente que aparezca.
3. Agrega la acción **Redactar** (Data Operation) y en **Entradas** pega esto, reemplazando cada valor entre comillas por el contenido dinámico indicado (deja las comillas):

```
{
  "id": "Id. del mensaje",
  "asunto": "Asunto",
  "de": "De",
  "recibido": "Hora de recepción",
  "vista": "Vista previa del cuerpo",
  "enlace": "ver expresión abajo"
}
```

Para `enlace`, en lugar de contenido dinámico usa **Expresión** y escribe:

```
concat('https://outlook.office.com/mail/deeplink/read/', encodeUriComponent(triggerOutputs()?['body/id']))
```

4. Agrega la acción **Crear archivo** (OneDrive para la Empresa):
   - **Ruta de acceso de la carpeta**: `/GS Agenda/solicitudes`
   - **Nombre de archivo**: expresión `concat('correo-', ticks(utcNow()), '.json')`
   - **Contenido del archivo**: la **Salida** de Redactar.
5. Guarda y prueba marcando un correo con bandera. En uno o dos minutos aparece en **Solicitudes** de la app del PC.

### Flujo 2 (opcional): carpeta “Tareas” para correos automáticos
Útil si quieres que ciertos remitentes se vuelvan solicitud sin marcarlos.
1. En Outlook crea la carpeta **Tareas** y una **regla** que mueva allí los correos de esos remitentes o con ciertas palabras en el asunto.
2. Copia el Flujo 1 (··· > **Guardar como**) y cambia el desencadenador por **Cuando llega un correo electrónico nuevo**, con **Carpeta: Tareas**.

Mover un correo a mano a la carpeta no siempre activa este desencadenador; para correos que eliges tú, usa la bandera.

### Qué pasa en la app
En **Solicitudes** verás asunto, remitente y vista previa. **Crear tarea** abre el editor ya lleno (categoría “Correo” y enlace al correo original); al guardar, la solicitud sale de la lista y su archivo se borra. **Descartar** la quita sin crear tarea. Las tareas creadas llegan al celular en la siguiente sincronización.

## 6. Plan diario y avisos
- **Ajustes > Plan de trabajo diario**: hora del plan (6:30 a. m. por defecto) e inicio y fin de tu jornada.
- El plan ubica en bloques lo vencido, lo que vence ese día, lo que está en progreso y lo de prioridad alta próximo, según el **tiempo estimado** de cada tarea. Lo que no alcanza aparece aparte, con opción de pasarlo a mañana.
- En el celular los avisos llegan aunque la app esté cerrada. En el PC llegan mientras la app esté abierta (aunque minimizada); actívalos en **Ajustes > Notificaciones**.

## 7. Dictado
Toca el micrófono en el editor y di, por ejemplo: “Informe de diagnóstico mañana a las 3 prioridad alta”. La app llena título, fecha, hora y prioridad. También entiende “hoy”, “pasado mañana”, días de la semana, “en progreso”, “en espera” y “cada semana”.

## 8. Atajos en el PC
- `N`: nueva tarea.
- `/`: buscar.
- `Ctrl + Enter`: guardar en el editor.
- `Esc`: cerrar.
