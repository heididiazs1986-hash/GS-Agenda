package com.heidi.gsagenda.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.heidi.gsagenda.data.TaskStore
import java.util.Calendar

/** Programa los avisos de todas las tareas abiertas y el plan diario. Se llama cada vez que cambian los datos. */
object ReminderScheduler {
    private const val PREFS = "gs_alarms"
    private const val PLAN_CODE = 777001
    private const val MAX_ALARMS = 150

    fun codeFor(id: String, marker: Int): Int = ((id.hashCode() * 31 + marker) and 0x7fffffff)

    fun scheduleAll(context: Context) {
        val am = context.getSystemService(AlarmManager::class.java) ?: return
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val store = TaskStore(context)

        // Cancelar lo programado antes
        prefs.getStringSet("codes", emptySet())?.forEach { code ->
            val pi = PendingIntent.getBroadcast(
                context, code.toIntOrNull() ?: return@forEach,
                Intent(context, ReminderReceiver::class.java),
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (pi != null) { am.cancel(pi); pi.cancel() }
        }

        val now = System.currentTimeMillis()
        val codes = mutableSetOf<String>()
        data class Item(val at: Long, val id: String, val dueAt: Long, val minutes: Int)
        val items = mutableListOf<Item>()
        store.tasks().filter { !it.deleted && it.status != "COMPLETED" && it.id.isNotBlank() }.forEach { t ->
            (t.reminders + 0).distinct().forEach { m ->
                val at = t.dueAt - m * 60_000L
                if (at > now) items.add(Item(at, t.id, t.dueAt, m))
            }
        }
        items.sortedBy { it.at }.take(MAX_ALARMS).forEach { item ->
            val code = codeFor(item.id, item.minutes)
            val intent = Intent(context, ReminderReceiver::class.java)
                .putExtra("kind", "task").putExtra("taskId", item.id)
                .putExtra("dueAt", item.dueAt).putExtra("minutes", item.minutes)
            schedule(context, am, code, item.at, intent)
            codes.add(code.toString())
        }

        val settings = store.settings()
        if (settings.optBoolean("planEnabled", true)) {
            val at = nextTime(settings.optString("planTime", "06:30"))
            schedule(context, am, PLAN_CODE, at, Intent(context, ReminderReceiver::class.java).putExtra("kind", "plan"))
            codes.add(PLAN_CODE.toString())
        }
        prefs.edit().putStringSet("codes", codes).apply()
    }

    fun scheduleSnooze(context: Context, taskId: String, minutes: Int = 30) {
        val am = context.getSystemService(AlarmManager::class.java) ?: return
        val intent = Intent(context, ReminderReceiver::class.java).putExtra("kind", "snooze").putExtra("taskId", taskId)
        schedule(context, am, codeFor(taskId, -minutes), System.currentTimeMillis() + minutes * 60_000L, intent)
    }

    private fun nextTime(hm: String): Long {
        val parts = hm.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: 6
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 30
        val c = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, h); set(Calendar.MINUTE, m); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        if (c.timeInMillis <= System.currentTimeMillis() + 1000) c.add(Calendar.DAY_OF_YEAR, 1)
        return c.timeInMillis
    }

    private fun schedule(context: Context, am: AlarmManager, code: Int, at: Long, intent: Intent) {
        val pi = PendingIntent.getBroadcast(context, code, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            } else {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }
        } catch (e: SecurityException) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
    }
}
