import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CatalogValidationError, JsonClassCatalog } from '@/infrastructure/catalog/JsonClassCatalog';
import { JsonMemberSession } from '@/infrastructure/catalog/JsonMemberSession';
import bundledCatalog from '@/infrastructure/catalog/clases.json';

const root = join(__dirname, '..', '..', '..');
const insumo = () =>
  JSON.parse(readFileSync(join(root, 'docs', 'insumo', 'mock-data', 'clases.json'), 'utf8')) as {
    clases: Record<string, unknown>[];
    socio: Record<string, unknown>;
  };

describe('JsonClassCatalog', () => {
  it('Scenario: Catálogo del insumo aceptado', async () => {
    const catalog = await new JsonClassCatalog(bundledCatalog).load();

    expect(catalog.gymName).toBe('ClaseFit · Sede Laureles');
    expect(catalog.classes).toHaveLength(10);
    expect(catalog.classes[0]).toEqual({
      id: 'C-01',
      name: 'Spinning',
      instructor: 'Andrés Restrepo',
      dayOffset: 0,
      startTime: { hours: 6, minutes: 0 },
      durationMin: 45,
      capacity: 20,
      takenByOthers: 18,
    });
  });

  it('valida una sola vez y reutiliza el resultado', async () => {
    const catalog = new JsonClassCatalog(bundledCatalog);

    expect(await catalog.load()).toBe(await catalog.load());
  });

  it('la copia empaquetada en la app es idéntica al insumo entregado por el equipo funcional', () => {
    const bundled = JSON.parse(readFileSync(join(root, 'src', 'infrastructure', 'catalog', 'clases.json'), 'utf8'));

    expect(bundled).toEqual(insumo());
  });

  it('Scenario: Catálogo con estructura inválida (clase sin instructor)', async () => {
    const data = insumo();
    delete data.clases[0]?.instructor;

    await expect(new JsonClassCatalog(data).load()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it('rechaza una hora fuera del formato HH:mm', async () => {
    const data = insumo();
    data.clases[1] = { ...data.clases[1], hora: '7pm' };

    await expect(new JsonClassCatalog(data).load()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it('Scenario: Catálogo con más ocupados que cupos', async () => {
    const data = insumo();
    data.clases[2] = { ...data.clases[2], cupoTotal: 12, ocupados: 13 };

    await expect(new JsonClassCatalog(data).load()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it('rechaza identificadores de clase duplicados (romperían la identidad de la sesión)', async () => {
    const data = insumo();
    data.clases[1] = { ...data.clases[1], id: 'C-01' };

    await expect(new JsonClassCatalog(data).load()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it.each([-1, 1.5])('rechaza un diaOffset inválido (%p)', async (diaOffset) => {
    const data = insumo();
    data.clases[0] = { ...data.clases[0], diaOffset };

    await expect(new JsonClassCatalog(data).load()).rejects.toBeInstanceOf(CatalogValidationError);
  });

  it('no expone los datos inválidos en el mensaje del error', async () => {
    const data = insumo();
    data.clases[0] = { ...data.clases[0], instructor: '' };

    await expect(new JsonClassCatalog(data).load()).rejects.toThrow('Invalid class catalog');
  });
});

describe('JsonMemberSession', () => {
  it('expone la socia autenticada del insumo', async () => {
    expect(await new JsonMemberSession(bundledCatalog).current()).toEqual({ id: 'S-0001', name: 'Laura Gómez' });
  });

  it('rechaza datos de socia inválidos', async () => {
    const data = insumo();
    data.socio = { id: '' };

    await expect(new JsonMemberSession(data).current()).rejects.toThrow('Invalid member');
  });
});
