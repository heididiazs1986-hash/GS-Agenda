# GS Agenda — MVP Android nativo

Primera base funcional en Kotlin + Jetpack Compose.

## Incluido
- Crear y editar tareas.
- Fecha y hora.
- Prioridad Alta / Media / Baja.
- Estado Pendiente / En progreso / En espera / Completada.
- Recordatorios 1 hora y 30 minutos antes + aviso a la hora.
- Notificaciones sonoras y vibración.
- Acciones desde la notificación: **Lista** y **Posponer 30 min**.
- Reprogramación de recordatorios al reiniciar el teléfono.
- Dictado por voz mediante el reconocimiento de voz de Android.
- Comandos de voz básicos para prioridad, estado y repetición.
- Datos locales en el teléfono (sin servidor).

## Abrir
1. Abrir la carpeta `GSAgenda` en Android Studio actual.
2. Esperar sincronización de Gradle.
3. Ejecutar en un Android 8+.
4. Conceder permiso de notificaciones cuando la app lo solicite.
5. En Android 12+, si se desean avisos exactos al minuto, permitir `Alarmas y recordatorios` para GS Agenda en ajustes del sistema.

## Pendiente para la siguiente iteración
- Motor completo de recurrencia (crear automáticamente la siguiente ocurrencia semanal/mensual).
- Interpretación avanzada del dictado: fechas, horas y recordatorios hablados.
- Calendario mensual visual.
- Respaldo/restauración exportable.
- Pantalla de configuración de sonido por tarea/categoría.
- Icono final GS Agenda y pulido visual conforme al mockup aprobado.
