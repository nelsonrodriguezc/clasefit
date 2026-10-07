**Idioma / Language:** [Español](README.md) · English

# ClaseFit

Mobile app that lets members of the ClaseFit gym (Laureles branch, Medellín) see upcoming group classes, book a spot and cancel their bookings from their phone. It is the MVP of KEPPRI's technical test, built with Spec-Driven Development (OpenSpec) on Expo + React Native + TypeScript.

> **Repository status:** Phase 2 (proposal, specs, design and tasks). Screens and business rules are implemented in Phase 3; sections marked as *pending* are completed in the phase shown.

## 1. What ClaseFit is

- **User:** one already authenticated member, Laura Gómez (there is no login).
- **Features:** see today's, tomorrow's and the day after tomorrow's classes; book; see and cancel my bookings.
- **Business rules:** RN-01 to RN-04 from the functional input ([docs/insumo/insumo_funcional_ClaseFit.md](docs/insumo/insumo_funcional_ClaseFit.md), in Spanish).
- **Data:** local. The class catalog comes from a bundled JSON file and bookings are stored encrypted on the device. There is no backend.

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

*Pending (Phase 3):* description of the "Próximas clases" (upcoming classes) and "Mis reservas" (my bookings) screens.

## 5. Run the tests

| Goal | Command | Expected result |
|---|---|---|
| All tests | `npm test` | `Tests: N passed, N total` |
| Tests with coverage | `npm run test:coverage` | summary in the terminal and HTML report in `coverage/lcov-report/index.html` |
| A single file | `npx jest __tests__/setup/timezone.test.ts` | `1 passed` |
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

Change in progress: [`openspec/changes/add-class-booking/`](openspec/changes/add-class-booking/) with the [proposal](openspec/changes/add-class-booking/proposal.md), specs [class-booking](openspec/changes/add-class-booking/specs/class-booking/spec.md) and [booking-data-protection](openspec/changes/add-class-booking/specs/booking-data-protection/spec.md), [design](openspec/changes/add-class-booking/design.md) and [tasks](openspec/changes/add-class-booking/tasks.md) (written in Spanish).

## 7. Build and release (EAS)

*Pending (Phase 4):* `preview` and `production` profiles, build commands and APK link. The list of what is missing to publish in the stores will be in [checklist_release.md](checklist_release.md).

## 8. Architecture and security

Layered architecture (Clean Architecture) following SOLID principles, with boundaries enforced by ESLint:

| Layer | Folder | Responsibility |
|---|---|---|
| Domain | `src/domain` | Model, date calculation and rules RN-01 to RN-04. Pure TypeScript. |
| Application | `src/application` | Use cases and ports (interfaces). |
| Infrastructure | `src/infrastructure` | JSON catalog, encrypted storage, secure key, clock. |
| Presentation | `src/presentation` | Screens, components, hooks and user-facing copy. |
| Composition | `src/di` and `app/` | Wires implementations into use cases; expo-router routes. |

The decisions (structure, state, dates, rules, encrypted persistence, SOLID map and discarded alternatives) are in [design.md](openspec/changes/add-class-booking/design.md) (in Spanish). Security summary: bookings are stored in AsyncStorage only encrypted with AES-256-GCM; the 256-bit key is generated on the device and lives only in SecureStore (Keychain on iOS, Keystore on Android); if the stored data was tampered with, it is discarded (fail-closed).

## 9. Repository structure

| Path | Content |
|---|---|
| `app/` | expo-router routes (Phase 3). |
| `src/` | App code by layer (Phase 3). |
| `__tests__/` | Jest tests. |
| `openspec/` | Context, changes and specifications. |
| `docs/insumo/` | Functional input and original data delivered by KEPPRI. |
| `.github/workflows/ci.yml` | Continuous integration: typecheck, lint, tests and OpenSpec. |
| `CLAUDE.md` | Rules for the AI assistants working in the repository. |

## 10. Key assumptions

The full list (S1 to S9) is in [proposal.md](openspec/changes/add-class-booking/proposal.md#supuestos) (in Spanish). The ones with the most impact on behaviour:

- **RN-04:** a booking can be cancelled when 2 hours or more remain; exactly 2 hours is allowed.
- **Dates:** "today" is the current date in America/Bogota (UTC−5), even if the device is in another time zone.
- **Booking = session:** a booking identifies the class and its date, because `diaOffset` is relative to the current day.
- **RN-03:** counts the bookings of the class day, including classes of that day that already started.
- **Message priority:** if several rules fail, RN-02 is shown first, then RN-01, then RN-03.

## 11. Git workflow (GitFlow)

| Branch | Use |
|---|---|
| `main` | Released versions, tagged (`v1.0.0`). |
| `develop` | Integration of finished phases. |
| `feature/fase-N-*` | One branch per phase, with **one commit per phase**, merged into `develop` with `--no-ff`. |
| `release/1.0.0` | Change archive, release configuration and final documentation. |

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

## 13. Test deliverables

| Deliverable | File |
|---|---|
| Functional input | [docs/insumo/insumo_funcional_ClaseFit.md](docs/insumo/insumo_funcional_ClaseFit.md) |
| AI usage log | [bitacora_ia.md](bitacora_ia.md) |
| Reflection answers | *pending (Phase 5)* |
| Release checklist | *pending (Phase 4)* |
