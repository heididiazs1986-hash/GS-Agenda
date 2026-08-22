package com.heidi.gsagenda.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class TaskStore(context: Context) {
    private val prefs = context.getSharedPreferences("gs_agenda_tasks", Context.MODE_PRIVATE)

    fun all(): MutableList<Task> {
        val raw = prefs.getString("tasks", "[]") ?: "[]"
        val arr = JSONArray(raw)
        return MutableList(arr.length()) { i -> fromJson(arr.getJSONObject(i)) }
    }

    fun save(tasks: List<Task>) {
        val arr = JSONArray()
        tasks.forEach { arr.put(toJson(it)) }
        prefs.edit().putString("tasks", arr.toString()).apply()
    }

    fun get(id: Long): Task? = all().firstOrNull { it.id == id }

    fun upsert(task: Task) {
        val tasks = all()
        val index = tasks.indexOfFirst { it.id == task.id }
        if (index >= 0) tasks[index] = task else tasks.add(task)
        save(tasks)
    }

    private fun toJson(t: Task) = JSONObject().apply {
        put("id", t.id); put("title", t.title); put("notes", t.notes); put("dueAt", t.dueAt)
        put("priority", t.priority.name); put("status", t.status.name); put("repeatType", t.repeatType.name)
        put("repeatWeekday", t.repeatWeekday ?: JSONObject.NULL)
        put("reminders", JSONArray(t.remindersMinutesBefore)); put("sound", t.sound); put("vibration", t.vibration)
    }

    private fun fromJson(o: JSONObject) = Task(
        id = o.getLong("id"), title = o.getString("title"), notes = o.optString("notes"), dueAt = o.getLong("dueAt"),
        priority = Priority.valueOf(o.optString("priority", Priority.MEDIUM.name)),
        status = TaskStatus.valueOf(o.optString("status", TaskStatus.PENDING.name)),
        repeatType = RepeatType.valueOf(o.optString("repeatType", RepeatType.NONE.name)),
        repeatWeekday = if (o.isNull("repeatWeekday")) null else o.optInt("repeatWeekday"),
        remindersMinutesBefore = MutableList(o.optJSONArray("reminders")?.length() ?: 0) { i -> o.getJSONArray("reminders").getInt(i) },
        sound = o.optBoolean("sound", true), vibration = o.optBoolean("vibration", true)
    )
}
