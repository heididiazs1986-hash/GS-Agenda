package com.heidi.gsagenda

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlarmManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.provider.Settings
import android.speech.RecognizerIntent
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import android.window.OnBackInvokedDispatcher
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.heidi.gsagenda.data.SyncFile
import com.heidi.gsagenda.data.TaskStore
import com.heidi.gsagenda.notifications.NotificationHelper
import com.heidi.gsagenda.notifications.ReminderScheduler
import org.json.JSONObject
import java.io.ByteArrayInputStream
import java.io.IOException

/**
 * GS Agenda híbrida: la interfaz (HTML/JS en assets/web) corre dentro de un WebView
 * y este código le da acceso a funciones del teléfono.
 */
class MainActivity : Activity() {

    companion object {
        private const val HOST = "appassets.androidplatform.net"
        private const val ORIGIN = "https://$HOST"
        private const val NAVY = "#142033"
        private const val RC_VOICE = 11
        private const val RC_OPEN_SYNC = 12
        private const val RC_CREATE_SYNC = 13
        private const val RC_SAVE = 14
        private const val RC_BACKUP = 15
        private const val RC_NOTIF = 21
    }

    private lateinit var web: WebView
    private lateinit var root: FrameLayout
    private var pendingSave: String? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationHelper.ensureChannels(this)
        WindowCompat.setDecorFitsSystemWindows(window, false)

