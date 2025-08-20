Casino Practice Android (WebView) — Build Guide
=================================================
This project is a **demo/practice** casino app (virtual coins only). It wraps a local HTML/JS game suite inside an Android WebView.

What’s inside
-------------
- Games: Slots, Roulette, Blackjack, Color Trading (no real money)
- All assets are local in `app/src/main/assets/www`
- Balance is stored in localStorage on the device

How to build APK (Android Studio)
---------------------------------
1) Install Android Studio (latest). Open this folder as a project.
2) Let Gradle sync (internet required the first time for dependencies).
3) Connect an Android device with USB debugging OR start an Emulator.
4) From the menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5) The debug APK will be at: `app/build/outputs/apk/debug/app-debug.apk`.

App ID & Name
-------------
- Application ID: `com.alex.casino` (change in `app/build.gradle.kts`)
- App name: change in `app/src/main/res/values/strings.xml`

Important
---------
- This is a **practice/demo** app using **virtual coins only**.
- Do **not** add real-money deposits/withdrawals without proper licenses and compliance in your country.
