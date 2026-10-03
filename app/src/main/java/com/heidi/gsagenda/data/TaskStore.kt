package com.heidi.gsagenda.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/** Guarda el estado completo de la app (JSON) en el almacenamiento privado del teléfono. */
class TaskStore(private val context: Context) {
    companion object {
        private val lock = Any()
    }

    private val file: File get() = File(context.filesDir, "state.json")

    fun raw(): String = synchronized(lock) {
        try { if (file.exists()) file.readText(Charsets.UTF_8) else "" } catch (e: Exception) { "" }
    }

    fun saveRaw(json: String) {
        synchronized(lock) {
            if (json.isBlank()) {
                file.delete()
            } else {
                val tmp = File(context.filesDir, "state.json.tmp")
                tmp.writeText(json, Charsets.UTF_8)
                if (!tmp.renameTo(file)) {
                    file.writeText(json, Charsets.UTF_8)
                    tmp.delete()
                }
            }
            Unit
        }
    }

    private fun root(): JSONObject? = try { val r = raw(); if (r.isBlank()) null else JSONObject(r) } catch (e: Exception) { null }

    fun settings(): JSONObject = root()?.optJSONObject("settings") ?: JSONObject()

    fun tasks(): List<Task> {
        val arr = root()?.optJSONArray("tasks") ?: return emptyList()
        val out = ArrayList<Task>(arr.length())
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val rem = o.optJSONArray("reminders") ?: JSONArray()
            out.add(
                Task(
                    id = o.optString("id"),
                    title = o.optString("title", "Tarea"),
                    notes = o.optString("notes", ""),
                    dueAt = o.optLong("dueAt", 0L),
                    status = o.optString("status", "PENDING"),
                    priority = o.optString("priority", "MEDIUM"),
                    reminders = List(rem.length()) { rem.optInt(it, 0) },
                    sound = o.optBoolean("sound", true),
                    vibration = o.optBoolean("vibration", true),
                    deleted = o.optBoolean("deleted", false)
                )
            )
        }
        return out
    }

    /** Marca una tarea como lista desde la notificación, conservando el resto de campos. */
    fun markDone(id: String): Boolean = synchronized(lock) {
        val r = root() ?: return@synchronized false
        val arr = r.optJSONArray("tasks") ?: return@synchronized false
        val now = System.currentTimeMillis()
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            if (o.optString("id") == id) {
                o.put("status", "COMPLETED"); o.put("completedAt", now); o.put("updatedAt", now)
                r.put("updatedAt", now)
                saveRaw(r.toString())
                return@synchronized true
            }
        }
        false
    }
}
