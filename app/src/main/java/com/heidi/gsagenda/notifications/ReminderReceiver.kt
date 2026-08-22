package com.heidi.gsagenda.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.heidi.gsagenda.data.TaskStatus
import com.heidi.gsagenda.data.TaskStore

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getLongExtra("taskId", -1)
        val task = TaskStore(context).get(id) ?: return
        if (task.status != TaskStatus.COMPLETED) NotificationHelper.show(context, task)
    }
}
