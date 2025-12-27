# LocalMacros

**LocalMacros** is a privacy-first, offline-capable food logging application for Android (Pixel 10 Pro XL). It utilizes on-device AI (Gemini Nano) to analyze food images and logs nutrition data directly to Health Connect.

## Core Features
- 📸 **Camera Capture**: Integrated with system camera for quick logging.
- 🧠 **On-Device AI**: Uses Gemini Nano via `window.ai` to analyze food locally. No cloud API keys required.
- 🎨 **Material Design 3**: Modern, adaptive UI with Dynamic Color support basics.
- 🔒 **Privacy First**: No external servers. All data stays on your device.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (React/TypeScript)
- **Mobile Runtime**: [Capacitor](https://capacitorjs.com/) (Generate Native Android APK)
- **Styling**: Tailwind CSS + Material Design 3 variables
- **AI**: Chrome Built-in AI (`window.ai` / Prompt API)

## Prerequisites
- **Node.js**: v18+
- **Android Studio**: For building the APK
- **Device**: Pixel 10 Pro XL (or any device with Gemini Nano & Chrome Prompt API enabled)

## Setup & Build

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Build Web Assets**
    ```bash
    npm run build
    ```

3.  **Sync to Android**
    ```bash
    npx cap sync
    ```

4.  **Open Android Studio**
    ```bash
    npx cap open android
    ```
    Alternatively, build the APK from terminal:
    ```bash
    cd android && ./gradlew assembleDebug
    ```

## License
MIT
