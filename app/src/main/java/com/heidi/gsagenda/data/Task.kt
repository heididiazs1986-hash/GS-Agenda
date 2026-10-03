package com.heidi.gsagenda.data

/** Vista mínima de una tarea para alarmas y notificaciones. La interfaz guarda más campos en el mismo JSON. */
data class Task(
    val id: String,
    val title: String,
    val notes: String,
    val dueAt: Long,
    val status: String,
    val priority: String,
    val reminders: List<Int>,
    val sound: Boolean,
    val vibration: Boolean,
    val deleted: Boolean
)
