package com.kovariya.app

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * DatePickerPackage
 *
 * Register this package inside your MainApplication.kt (or MainApplication.java):
 *
 *   override fun getPackages(): List<ReactPackage> = listOf(
 *       ...,
 *       DatePickerPackage()
 *   )
 */
class DatePickerPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> = listOf(DatePickerModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
