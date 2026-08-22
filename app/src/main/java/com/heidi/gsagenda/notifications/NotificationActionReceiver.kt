package com.heidi.gsagenda.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.heidi.gsagenda.data.TaskStatus
import com.heidi.gsagenda.data.TaskStore

class NotificationActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getLongExtra("taskId", -1)
        val store = TaskStore(context)
        val task = store.get(id) ?: return
        when (intent.getStringExtra("action")) {
            "DONE" -> { task.status = TaskStatus.COMPLETED; store.upsert(task) }
            "SNOOZE" -> ReminderScheduler.scheduleSnooze(context, id, 30)
        }
    }
}
