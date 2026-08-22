package com.heidi.gsagenda

import android.Manifest
import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.heidi.gsagenda.data.*
import com.heidi.gsagenda.notifications.NotificationHelper
import com.heidi.gsagenda.notifications.ReminderScheduler
import java.text.SimpleDateFormat
import java.util.*

private val Purple = Color(0xFF6E42D8)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationHelper.ensureChannels(this)
        setContent { GSAgendaApp() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GSAgendaApp() {
    val context = LocalContext.current
    val store = remember { TaskStore(context) }
    var tasks by remember { mutableStateOf(store.all()) }
    var editing by remember { mutableStateOf<Task?>(null) }

    val notificationPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }
    LaunchedEffect(Unit) { notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS) }

    MaterialTheme(colorScheme = lightColorScheme(primary = Purple, secondary = Color(0xFF8C6CE7), background = Color(0xFFF8F6FC))) {
        Scaffold(
            topBar = { TopAppBar(title = { Text("GS Agenda", fontWeight = FontWeight.Bold) }) },
            floatingActionButton = { FloatingActionButton(onClick = { editing = newTask() }, containerColor = Purple) { Icon(Icons.Default.Add, null, tint = Color.White) } }
        ) { padding ->
            Column(Modifier.padding(padding).padding(16.dp)) {
                Text("¡Buenos días, Heidi! 👋", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(14.dp))
                SummaryRow(tasks)
                Spacer(Modifier.height(18.dp))
                Text("Tus tareas", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(tasks.sortedBy { it.dueAt }, key = { it.id }) { task ->
                        TaskCard(task, onEdit = { editing = task.copy(remindersMinutesBefore = task.remindersMinutesBefore.toMutableList()) }, onDone = {
                            task.status = TaskStatus.COMPLETED; store.upsert(task); tasks = store.all()
                        })
                    }
                }
            }
        }

        editing?.let { task ->
            TaskEditor(task = task, onDismiss = { editing = null }, onSave = { saved ->
                store.upsert(saved)
                ReminderScheduler.scheduleTask(context, saved)
                tasks = store.all()
                editing = null
            })
        }
    }
}

@Composable
private fun SummaryRow(tasks: List<Task>) {
    val pending = tasks.count { it.status != TaskStatus.COMPLETED }
    val done = tasks.count { it.status == TaskStatus.COMPLETED }
    val overdue = tasks.count { it.status != TaskStatus.COMPLETED && it.dueAt < System.currentTimeMillis() }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        SummaryChip("Pendientes", pending, Color(0xFFFFF2CC), Modifier.weight(1f))
        SummaryChip("Listas", done, Color(0xFFDFF4E5), Modifier.weight(1f))
        SummaryChip("Vencidas", overdue, Color(0xFFFFE1E1), Modifier.weight(1f))
    }
}

@Composable
private fun SummaryChip(label: String, count: Int, color: Color, modifier: Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = color), shape = RoundedCornerShape(16.dp)) {
        Column(Modifier.padding(12.dp)) { Text(label, style = MaterialTheme.typography.labelMedium); Text("$count", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold) }
    }
}

