package com.heidi.gsagenda.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.heidi.gsagenda.data.Task

object ReminderScheduler {
    fun scheduleTask(context: Context, task: Task) {
        task.remindersMinutesBefore.distinct().forEach { minutes ->
            val triggerAt = task.dueAt - minutes * 60_000L
            if (triggerAt > System.currentTimeMillis()) schedule(context, task.id, minutes, triggerAt)
        }
        if (task.dueAt > System.currentTimeMillis()) schedule(context, task.id, 0, task.dueAt)
    }

    fun scheduleSnooze(context: Context, taskId: Long, minutes: Int = 30) = schedule(context, taskId, -minutes, System.currentTimeMillis() + minutes * 60_000L)

    private fun schedule(context: Context, taskId: Long, marker: Int, triggerAt: Long) {
        val am = context.getSystemService(AlarmManager::class.java)
        val intent = Intent(context, ReminderReceiver::class.java).apply { putExtra("taskId", taskId) }
        val code = ((taskId xor marker.toLong()) and 0x7fffffff).toInt()
        val pi = PendingIntent.getBroadcast(context, code, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi)
        } else {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi)
        }
    }
}
