package com.heidi.gsagenda.data

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns

/** Archivo de sincronización elegido por la usuaria (por ejemplo en OneDrive), con permiso persistente. */
object SyncFile {
    private fun prefs(c: Context) = c.getSharedPreferences("gs_sync", Context.MODE_PRIVATE)

    fun uri(c: Context): Uri? = prefs(c).getString("uri", null)?.let { Uri.parse(it) }

    fun name(c: Context): String {
        if (uri(c) == null) return ""
        return prefs(c).getString("name", null)?.takeIf { it.isNotBlank() } ?: "Archivo conectado"
    }

    fun set(c: Context, uri: Uri): String {
        try {
            c.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
        } catch (e: Exception) { /* algunos proveedores no ofrecen permiso persistente */ }
        val name = queryName(c, uri) ?: "gs-agenda.datos"
        prefs(c).edit().putString("uri", uri.toString()).putString("name", name).apply()
        return name
    }

    fun clear(c: Context) {
        uri(c)?.let {
            try { c.contentResolver.releasePersistableUriPermission(it, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION) } catch (e: Exception) { }
        }
        prefs(c).edit().clear().apply()
    }

    /** Devuelve el texto del archivo, o "\u0000ERR:mensaje" si no se pudo leer (para no sobrescribir datos por error). */
    fun read(c: Context): String {
        val u = uri(c) ?: return ""
        return try {
            c.contentResolver.openInputStream(u)?.use { it.readBytes().toString(Charsets.UTF_8) } ?: "\u0000ERR:No se pudo abrir el archivo"
        } catch (e: Exception) {
            "\u0000ERR:" + (e.message ?: "No se pudo leer el archivo")
        }
    }

    fun write(c: Context, text: String): Boolean {
        val u = uri(c) ?: return false
        val bytes = text.toByteArray(Charsets.UTF_8)
        for (mode in listOf("wt", "rwt", "w")) {
            try {
                val out = c.contentResolver.openOutputStream(u, mode) ?: continue
                out.use { it.write(bytes); it.flush() }
                return true
            } catch (e: Exception) { /* probar el siguiente modo */ }
        }
        return false
    }

    fun readUri(c: Context, uri: Uri): String? = try {
        c.contentResolver.openInputStream(uri)?.use { it.readBytes().toString(Charsets.UTF_8) }
    } catch (e: Exception) { null }

    fun writeUri(c: Context, uri: Uri, text: String): Boolean = try {
        val out = c.contentResolver.openOutputStream(uri, "wt") ?: c.contentResolver.openOutputStream(uri)
        if (out == null) false else { out.use { it.write(text.toByteArray(Charsets.UTF_8)) }; true }
    } catch (e: Exception) { false }

    private fun queryName(c: Context, uri: Uri): String? = try {
        c.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cur ->
            if (cur.moveToFirst()) cur.getString(0) else null
        }
    } catch (e: Exception) { null }
}
