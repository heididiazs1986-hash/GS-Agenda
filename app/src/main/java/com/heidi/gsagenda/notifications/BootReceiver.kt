package com.heidi.gsagenda.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.heidi.gsagenda.data.TaskStatus
import com.heidi.gsagenda.data.TaskStore

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        TaskStore(context).all().filter { it.status != TaskStatus.COMPLETED }.forEach { ReminderScheduler.scheduleTask(context, it) }
    }
}
