package com.heidi.gsagenda.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.heidi.gsagenda.data.TaskStore

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val kind = intent.getStringExtra("kind") ?: "task"
        if (kind == "plan") {
            val store = TaskStore(context)
            if (store.settings().optBoolean("planEnabled", true)) NotificationHelper.showPlan(context, store.tasks())
            ReminderScheduler.scheduleAll(context)
            return
        }
        val id = intent.getStringExtra("taskId") ?: return
        val task = TaskStore(context).tasks().firstOrNull { it.id == id } ?: return
        if (task.deleted || task.status == "COMPLETED") return
        // Si la tarea cambió de fecha después de programar este aviso, se ignora
        if (kind == "task" && intent.getLongExtra("dueAt", -1L) != task.dueAt) return
        NotificationHelper.showTask(context, task, if (kind == "snooze") -1 else intent.getIntExtra("minutes", 0))
    }
}
