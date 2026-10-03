package com.heidi.gsagenda.notifications

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.heidi.gsagenda.data.TaskStore

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getStringExtra("taskId") ?: return
        when (intent.getStringExtra("action")) {
            "DONE" -> { TaskStore(context).markDone(id); ReminderScheduler.scheduleAll(context) }
            "SNOOZE" -> ReminderScheduler.scheduleSnooze(context, id, 30)
        }
        context.getSystemService(NotificationManager::class.java)?.cancel(NotificationHelper.notifId(id))
    }
}
