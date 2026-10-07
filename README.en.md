**Idioma / Language:** [Español](README.md) · English

# ClaseFit

Mobile app that lets members of the ClaseFit gym (Laureles branch, Medellín) see upcoming group classes, book a spot and cancel their bookings from their phone. It is the MVP of KEPPRI's technical test, built with Spec-Driven Development (OpenSpec) on Expo + React Native + TypeScript.

> **Repository status:** version 1.1.0. Two changes went through the full SDD cycle (proposal → specs → design → tasks → apply → verify → archive → release):
> - `add-class-booking` (1.0.0): bookings with rules RN-01 to RN-04 and data protection.
> - `refresh-mobile-ux-ui` (1.1.0): UI based on the reference mockup.

## 1. What ClaseFit is

- **User:** one already authenticated member, Laura Gómez (there is no login).
- **Features:** see today's, tomorrow's and the day after tomorrow's classes; book; see and cancel my bookings.
- **Business rules:** RN-01 to RN-04 from the functional input ([docs/insumo/insumo_funcional_ClaseFit.md](docs/insumo/insumo_funcional_ClaseFit.md), in Spanish).
- **Data:** local. The class catalog comes from a bundled JSON file and bookings are stored encrypted on the device. There is no backend.
- **UI:** dark theme with green accents, as in the reference mockup, with AA color contrast checked by tests.

## 2. Prerequisites

| Tool | Minimum version | Tested version | How to check it |
|---|---|---|---|
| Node.js | 20 | 22.23.3 | `node -v` |
| npm | 10 | 10.9.9 | `npm -v` |
| Git | 2.40 | 2.49.0 | `git --version` |
| Expo Go (Android or iPhone) | compatible with Expo SDK 57 | latest store version | if it is not compatible, Expo Go says so when it opens the project |
| Android emulator (optional) | Android 13 (API 33) | Pixel 7 · API 33 | Android Studio › Device Manager |

You need **one** of these two options to see the app: a phone with Expo Go or an Android emulator.

Check the versions:

```bash
node -v
```

```bash
npm -v
```

Expected result: `v20.x.x` or higher for Node and `10.x.x` or higher for npm.