        root = FrameLayout(this)
        root.setBackgroundColor(Color.parseColor(NAVY))
        web = WebView(this)
        root.addView(web, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        setContentView(root)

        // Respeta barra de estado, barra de navegación y teclado
        ViewCompat.setOnApplyWindowInsetsListener(root) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
            v.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, ime.bottom))
            WindowInsetsCompat.CONSUMED
        }
        applyBars(NAVY, true)

        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.settings.setSupportZoom(false)
        web.settings.textZoom = 100
        web.isVerticalScrollBarEnabled = false
        web.setBackgroundColor(Color.parseColor(NAVY))
        web.webViewClient = AssetClient()
        web.addJavascriptInterface(Bridge(), "GSNative")

        val view = intent?.getStringExtra("view")
        val hash = if (view.isNullOrBlank()) "" else "#$view"
        web.loadUrl("$ORIGIN/web/index.html$hash")

        if (Build.VERSION.SDK_INT >= 33) {
            onBackInvokedDispatcher.registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT) { handleBack() }
        }
        ReminderScheduler.scheduleAll(this)
    }

    /** Sirve los archivos de assets/ bajo una dirección https local (necesaria para el cifrado del navegador). */
    private inner class AssetClient : WebViewClient() {
        override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
            val url = request.url
            if (url.host != HOST) return null
            var path = (url.path ?: "/").removePrefix("/")
            if (path.isEmpty() || path.endsWith("/")) path += "index.html"
            return try {
                WebResourceResponse(mimeFor(path), "utf-8", assets.open(path))
            } catch (e: IOException) {
                WebResourceResponse("text/plain", "utf-8", 404, "Not Found", emptyMap(), ByteArrayInputStream(ByteArray(0)))
            }
        }

        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            if (request.url.host == HOST) return false
            openExternal(request.url.toString())
            return true
        }
    }

    private fun mimeFor(path: String): String = when (path.substringAfterLast('.', "").lowercase()) {
        "html" -> "text/html"
        "css" -> "text/css"
        "js" -> "application/javascript"
        "svg" -> "image/svg+xml"
        "json", "webmanifest" -> "application/json"
        "png" -> "image/png"
        else -> "application/octet-stream"
    }

    /** Envía un evento a la interfaz: window.__gsNative(nombre, datos) */
    private fun js(name: String, payloadJson: String) {
        runOnUiThread {
            web.evaluateJavascript("window.__gsNative && window.__gsNative(${JSONObject.quote(name)}, $payloadJson)", null)
        }
    }

    private fun handleBack() {
        web.evaluateJavascript("(window.GS_onBack && window.GS_onBack()) ? 'y' : 'n'") { r ->
            if (r != "\"y\"") moveTaskToBack(true)
        }
    }

    @Deprecated("Solo se usa antes de Android 13")
    override fun onBackPressed() {
        handleBack()
    }

    override fun onPause() {
        super.onPause()
        js("pause", "null")
    }

    override fun onResume() {
        super.onResume()
        js("resume", "null")
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        val view = intent.getStringExtra("view")
        if (view != null) js("open", JSONObject.quote(view))
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        js("theme", "null")
    }

    @Suppress("DEPRECATION")
    private fun applyBars(color: String, dark: Boolean) {
        val c = try { Color.parseColor(color) } catch (e: Exception) { Color.parseColor(NAVY) }
        root.setBackgroundColor(c)
        if (Build.VERSION.SDK_INT < 35) {
            window.statusBarColor = c
            window.navigationBarColor = c
        }
        val ctl = WindowCompat.getInsetsController(window, window.decorView)
        ctl.isAppearanceLightStatusBars = !dark
        ctl.isAppearanceLightNavigationBars = !dark
    }

    private fun openExternal(url: String) {
        if (!url.startsWith("https://") && !url.startsWith("http://")) return
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        } catch (e: ActivityNotFoundException) {
            toast("No hay una app para abrir el enlace")
        }
    }

    private fun toast(msg: String) {
        runOnUiThread { Toast.makeText(this, msg, Toast.LENGTH_SHORT).show() }
    }

    @Suppress("DEPRECATION")
    private fun hasBiometric(): Boolean {
        if (Build.VERSION.SDK_INT < 28) return false
        if (Build.VERSION.SDK_INT >= 30) {
            val bm = getSystemService(BiometricManager::class.java) ?: return false
            return bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK) == BiometricManager.BIOMETRIC_SUCCESS
        }
        if (Build.VERSION.SDK_INT >= 29) {
            val bm = getSystemService(BiometricManager::class.java) ?: return false
            return bm.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS
        }
        return packageManager.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)
    }

    private fun showBiometric() {
        if (Build.VERSION.SDK_INT < 28) {
            js("biometric", "false")
            return
        }
        val exec = mainExecutor
        val prompt = BiometricPrompt.Builder(this)
            .setTitle("Desbloquear GS Agenda")
            .setSubtitle("Usa tu huella")
            .setNegativeButton("Usar clave", exec) { _, _ -> js("biometric", "false") }
            .build()
        prompt.authenticate(CancellationSignal(), exec, object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                js("biometric", "true")
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                js("biometric", "false")
            }
        })
    }

    private fun secretPrefs() = getSharedPreferences("gs_secret", MODE_PRIVATE)

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val uri = data?.data
        when (requestCode) {
            RC_VOICE -> {
                val text = data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
                if (resultCode == RESULT_OK && !text.isNullOrBlank()) js("voice", JSONObject.quote(text))
            }
            RC_OPEN_SYNC, RC_CREATE_SYNC -> {
                if (resultCode == RESULT_OK && uri != null) {
                    val name = SyncFile.set(this, uri)
                    js("syncFile", JSONObject().put("ok", true).put("name", name).toString())
                } else {
                    js("syncFile", JSONObject().put("ok", false).toString())
                }
            }
            RC_SAVE -> {
                val content = pendingSave
                pendingSave = null
                if (resultCode == RESULT_OK && uri != null && content != null) {
                    Thread { js("saved", if (SyncFile.writeUri(this, uri, content)) "true" else "false") }.start()
                }
            }
            RC_BACKUP -> {
                if (resultCode == RESULT_OK && uri != null) {
                    Thread { js("backup", JSONObject.quote(SyncFile.readUri(this, uri) ?: "")) }.start()
                }
            }
        }
    }

    private fun launch(intent: Intent, code: Int, errorMsg: String) {
        try {
            startActivityForResult(intent, code)
        } catch (e: ActivityNotFoundException) {
            toast(errorMsg)
        }
    }

    /** Funciones del teléfono que la interfaz puede llamar como window.GSNative.xxx() */
    inner class Bridge {
        private val act: MainActivity get() = this@MainActivity

        @JavascriptInterface
        fun platform(): String = "android"

        @JavascriptInterface
        fun loadState(): String = TaskStore(act).raw()

        @JavascriptInterface
        fun saveState(json: String) {
            TaskStore(act).saveRaw(json)
            ReminderScheduler.scheduleAll(act)
        }

        @JavascriptInterface
        fun syncFileName(): String = SyncFile.name(act)

        @JavascriptInterface
        fun readSyncFile(): String = SyncFile.read(act)

        @JavascriptInterface
        fun writeSyncFile(text: String): Boolean = SyncFile.write(act, text)

        @JavascriptInterface
        fun disconnectSyncFile() {
            SyncFile.clear(act)
        }

        @JavascriptInterface
        fun pickSyncFile(create: Boolean) {
            runOnUiThread {
                val flags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                val i = if (create) {
                    Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "application/octet-stream"
                        putExtra(Intent.EXTRA_TITLE, "gs-agenda.datos")
                        addFlags(flags)
                    }
                } else {
                    Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                        addFlags(flags)
                    }
                }
                launch(i, if (create) RC_CREATE_SYNC else RC_OPEN_SYNC, "No se encontró un selector de archivos")
            }
        }

        @JavascriptInterface
        fun startVoice() {
            runOnUiThread {
                val i = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-CO")
                    putExtra(RecognizerIntent.EXTRA_PROMPT, "Di la tarea, la fecha y la prioridad")
                }
                launch(i, RC_VOICE, "El dictado por voz no está disponible en este teléfono")
            }
        }

        @JavascriptInterface
        fun canBiometric(): Boolean = act.hasBiometric()

        @JavascriptInterface
        fun biometric() {
            runOnUiThread { showBiometric() }
        }

        @JavascriptInterface
        fun secretSet(key: String, value: String) {
            secretPrefs().edit().putString(key, value).apply()
        }

        @JavascriptInterface
        fun secretGet(key: String): String = secretPrefs().getString(key, "") ?: ""

        @JavascriptInterface
        fun saveFile(name: String, mime: String, content: String) {
            runOnUiThread {
                pendingSave = content
                val i = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = mime
                    putExtra(Intent.EXTRA_TITLE, name)
                }
                launch(i, RC_SAVE, "No se encontró dónde guardar el archivo")
            }
        }

        @JavascriptInterface
        fun openBackup() {
            runOnUiThread {
                val i = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
                launch(i, RC_BACKUP, "No se encontró un selector de archivos")
            }
        }

        @JavascriptInterface
        fun setBars(color: String, dark: Boolean) {
            runOnUiThread { applyBars(color, dark) }
        }

        @JavascriptInterface
        fun openUrl(url: String) {
            runOnUiThread { openExternal(url) }
        }

        @JavascriptInterface
        fun isNightMode(): Boolean =
            (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

        @JavascriptInterface
        fun requestNotifications() {
            runOnUiThread {
                if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), RC_NOTIF)
                }
            }
        }

        @JavascriptInterface
        fun openAlarmSettings() {
            runOnUiThread {
                val am = getSystemService(AlarmManager::class.java)
                if (Build.VERSION.SDK_INT >= 31 && am != null && !am.canScheduleExactAlarms()) {
                    try {
                        startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName")))
                    } catch (e: ActivityNotFoundException) {
                        toast("Abre Ajustes > Apps > GS Agenda > Alarmas y recordatorios")
                    }
                } else {
                    toast("Los permisos de avisos están activos")
                }
            }
        }
    }
}
