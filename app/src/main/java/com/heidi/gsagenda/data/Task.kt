package com.heidi.gsagenda.data

enum class Priority { HIGH, MEDIUM, LOW }
enum class TaskStatus { PENDING, IN_PROGRESS, WAITING, COMPLETED }
enum class RepeatType { NONE, DAILY, WEEKLY, MONTHLY }

data class Task(
    val id: Long = System.currentTimeMillis(),
    var title: String,
    var notes: String = "",
    var dueAt: Long,
    var priority: Priority = Priority.MEDIUM,
    var status: TaskStatus = TaskStatus.PENDING,
    var repeatType: RepeatType = RepeatType.NONE,
    var repeatWeekday: Int? = null,
    var remindersMinutesBefore: MutableList<Int> = mutableListOf(60, 30),
    var sound: Boolean = true,
    var vibration: Boolean = true
)
