# Checklist de release · ClaseFit

## Listo en el proyecto
- [x] Nombre, `slug` y versión en `app.json`: **ClaseFit** · `clasefit` · `1.1.0`.
- [x] Identidad visual del mockup:
  - Ícono, ícono adaptativo de Android (con versión monocromática) y splash nativo con la marca sobre fondo `#0B1220`, configurado con `expo-splash-screen`.
  - Fuente: `assets/brand/clasefit-mark.svg`, exportada con `scripts/export-brand-assets.ps1`.
- [x] `android.package` e `ios.bundleIdentifier`: `com.keppri.clasefit.nelsonrodriguez`.
- [x] `eas.json` con perfiles **preview** (APK de distribución interna) y **production** (AAB; `versionCode`/`buildNumber` gestionados por EAS con `appVersionSource: remote` y `autoIncrement`).
- [x] Proyecto EAS vinculado: [@nelsonrodriguezc/clasefit](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit) (`extra.eas.projectId` y `owner` en `app.json`).
- [x] (Bonus) Build instalable · enlace: [build Android `preview` en EAS](https://expo.dev/accounts/nelsonrodriguezc/projects/clasefit/builds/9c7fa5ac-dc0f-4b1b-9538-164065d13496) (abrirlo en el celular Android para instalar) · [descarga directa del APK](https://expo.dev/artifacts/eas/O4GYB3IIDeJwlVop-vrge3pnekXtO1lzfMBJIYyRtQs.apk) · versión 1.0.0 (versionCode 1), 81 MB. Verificado en emulador: funciona sin red, persiste las reservas cifradas, sin `ALLOW_BACKUP` ([evidencias](docs/evidencias/README.md#build-de-release-eas--perfil-preview)).
- [x] Seguridad de la configuración: `android.allowBackup: false`; `permissions: []` y `blockedPermissions` (incluye `INTERNET`: la app no usa red); privacy manifest de iOS sin rastreo ni recolección; reservas cifradas con AES-256-GCM y llave en Keystore/Keychain.
- [x] Calidad: `npm run verify` en verde (typecheck, lint con fronteras de capas, pruebas con umbrales de cobertura y `openspec validate --all --strict`) y CI en GitHub Actions.
- [x] Smoke test en emulador Android (Expo Go) de la versión 1.1.0 con evidencias en [docs/evidencias](docs/evidencias/README.md), incluida la verificación de que AsyncStorage no guarda texto en claro (hecha en la 1.0.0; el almacenamiento no cambió).
- [x] Configuración de release cubierta por pruebas: `__tests__/config/releaseConfig.test.ts`.

## Falta para Google Play
- [ ] Generar el APK `preview` de la **1.1.0** y repetir en el dispositivo la revisión de permisos y la de cifrado en reposo. El APK enlazado arriba es el de la 1.0.0, anterior a la mejora visual; el nuevo build también permitirá ver el ícono y el splash nativo, que Expo Go no muestra.
- [ ] Cuenta de Google Play Console (pago único de USD 25) con la verificación de identidad del desarrollador completa.
- [ ] Crear la app en Play Console con el package `com.keppri.clasefit.nelsonrodriguez` (no se puede cambiar después de publicar).
- [ ] Firma: activar Play App Signing. EAS genera el keystore de subida; respaldarlo con `eas credentials`.
- [ ] Ficha de la tienda en español (Colombia): título, descripción corta y larga, ícono de 512 × 512, gráfico destacado de 1024 × 500 y al menos 2 capturas de teléfono.
- [ ] Política de privacidad publicada en una URL, alineada con la Ley 1581 de 2012 (Habeas Data), aunque la app no envíe datos.
- [ ] Formulario de Seguridad de los datos: no recolecta ni comparte datos; los datos se guardan cifrados en el dispositivo; no usa red.
- [ ] Clasificación de contenido (cuestionario IARC), público objetivo, declaración de anuncios (sin anuncios) e instrucciones de acceso (no requiere login).
- [ ] Confirmar en la consola que el *target API level* del build cumple el mínimo vigente de Google Play.
- [ ] Si la cuenta de desarrollador es personal y nueva: prueba cerrada con el número mínimo de testers y días que exija la política vigente (hoy, 12 testers durante 14 días) antes de pedir acceso a producción.
- [ ] Cuenta de servicio de Google Cloud con acceso a la API de Google Play para `eas submit`. La llave JSON no se versiona; se carga en EAS.
- [ ] Build de producción y envío al track interno:

  ```bash
  npx eas-cli build --platform android --profile production
  ```

  ```bash
  npx eas-cli submit --platform android --profile production
  ```

## Falta para App Store
- [ ] Apple Developer Program (USD 99 al año) y acceso a App Store Connect.
- [ ] Registrar el bundle id `com.keppri.clasefit.nelsonrodriguez` y crear la app en App Store Connect; dejar que EAS gestione certificados y perfiles.
- [ ] Probar en un iPhone real (Expo Go o TestFlight): **la app no se verificó en iOS** porque el desarrollo se hizo en Windows.
- [ ] Etiquetas de privacidad (App Privacy): "Datos no recopilados".
- [ ] Cumplimiento de exportación: la app usa AES-256-GCM del sistema (CryptoKit) solo para proteger datos locales. Definir `ios.config.usesNonExemptEncryption` con asesoría legal (probablemente exenta).
- [ ] Ficha: nombre, subtítulo, descripción, palabras clave, URL de soporte, URL de la política de privacidad, capturas de iPhone de 6,9" y clasificación por edad.
- [ ] Notas para el revisor: no requiere login; los datos son de demostración.
- [ ] Build de producción, envío y distribución por TestFlight antes de publicar:

  ```bash
  npx eas-cli build --platform ios --profile production
  ```

  ```bash
  npx eas-cli submit --platform ios --profile production
  ```

## Riesgos o bloqueos para publicar
- **Datos de demostración:** el catálogo es un JSON local sin backend; los cupos no son reales. Riesgo de rechazo por funcionalidad mínima (App Store 4.2 y políticas de calidad de Google Play).
- **Reglas en el cliente:** RN-01 a RN-04 dependen del reloj del dispositivo; en producción deben validarse en un backend.
- **Sin respaldo:** desinstalar la app borra las reservas (no hay sincronización; las copias de seguridad están deshabilitadas a propósito).
- **Identidad visual:**
  - La marca y el ícono son una propuesta propia basada en el mockup; deben validarse con quien sea dueño de la marca antes de publicar.
  - Las capturas de la tienda deben salir de un build de release, no de Expo Go.
  - Las disciplinas usan íconos y no fotos, porque no hay imágenes con licencia.
- **Aviso de configuración:** desde la 1.0.0, `npx expo config` advierte que `userInterfaceStyle` necesita `expo-system-ui` en Android. La app no depende de ese ajuste: dibuja su propio tema oscuro y fija íconos claros en la barra de estado.
- **Llave de firma Android:** la genera EAS; si se pierde y no se usa Play App Signing, no se pueden publicar actualizaciones.
- **Revisión legal** de la política de privacidad y del cumplimiento de exportación.
- **Dependencias:** `npm audit --omit=dev` reporta 35 avisos (23 altos, 12 moderados) en `braces`, `node-forge`, `sprintf-js` y `uuid`, que llegan por las herramientas de compilación de `expo` y `react-native` (CLI, Metro, preset de Jest) y no forman parte del bundle de la app. La única "corrección" que propone npm es bajar de versión el SDK. Se revisan en cada ejecución de CI.
- **Permisos declarados por librerías:** el APK incluye `USE_BIOMETRIC` y `USE_FINGERPRINT`, que agrega expo-secure-store para soportar `requireAuthentication`. Son permisos normales (sin diálogo) y la app no los usa; se pueden agregar a `blockedPermissions` en un próximo build, después de probarlo.
- **Endurecimiento pendiente** para una versión con backend: minificación R8, certificate pinning, attestation (Play Integrity / App Attest) y detección de root/jailbreak.
