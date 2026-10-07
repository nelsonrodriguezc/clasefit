import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Keeps the Spanish (default) and English READMEs equivalent so that neither
// language drifts: same language selector, same sections, identical commands.
const root = join(__dirname, '..', '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

const sectionNumbers = (markdown: string) =>
  [...markdown.matchAll(/^## (\d+)\. /gm)].map((match) => match[1]);

const codeBlocks = (markdown: string) =>
  [...markdown.matchAll(/```[a-z]*\r?\n([\s\S]*?)```/g)].map((match) => (match[1] ?? '').trim());

describe('README bilingüe', () => {
  const es = read('README.md');
  const en = read('README.en.md');

  it('ofrece el selector de idioma en la primera línea de ambos archivos', () => {
    expect(es.split(/\r?\n/)[0]).toBe('**Idioma / Language:** Español · [English](README.en.md)');
    expect(en.split(/\r?\n/)[0]).toBe('**Idioma / Language:** [Español](README.md) · English');
  });

  it('tiene las mismas secciones numeradas en español e inglés', () => {
    expect(sectionNumbers(es).length).toBeGreaterThan(0);
    expect(sectionNumbers(en)).toEqual(sectionNumbers(es));
  });

  it('usa exactamente los mismos bloques de comandos en ambos idiomas', () => {
    expect(codeBlocks(es).length).toBeGreaterThan(0);
    expect(codeBlocks(en)).toEqual(codeBlocks(es));
  });

  it('no deja marcadores sin reemplazar (por ejemplo la URL del repositorio)', () => {
    expect(es).not.toMatch(/\{\{[A-Z_]+\}\}/);
    expect(en).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });
});
