package com.heidi.gsagenda.notifications

import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.heidi.gsagenda.MainActivity
import com.heidi.gsagenda.data.Task

object NotificationHelper {
    const val CHANNEL_ALERTS = "gs_agenda_alerts"

    fun ensureChannels(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(CHANNEL_ALERTS, "Recordatorios sonoros", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Recordatorios de tareas de GS Agenda"
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 250, 150, 250)
            val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            setSound(soundUri, AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT).build())
        }
        manager.createNotificationChannel(channel)
    }

    fun show(context: Context, task: Task) {
        ensureChannels(context)
        val open = PendingIntent.getActivity(context, task.id.toInt(), Intent(context, MainActivity::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val done = actionIntent(context, task.id, "DONE", task.id.toInt() + 10000)
        val snooze = actionIntent(context, task.id, "SNOOZE", task.id.toInt() + 20000)

        val n = NotificationCompat.Builder(context, CHANNEL_ALERTS)
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle("GS Agenda · Recordatorio")
            .setContentText(task.title)
            .setStyle(NotificationCompat.BigTextStyle().bigText(task.title + if (task.notes.isNotBlank()) "\n${task.notes}" else ""))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(open)
            .addAction(android.R.drawable.checkbox_on_background, "✓ Lista", done)
            .addAction(android.R.drawable.ic_lock_idle_alarm, "Posponer 30 min", snooze)
            .build()

        context.getSystemService(NotificationManager::class.java).notify(task.id.toInt(), n)
    }

    private fun actionIntent(context: Context, taskId: Long, action: String, requestCode: Int): PendingIntent {
        val intent = Intent(context, NotificationActionReceiver::class.java).apply { putExtra("taskId", taskId); putExtra("action", action) }
        return PendingIntent.getBroadcast(context, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }
}
