package com.kovariya.app

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import com.facebook.react.bridge.*
import java.util.Calendar

class DatePickerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DatePickerModule"

    /**
     * Opens the native Android DatePickerDialog.
     *
     * @param options  JS object with optional keys:
     *   - date        (String) ISO date string to pre-select, e.g. "2024-08-15"
     *   - minDate     (String) minimum selectable date, e.g. "2020-01-01"
     *   - maxDate     (String) maximum selectable date, e.g. "2030-12-31"
     *   - title       (String) dialog title (Android only)
     *   - mode        (String) "spinner" | "calendar" (default "calendar")
     * @param promise  Resolves with { year, month (1-based), day, dateString }
     *                 or rejects if the user dismisses the dialog.
     */
    @ReactMethod
    fun showDatePicker(options: ReadableMap, promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No current activity found")
            return
        }

        val calendar = Calendar.getInstance()

        // Parse pre-selected date from options
        if (options.hasKey("date")) {
            parseDate(options.getString("date"))?.let { calendar.time = it }
        }

        val year  = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day   = calendar.get(Calendar.DAY_OF_MONTH)

        // Determine dialog theme/mode
        val themeResId = if (options.hasKey("mode") && options.getString("mode") == "spinner")
            android.R.style.Theme_Material_Light_Dialog
        else
            android.R.style.Theme_DeviceDefault_Light_Dialog

        activity.runOnUiThread {
            val dialog = DatePickerDialog(
                activity,
                themeResId,
                { _, y, m, d ->
                    val result = Arguments.createMap().apply {
                        putInt("year",  y)
                        putInt("month", m + 1)          // Convert to 1-based
                        putInt("day",   d)
                        putString("dateString", "%04d-%02d-%02d".format(y, m + 1, d))
                    }
                    promise.resolve(result)
                },
                year, month, day
            )

            // Apply min date
            if (options.hasKey("minDate")) {
                parseDate(options.getString("minDate"))?.let {
                    dialog.datePicker.minDate = it.time
                }
            }

            // Apply max date
            if (options.hasKey("maxDate")) {
                parseDate(options.getString("maxDate"))?.let {
                    dialog.datePicker.maxDate = it.time
                }
            }

            // Set title if provided
            if (options.hasKey("title")) {
                dialog.setTitle(options.getString("title"))
            }

            // Reject promise when user dismisses
            dialog.setOnCancelListener {
                promise.reject("DISMISSED", "DatePicker was dismissed by the user")
            }

            dialog.show()
        }
    }

    /**
     * Opens the native Android TimePickerDialog.
     *
     * @param options  JS object with optional keys:
     *   - hour        (Int) pre-selected hour in 24h format (default: current hour)
     *   - minute      (Int) pre-selected minute (default: current minute)
     *   - is24Hour    (Boolean) use 24-hour clock (default: false)
     * @param promise  Resolves with { hour, minute, timeString } or rejects on dismiss.
     */
    @ReactMethod
    fun showTimePicker(options: ReadableMap, promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No current activity found")
            return
        }

        val calendar = Calendar.getInstance()
        val hour   = if (options.hasKey("hour"))   options.getInt("hour")   else calendar.get(Calendar.HOUR_OF_DAY)
        val minute = if (options.hasKey("minute")) options.getInt("minute") else calendar.get(Calendar.MINUTE)
        val is24   = if (options.hasKey("is24Hour")) options.getBoolean("is24Hour") else false

        activity.runOnUiThread {
            val dialog = TimePickerDialog(
                activity,
                { _, h, m ->
                    val amPm = if (h < 12) "AM" else "PM"
                    val displayHour = when {
                        is24 -> h
                        h == 0 -> 12
                        h > 12 -> h - 12
                        else   -> h
                    }
                    val timeString = if (is24)
                        "%02d:%02d".format(h, m)
                    else
                        "%d:%02d %s".format(displayHour, m, amPm)

                    val result = Arguments.createMap().apply {
                        putInt("hour",   h)
                        putInt("minute", m)
                        putString("timeString", timeString)
                    }
                    promise.resolve(result)
                },
                hour, minute, is24
            )

            dialog.setOnCancelListener {
                promise.reject("DISMISSED", "TimePicker was dismissed by the user")
            }

            dialog.show()
        }
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private fun parseDate(dateString: String?): java.util.Date? {
        if (dateString.isNullOrEmpty()) return null
        return try {
            java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).parse(dateString)
        } catch (e: Exception) {
            null
        }
    }
}