@Composable
private fun TaskCard(task: Task, onEdit: () -> Unit, onDone: () -> Unit) {
    val priorityText = when(task.priority) { Priority.HIGH -> "🔴 Alta"; Priority.MEDIUM -> "🟠 Media"; Priority.LOW -> "🟢 Baja" }
    val fmt = remember { SimpleDateFormat("EEE d MMM · h:mm a", Locale("es", "CO")) }
    Card(onClick = onEdit, shape = RoundedCornerShape(18.dp)) {
        Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(task.title, fontWeight = FontWeight.SemiBold)
                Text(fmt.format(Date(task.dueAt)), style = MaterialTheme.typography.bodySmall)
                Text(priorityText, style = MaterialTheme.typography.labelMedium)
            }
            if (task.status != TaskStatus.COMPLETED) IconButton(onClick = onDone) { Icon(Icons.Default.CheckCircle, "Lista", tint = Purple) }
            else Icon(Icons.Default.DoneAll, null, tint = Color(0xFF2E9D58))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TaskEditor(task: Task, onDismiss: () -> Unit, onSave: (Task) -> Unit) {
    val context = LocalContext.current
    var title by remember { mutableStateOf(task.title) }
    var notes by remember { mutableStateOf(task.notes) }
    var dueAt by remember { mutableLongStateOf(task.dueAt) }
    var priority by remember { mutableStateOf(task.priority) }
    var status by remember { mutableStateOf(task.status) }
    var repeat by remember { mutableStateOf(task.repeatType) }
    var rem60 by remember { mutableStateOf(task.remindersMinutesBefore.contains(60)) }
    var rem30 by remember { mutableStateOf(task.remindersMinutesBefore.contains(30)) }
    var sound by remember { mutableStateOf(task.sound) }
    var vibration by remember { mutableStateOf(task.vibration) }

    val speech = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val text = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
        if (text.isNotBlank()) {
            val parsed = parseVoice(text)
            if (parsed.cleanedText.isNotBlank()) title = parsed.cleanedText
            parsed.priority?.let { priority = it }
            parsed.status?.let { status = it }
            parsed.repeat?.let { repeat = it }
        }
    }

    fun startVoice() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-CO")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Dime la tarea o un cambio: prioridad alta, completada, repetir semanalmente…")
        }
        speech.launch(intent)
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (task.title.isBlank()) "Nueva tarea" else "Editar tarea") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(title, { title = it }, label = { Text("Título") }, modifier = Modifier.fillMaxWidth(), trailingIcon = { IconButton(onClick = ::startVoice) { Icon(Icons.Default.Mic, "Dictar") } })
                OutlinedTextField(notes, { notes = it }, label = { Text("Notas") }, modifier = Modifier.fillMaxWidth())
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(SimpleDateFormat("dd/MM/yyyy h:mm a", Locale("es", "CO")).format(Date(dueAt)), Modifier.weight(1f))
                    IconButton(onClick = { pickDateTime(context, dueAt) { dueAt = it } }) { Icon(Icons.Default.CalendarMonth, "Fecha y hora") }
                }
                Text("Prioridad", fontWeight = FontWeight.SemiBold)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(priority == Priority.HIGH, { priority = Priority.HIGH }, { Text("Alta") })
                    FilterChip(priority == Priority.MEDIUM, { priority = Priority.MEDIUM }, { Text("Media") })
                    FilterChip(priority == Priority.LOW, { priority = Priority.LOW }, { Text("Baja") })
                }
                Text("Estado", fontWeight = FontWeight.SemiBold)
                StatusDropDown(status) { status = it }
                Text("Repetir", fontWeight = FontWeight.SemiBold)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(repeat == RepeatType.NONE, { repeat = RepeatType.NONE }, { Text("No") })
                    FilterChip(repeat == RepeatType.WEEKLY, { repeat = RepeatType.WEEKLY }, { Text("Semanal") })
                }
                Row(verticalAlignment = Alignment.CenterVertically) { Checkbox(rem60, { rem60 = it }); Text("Avisar 1 hora antes") }
                Row(verticalAlignment = Alignment.CenterVertically) { Checkbox(rem30, { rem30 = it }); Text("Avisar 30 minutos antes") }
                Row(verticalAlignment = Alignment.CenterVertically) { Switch(sound, { sound = it }); Spacer(Modifier.width(8.dp)); Text("Notificación sonora") }
                Row(verticalAlignment = Alignment.CenterVertically) { Switch(vibration, { vibration = it }); Spacer(Modifier.width(8.dp)); Text("Vibración") }
                FilledTonalButton(onClick = ::startVoice, modifier = Modifier.fillMaxWidth()) { Icon(Icons.Default.Mic, null); Spacer(Modifier.width(6.dp)); Text("Editar por voz") }
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(task.copy(title = title.ifBlank { "Nueva tarea" }, notes = notes, dueAt = dueAt, priority = priority, status = status, repeatType = repeat,
                    remindersMinutesBefore = mutableListOf<Int>().apply { if (rem60) add(60); if (rem30) add(30) }, sound = sound, vibration = vibration))
            }) { Text("Guardar") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun StatusDropDown(status: TaskStatus, onChange: (TaskStatus) -> Unit) {
    var open by remember { mutableStateOf(false) }
    ExposedDropdownMenuBox(expanded = open, onExpandedChange = { open = !open }) {
        OutlinedTextField(value = when(status){ TaskStatus.PENDING->"Pendiente";TaskStatus.IN_PROGRESS->"En progreso";TaskStatus.WAITING->"En espera";TaskStatus.COMPLETED->"Completada" }, onValueChange = {}, readOnly = true, modifier = Modifier.menuAnchor().fillMaxWidth(), trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(open) })
        ExposedDropdownMenu(expanded = open, onDismissRequest = { open = false }) {
            TaskStatus.entries.forEach { s -> DropdownMenuItem(text = { Text(when(s){ TaskStatus.PENDING->"Pendiente";TaskStatus.IN_PROGRESS->"En progreso";TaskStatus.WAITING->"En espera";TaskStatus.COMPLETED->"Completada" }) }, onClick = { onChange(s); open = false }) }
        }
    }
}

private fun newTask(): Task {
    val c = Calendar.getInstance().apply { add(Calendar.HOUR_OF_DAY, 1); set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0) }
    return Task(title = "", dueAt = c.timeInMillis)
}

private fun pickDateTime(context: android.content.Context, initial: Long, onPicked: (Long) -> Unit) {
    val c = Calendar.getInstance().apply { timeInMillis = initial }
    DatePickerDialog(context, { _, y, m, d ->
        TimePickerDialog(context, { _, h, min ->
            val out = Calendar.getInstance().apply { set(y, m, d, h, min, 0) }
            onPicked(out.timeInMillis)
        }, c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE), false).show()
    }, c.get(Calendar.YEAR), c.get(Calendar.MONTH), c.get(Calendar.DAY_OF_MONTH)).show()
}

data class VoiceParse(val cleanedText: String, val priority: Priority?, val status: TaskStatus?, val repeat: RepeatType?)
private fun parseVoice(input: String): VoiceParse {
    val s = input.lowercase(Locale("es", "CO"))
    val p = when { "prioridad alta" in s -> Priority.HIGH; "prioridad media" in s -> Priority.MEDIUM; "prioridad baja" in s -> Priority.LOW; else -> null }
    val st = when { "completada" in s || "lista" in s -> TaskStatus.COMPLETED; "en progreso" in s -> TaskStatus.IN_PROGRESS; "en espera" in s -> TaskStatus.WAITING; "pendiente" in s -> TaskStatus.PENDING; else -> null }
    val r = when { "cada semana" in s || "semanal" in s || "todos los lunes" in s -> RepeatType.WEEKLY; "cada día" in s || "diaria" in s -> RepeatType.DAILY; else -> null }
    val cleaned = input.replace(Regex("(?i)prioridad (alta|media|baja)"), "").replace(Regex("(?i)(completada|lista|en progreso|en espera|pendiente)"), "").replace(Regex("(?i)(cada semana|semanalmente|semanal|todos los lunes|cada día|diaria)"), "").trim(' ', ',', '.', '-')
    return VoiceParse(cleaned, p, st, r)
}
