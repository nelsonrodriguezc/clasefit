import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Release configuration as code: these values are part of the release checklist and the
// security model, so a change that breaks them must fail the build.
const root = join(__dirname, '..', '..');
const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8')).expo;
const easJson = JSON.parse(readFileSync(join(root, 'eas.json'), 'utf8'));

describe('Configuración de release', () => {
  it('identifica la app con nombre, slug, versión e identificadores de tienda', () => {
    expect(appJson).toMatchObject({ name: 'ClaseFit', slug: 'clasefit', version: '1.0.0' });
    expect(appJson.android.package).toBe('com.keppri.clasefit.nelsonrodriguez');
    expect(appJson.ios.bundleIdentifier).toBe('com.keppri.clasefit.nelsonrodriguez');
  });

  it('está vinculada a un proyecto de EAS', () => {
    expect(appJson.owner).toBe('nelsonrodriguezc');
    expect(appJson.extra.eas.projectId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('en Android excluye los datos de las copias de seguridad y no pide permisos (ni red)', () => {
    expect(appJson.android.allowBackup).toBe(false);
    expect(appJson.android.permissions).toEqual([]);
    expect(appJson.android.blockedPermissions).toEqual(
      expect.arrayContaining(['android.permission.INTERNET', 'android.permission.CAMERA', 'android.permission.RECORD_AUDIO']),
    );
  });

  it('en iOS declara que no rastrea ni recolecta datos (privacy manifest)', () => {
    expect(appJson.ios.privacyManifests).toMatchObject({ NSPrivacyTracking: false, NSPrivacyCollectedDataTypes: [] });
  });

  it('usa la identidad visual en el ícono y en el splash nativo (fondo oscuro, sin destello blanco)', () => {
    expect(appJson.icon).toBe('./assets/icon.png');
    expect(appJson.userInterfaceStyle).toBe('dark');
    expect(appJson.android.adaptiveIcon).toMatchObject({
      backgroundColor: '#0B1220',
      foregroundImage: './assets/android-icon-foreground.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    });
    expect(appJson.plugins).toContainEqual([
      'expo-splash-screen',
      expect.objectContaining({ backgroundColor: '#0B1220', image: './assets/splash-icon.png' }),
    ]);
  });

  it('tiene perfiles preview (APK interno) y production (AAB con versión autoincremental)', () => {
    expect(easJson.build.preview).toMatchObject({ distribution: 'internal', android: { buildType: 'apk' } });
    expect(easJson.build.production).toMatchObject({ autoIncrement: true, android: { buildType: 'app-bundle' } });
    expect(easJson.cli.appVersionSource).toBe('remote');
  });

  it('no guarda secretos de firma ni de las tiendas en el repositorio', () => {
    const serialized = JSON.stringify(easJson);
    expect(serialized).not.toMatch(/serviceAccountKeyPath|ascApiKey|password|keystore/i);
  });
});
