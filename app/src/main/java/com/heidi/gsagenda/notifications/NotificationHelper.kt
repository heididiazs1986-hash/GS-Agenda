package com.heidi.gsagenda.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.heidi.gsagenda.MainActivity
import com.heidi.gsagenda.R
import com.heidi.gsagenda.data.Task
import java.util.Calendar

object NotificationHelper {
    const val CHANNEL_ALERTS = "gs_agenda_alerts"
    const val CHANNEL_SILENT = "gs_agenda_silent"
    const val CHANNEL_QUIET = "gs_agenda_quiet"
    const val CHANNEL_PLAN = "gs_agenda_plan"
    private const val PLAN_ID = 777001
    private const val ACCENT = 0xFFD2232A.toInt()

    fun notifId(taskId: String) = taskId.hashCode()

    fun ensureChannels(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val attrs = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION_EVENT).build()
        val alerts = NotificationChannel(CHANNEL_ALERTS, "Recordatorios con sonido", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Avisos de tareas con sonido y vibración"
            enableVibration(true); vibrationPattern = longArrayOf(0, 250, 150, 250)
            setSound(soundUri, attrs)
        }
        val silent = NotificationChannel(CHANNEL_SILENT, "Recordatorios solo con vibración", NotificationManager.IMPORTANCE_HIGH).apply {
            enableVibration(true); vibrationPattern = longArrayOf(0, 250, 150, 250); setSound(null, null)
        }
        val quiet = NotificationChannel(CHANNEL_QUIET, "Recordatorios silenciosos", NotificationManager.IMPORTANCE_DEFAULT).apply {
            enableVibration(false); setSound(null, null)
        }
        val plan = NotificationChannel(CHANNEL_PLAN, "Plan de trabajo diario", NotificationManager.IMPORTANCE_DEFAULT).apply {
            description = "Resumen de tu día cada mañana"
        }
        manager.createNotificationChannels(listOf(alerts, silent, quiet, plan))
    }

    private fun canNotify(context: Context): Boolean =
        Build.VERSION.SDK_INT < 33 || context.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    private fun openIntent(context: Context, view: String, code: Int): PendingIntent {
        val i = Intent(context, MainActivity::class.java).apply {
            putExtra("view", view)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        return PendingIntent.getActivity(context, code, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun time(ms: Long): String {
        val c = Calendar.getInstance().apply { timeInMillis = ms }
        val h = c.get(Calendar.HOUR_OF_DAY); val m = c.get(Calendar.MINUTE)
        val h12 = if (h % 12 == 0) 12 else h % 12
        return "%d:%02d %s".format(h12, m, if (h < 12) "a. m." else "p. m.")
    }

    fun showTask(context: Context, task: Task, minutes: Int) {
        ensureChannels(context)
        if (!canNotify(context)) return
        val prefix = when {
            minutes < 0 -> "Recordatorio"
            minutes == 0 -> "Ahora"
            minutes < 60 -> "En $minutes min"
            minutes == 60 -> "En 1 hora"
            minutes == 1440 -> "Mañana"
            else -> "En ${minutes / 60} h"
        }
        val channel = when {
            task.sound -> CHANNEL_ALERTS
            task.vibration -> CHANNEL_SILENT
            else -> CHANNEL_QUIET
        }
        val body = "Vence a las ${time(task.dueAt)}" + if (task.notes.isNotBlank()) "\n${task.notes.take(200)}" else ""
        val n = NotificationCompat.Builder(context, channel)
            .setSmallIcon(R.drawable.ic_stat_gs)
            .setColor(ACCENT)
            .setContentTitle("$prefix: ${task.title}")
            .setContentText("Vence a las ${time(task.dueAt)}")
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(openIntent(context, "tasks", notifId(task.id)))
            .addAction(0, "Lista", actionIntent(context, task.id, "DONE"))
            .addAction(0, "Posponer 30 min", actionIntent(context, task.id, "SNOOZE"))
            .build()
        context.getSystemService(NotificationManager::class.java)?.notify(notifId(task.id), n)
    }

    fun showPlan(context: Context, tasks: List<Task>) {
        ensureChannels(context)
        if (!canNotify(context)) return
        val start = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        val end = start + 86_400_000L
        val open = tasks.filter { !it.deleted && it.status != "COMPLETED" }
        val overdue = open.filter { it.dueAt < start }
        val today = open.filter { it.dueAt in start until end }.sortedBy { it.dueAt }
        val inProgress = open.count { it.status == "IN_PROGRESS" }
        val title = when {
            today.isEmpty() && overdue.isEmpty() -> "Tu plan de hoy: día despejado"
            else -> "Tu plan de hoy: ${today.size} con fecha de hoy"
        }
        val summary = buildString {
            if (overdue.isNotEmpty()) append("${overdue.size} vencidas por ponerse al día. ")
            if (inProgress > 0) append("$inProgress en progreso. ")
            append("Toca para ver tu agenda ordenada.")
        }
        val lines = (overdue.sortedBy { it.dueAt }.take(2).map { "Vencida: ${it.title}" } +
            today.take(5).map { "${time(it.dueAt)}  ${it.title}" }).joinToString("\n")
        val n = NotificationCompat.Builder(context, CHANNEL_PLAN)
            .setSmallIcon(R.drawable.ic_stat_gs)
            .setColor(ACCENT)
            .setContentTitle(title)
            .setContentText(summary)
            .setStyle(NotificationCompat.BigTextStyle().bigText(if (lines.isBlank()) summary else "$summary\n\n$lines"))
            .setAutoCancel(true)
            .setContentIntent(openIntent(context, "plan", PLAN_ID))
            .build()
        context.getSystemService(NotificationManager::class.java)?.notify(PLAN_ID, n)
    }

    private fun actionIntent(context: Context, taskId: String, action: String): PendingIntent {
        val intent = Intent(context, NotificationActionReceiver::class.java).apply {
            this.action = "com.heidi.gsagenda.$action.$taskId"
            putExtra("taskId", taskId); putExtra("action", action)
        }
        val code = ReminderScheduler.codeFor(taskId, if (action == "DONE") 10001 else 20001)
        return PendingIntent.getBroadcast(context, code, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }
}
