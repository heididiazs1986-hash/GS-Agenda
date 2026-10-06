# GS Agenda 2.3

Tablero personal de tareas, híbrido: la misma interfaz funciona como app Android (APK) y como app de escritorio en Edge.

## Qué incluye
- Tablero interactivo tipo Power BI: indicadores, gráficos por estado, prioridad y categoría, carga de los próximos 14 días y ritmo semanal. Al tocar un gráfico se filtra todo el tablero.
- Plan de trabajo diario: ordena lo vencido, lo de hoy y lo prioritario dentro de tu jornada, con aviso cada mañana.
- Tareas con categoría, tiempo estimado, subtareas, repetición (diaria, semanal, mensual) y avisos configurables.
- Calendario mensual.
- Solicitudes del correo: Power Automate deja los correos marcados en OneDrive y la app los convierte en tareas.
- Acceso con clave (y huella en el celular). Los datos se cifran con la clave (AES-256).
- Sincronización entre celular y PC mediante un archivo cifrado en tu OneDrive.
- Exportación a CSV para Excel o Power BI y copias de seguridad.
- Estilo Glacier (vidrio esmerilado en tonos hielo y lavanda), con tema claro y oscuro.
- Asistente animado estilo Lego (la Gestora Social), que se inclina con el cursor y se puede girar arrastrándolo: saluda, sugiere por dónde empezar según tus tareas reales, celebra cada tarea completada y se puede ocultar en Ajustes > Apariencia.

- Importar tareas desde un archivo CSV o JSON (Ajustes > Datos), con vista previa y sin duplicados. Incluye el plan de estudio en `plan-estudio/`.

- Importar tareas desde un archivo CSV o JSON (Ajustes > Datos), con vista previa y sin duplicados. Incluye el plan de estudio en `plan-estudio/`.

## Estructura
- `app/src/main/assets/web/` — la interfaz (HTML, CSS, JS). Es la misma para el celular y el PC.
- `app/src/main/java/...` — el contenedor Android: WebView, huella, notificaciones, plan diario y archivo de sincronización.
- `.github/workflows/android.yml` — compila el APK en GitHub Actions.

Las instrucciones de instalación y del flujo de correo están en `GUIA.md`.
