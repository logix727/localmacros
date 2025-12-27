# Changelog

All notable changes to the "LocalMacros" project will be documented in this file.

## [v1.0.3] - 2025-12-27 (Production Ready)
### Fixed
-   **CI/CD**: specific fix for GitHub Action YAML syntax to ensure APK generation.
-   **Typography**: Enforced `Roboto` font for correct Material Design 3 rendering.

## [v1.0.2] - 2025-12-27
### Changed
-   **Infrastructure**: Added `android-release.yml` to build APKs on GitHub Actions automatically.
-   **Design**: Switched font stack to Roboto (Native Android).

## [v1.0.1] - 2025-12-27
### Fixed
-   Restored missing `src/lib/db.ts` file.
-   Resolved lint warning in `health.ts`.

## [v1.0.0] - 2025-12-27 (MVP)
### Added
-   **Local AI**: `window.ai` integration with Gemini Nano prompt.
-   **Persistence**: IndexedDB storage for offline logging.
-   **UI**: Material Design 3 "Expressive" layout (Page.tsx).
-   **Health Connect**: Stubbed service for Fitbit integration.