## 3. Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nelsonrodriguezc/clasefit.git clasefit
   ```

2. Enter the project folder:

   ```bash
   cd clasefit
   ```

3. Install the exact dependencies from `package-lock.json`:

   ```bash
   npm ci
   ```

   Expected result: it ends with `added N packages` and no errors.

## 4. Run the app

1. Start the development server:

   ```bash
   npx expo start
   ```

   Expected result: the terminal shows a QR code and the message `Logs for your project will appear below`.

2. Open the app with one of these options:
   - **Android emulator:** with the emulator running, press the `a` key in the terminal. Expo installs Expo Go if needed and opens ClaseFit.
   - **Android phone:** open Expo Go and scan the QR code.
   - **iPhone:** open the Camera app and scan the QR code.

3. If the phone and the computer are not on the same Wi-Fi network, stop the server (`Ctrl + C`) and start it in tunnel mode:

   ```bash
   npx expo start --tunnel
   ```

4. Use the app. When it opens you see the launch screen with the brand while the classes load. Then it has three tabs (the UI is in Spanish):

   | Tab | What it shows | What you can do |
   |---|---|---|
   | **Próximas clases** (upcoming classes) | <ul><li>A greeting to the member ("Hola, Laura") and her member number.</li><li>A day selector.</li><li>Today's, tomorrow's and the day after tomorrow's classes that have not started (Bogotá time), with day, time, duration, instructor and spots ("5 de 20 cupos" or "Llena" = full).</li></ul> | <ul><li>Tap a day to jump to its classes.</li><li>Tap **Reservar** (book). If the booking passes RN-01 to RN-03 you see "¡Listo! Tu cupo está reservado" and the class is marked **Reservada** (booked); otherwise you see the message of the rule that failed.</li><li>Tap a card to open its **detail** (description and benefits of the discipline). You can also book or cancel from the detail.</li></ul> |
   | **Mis reservas** (my bookings) | Your bookings of classes that have not started, closest first, or "Aún no tienes reservas" (no bookings yet). | Tap **Cancelar reserva** and confirm with **Sí, cancelar**. With less than 2 hours left you see "Ya no puedes cancelar: faltan menos de 2 horas.". |
   | **Perfil** (profile) | The member's name and number, and how many active bookings she has. | Tap **Mis reservas** to go to that tab. |

   Bookings are stored encrypted on the device: they are still there after closing and reopening the app. Screenshots of every flow on an Android emulator: [docs/evidencias](docs/evidencias/README.md).

## 5. Run the tests

| Goal | Command | Expected result |
|---|---|---|
| All tests | `npm test` | `Tests: N passed, N total` |
| Tests with coverage | `npm run test:coverage` | summary in the terminal and HTML report in `coverage/lcov-report/index.html` |
| A single file | `npx jest __tests__/acceptance/class-booking.test.ts` | `Tests: 33 passed, 33 total` |
| TypeScript types | `npm run typecheck` | finishes with no messages |
| Style and layer boundaries | `npm run lint` | finishes with no messages |
| All of the above + OpenSpec | `npm run verify` | every step finishes without errors |

Run all the tests:

```bash
npm test
```

Run the full verification (the same one continuous integration runs):

```bash
npm run verify
```

How the tests are organized:

| Folder | Content |
|---|---|
| `__tests__/acceptance/` | One suite per spec: one `describe` per Requirement and one `it` per Scenario, with the same OpenSpec names. |
| `__tests__/traceability.test.ts` | Fails if any Requirement or Scenario of the specs has no test. |
| `__tests__/domain/`, `application/`, `infrastructure/`, `presentation/` | Unit and integration tests of each layer (including rules RN-01 to RN-04 at their boundaries, encryption and the UI). |

`npm run test:coverage` enforces minimum coverage: 100% of lines in `src/domain` and `src/application` and 95% overall; the command fails below that.

A state update outside `act()` fails the test that caused it (`jest.setup.ts`). The only exception is an internal update of React Navigation's tab bar that renders nothing visible; the reason is documented in that file.

Tests always run with the `Pacific/Kiritimati` time zone (UTC+14), set in `jest.config.js`. This guarantees that date calculations use Bogotá time and not the computer's time zone. Do not change the `TZ` variable when running the tests.

## 6. Specifications with OpenSpec

The project uses OpenSpec 1.14.1. `npm run spec:validate` downloads it with `npx`, so a global installation is optional. To use the commands directly, install it like this:

```bash
npm install -g @fission-ai/openspec@1.14.1
```

List the specified capabilities:

```bash
openspec list --specs
```

Validate changes and specs in strict mode:

```bash
openspec validate --all --strict
```

| Location | Content |
|---|---|
| `openspec/config.yaml` | Project context (in OpenSpec 1.14 it replaces `openspec/project.md`). |
| `openspec/changes/` | Changes in progress (proposal, delta specs, design, tasks). |
| `openspec/specs/` | Current specification, generated when a change is archived. |
| `openspec/changes/archive/` | History of archived changes. |

Current specification (generated when archiving): [class-booking](openspec/specs/class-booking/spec.md), [booking-data-protection](openspec/specs/booking-data-protection/spec.md) and [app-shell](openspec/specs/app-shell/spec.md) (written in Spanish).

Archived changes:

| Change | Version | Artifacts |
|---|---|---|
| [`2026-10-06-add-class-booking`](openspec/changes/archive/2026-10-06-add-class-booking/) | 1.0.0 | [proposal](openspec/changes/archive/2026-10-06-add-class-booking/proposal.md), [design](openspec/changes/archive/2026-10-06-add-class-booking/design.md), [tasks](openspec/changes/archive/2026-10-06-add-class-booking/tasks.md) (30/30 tasks checked) and delta specs |
| [`2026-10-07-refresh-mobile-ux-ui`](openspec/changes/archive/2026-10-07-refresh-mobile-ux-ui/) | 1.1.0 | [proposal](openspec/changes/archive/2026-10-07-refresh-mobile-ux-ui/proposal.md), [design](openspec/changes/archive/2026-10-07-refresh-mobile-ux-ui/design.md) (with the table of differences from the mockup), [tasks](openspec/changes/archive/2026-10-07-refresh-mobile-ux-ui/tasks.md) (19/19 tasks checked) and delta spec |

## 7. Build and release (EAS)

The project is linked to EAS: [@nelsonrodriguezc/clasefit](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit). Profiles defined in `eas.json`:

| Profile | Result | Use |
|---|---|---|
| `preview` | Installable APK, internal distribution | Test on Android devices without going through the store. |
| `production` | AAB (Android) and IPA (iOS) with an auto-incremented build number managed by EAS | Publish on Google Play and the App Store. |

1. Log in to your Expo account:

   ```bash
   npx eas-cli login
   ```

2. Build the test APK:

   ```bash
   npx eas-cli build --platform android --profile preview
   ```

   Expected result: when it finishes, the terminal shows the APK download link.

**Version 1.1.0 APK:**
- **Links:** [`preview` build on EAS](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit/builds/62714290-bb5b-49c1-aea3-15444489c69c) or [direct APK download](https://expo.dev/artifacts/eas/ZC19aZxP3r_bhITYCCYnivKXpxVirQWy87CaoUXp7qc.apk) (81 MB). Open it on an Android phone to install it.
- **Verification:** on an Android 13 emulator we checked the native splash, the icon, booking, persistence, permissions and encryption at rest ([evidence](docs/evidencias/README.md#build-de-release-eas--perfil-preview--versión-110), in Spanish).

To build with another Expo account, run `npx eas-cli init` with that account: the command replaces `owner` and `extra.eas.projectId` in `app.json`.

What is missing to publish on Google Play and the App Store is listed in [checklist_release.md](checklist_release.md) (in Spanish).

## 8. Architecture and security

Layered architecture (Clean Architecture) following SOLID principles, with boundaries enforced by ESLint:

| Layer | Folder | Responsibility |
|---|---|---|
| Domain | `src/domain` | Model, date calculation and rules RN-01 to RN-04. Pure TypeScript. |
| Application | `src/application` | Use cases and ports (interfaces). |
| Infrastructure | `src/infrastructure` | JSON catalog, encrypted storage, secure key, clock. |
| Presentation | `src/presentation` | Screens, components, hooks and user-facing copy. |
| Composition | `src/di` and `App.tsx` | Wires implementations into use cases and mounts navigation. |

The decisions (structure, state, dates, rules, encrypted persistence, SOLID map and discarded alternatives) are in [design.md](openspec/changes/archive/2026-10-06-add-class-booking/design.md) (in Spanish). The UI decisions (palette and contrast, navigation, detail, splash and differences from the mockup) are in the [1.1.0 design.md](openspec/changes/archive/2026-10-07-refresh-mobile-ux-ui/design.md). Security summary: bookings are stored in AsyncStorage only encrypted with AES-256-GCM; the 256-bit key is generated on the device and lives only in SecureStore (Keychain on iOS, Keystore on Android); if the stored data was tampered with, it is discarded (fail-closed).

## 9. Repository structure

| Path | Content |
|---|---|
| `App.tsx`, `index.ts` | App root: dependencies and tab navigation. |
| `src/` | App code by layer (`domain`, `application`, `infrastructure`, `presentation`, `di`). |
| `__mocks__/` | Jest doubles of the native modules (real AES-GCM over WebCrypto, SecureStore and AsyncStorage). |
| `assets/` | App icon, Android adaptive icon, splash and brand mark. The source is `assets/brand/clasefit-mark.svg`. |
| `scripts/export-brand-assets.ps1` | Exports the PNGs in `assets/` from the brand SVG (Windows PowerShell). |
| `docs/evidencias/` | Android smoke-test screenshots and the encryption-at-rest check. |
| `__tests__/` | Jest tests. |
| `openspec/` | Context, changes and specifications. |
| `docs/insumo/` | Functional input and original data delivered by KEPPRI. |
| `.github/workflows/ci.yml` | Continuous integration: typecheck, lint, tests and OpenSpec. |
| `CLAUDE.md` | Rules for the AI assistants working in the repository. |

## 10. Key assumptions

The full list (S1 to S9) is in [proposal.md](openspec/changes/archive/2026-10-06-add-class-booking/proposal.md#supuestos) (in Spanish). The ones with the most impact on behaviour:

- **RN-04:** a booking can be cancelled when 2 hours or more remain; exactly 2 hours is allowed.
- **Dates:** "today" is the current date in America/Bogota (UTC−5), even if the device is in another time zone.
- **Booking = session:** a booking identifies the class and its date, because `diaOffset` is relative to the current day.
- **RN-03:** counts the bookings of the class day, including classes of that day that already started.
- **Message priority:** if several rules fail, RN-02 is shown first, then RN-01, then RN-03.

UI assumptions (UI-1 to UI-7, in the [1.1.0 proposal](openspec/changes/archive/2026-10-07-refresh-mobile-ux-ui/proposal.md#supuestos)):

- **Mockup and functional input:** where the mockup contradicts the input, the input wins. For example, the app keeps "¡Listo! Tu cupo está reservado".
- **Day selector:** it does not hide classes, because HU-01 asks to see all three days. Tapping a day jumps to its section.
- **Mockup elements out of scope:** notifications, sign-out, history and settings are not shown.

## 11. Git workflow (GitFlow)

| Branch | Use |
|---|---|
| `main` | Released versions, tagged (`v1.0.0`, `v1.1.0`). |
| `develop` | Integration of finished phases. |
| `feature/phase-N-*` | 1.0.0: one branch per phase (`phase-1-setup`, `phase-2-spec`, `phase-3-apply-verify`), with **one commit per phase**, merged into `develop` with `--no-ff`. |
| `release/1.0.0` | Change archive, release configuration and final documentation of 1.0.0. |
| `feature/refresh-mobile-ux-ui` | 1.1.0, two commits: the first version of the visual refresh and its adjustment after the review against the mockup. |
| `release/1.1.0` | Change archive, version 1.1.0 and documentation. |

Review the full history:

```bash
git log --oneline --graph --all
```

## 12. Troubleshooting

| Symptom | Fix |
|---|---|
| `Port 8081 is being used by another process` | Start Metro on another port: `npx expo start --port 8082`. |
| Expo Go says the project uses an incompatible SDK | Update Expo Go from the store; it must support Expo SDK 57. |
| The app shows old code or cache errors | Restart clearing the cache: `npx expo start -c`. |
| `npm ci` fails because of the Node version | Install Node 20 or newer and run `npm ci` again. |
| In Expo Go a floating gear button covers part of the screen | It is an Expo Go tool, not part of the app. Hide it from its developer menu with the **Tools button** option. |

## 13. Test deliverables

| Deliverable | File |
|---|---|
| Functional input | [docs/insumo/insumo_funcional_ClaseFit.md](docs/insumo/insumo_funcional_ClaseFit.md) |
| AI usage log | [bitacora_ia.md](bitacora_ia.md) |
| Reflection answers | [respuestas_reflexion.md](respuestas_reflexion.md) (in Spanish) |
| Release checklist | [checklist_release.md](checklist_release.md) |
| Android APK (bonus) | [`preview` build 1.1.0 on EAS](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit/builds/62714290-bb5b-49c1-aea3-15444489c69c) |
| Smoke-test evidence | [docs/evidencias](docs/evidencias/README.md) |
