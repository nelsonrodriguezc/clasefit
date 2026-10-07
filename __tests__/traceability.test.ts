import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * SDD traceability gate: every Requirement and every Scenario of the OpenSpec specs must have an
 * executable test with the same name in __tests__/acceptance/<capability>.test.ts, and the
 * acceptance suites cannot contain requirements that are not in the spec.
 * Specs are read from openspec/specs (current truth) and from active changes (not the archive).
 */
const root = join(__dirname, '..');

interface Requirement {
  readonly name: string;
  readonly scenarios: string[];
}

const specFiles = (): Map<string, string> => {
  const found = new Map<string, string>();
  const collect = (specsDir: string) => {
    if (!existsSync(specsDir)) return;
    for (const capability of readdirSync(specsDir)) {
      const file = join(specsDir, capability, 'spec.md');
      if (existsSync(file)) found.set(capability, file);
    }
  };
  collect(join(root, 'openspec', 'specs'));
  const changesDir = join(root, 'openspec', 'changes');
  for (const change of existsSync(changesDir) ? readdirSync(changesDir) : []) {
    if (change !== 'archive') collect(join(changesDir, change, 'specs'));
  }
  return found;
};

const parseSpec = (markdown: string): Requirement[] => {
  const requirements: Requirement[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const requirement = /^### Requirement: (.+)$/.exec(line);
    const scenario = /^#### Scenario: (.+)$/.exec(line);
    if (requirement?.[1]) requirements.push({ name: requirement[1].trim(), scenarios: [] });
    else if (scenario?.[1]) requirements[requirements.length - 1]?.scenarios.push(scenario[1].trim());
  }
  return requirements;
};

const specs = [...specFiles()].map(([capability, file]) => ({
  capability,
  requirements: parseSpec(readFileSync(file, 'utf8')),
}));

describe('Trazabilidad spec → pruebas', () => {
  it('encuentra las capacidades especificadas', () => {
    expect(specs.map((spec) => spec.capability).sort()).toEqual(['app-shell', 'booking-data-protection', 'class-booking']);
  });

  describe.each(specs)('Capacidad $capability', ({ capability, requirements }) => {
    const suitePath = join(root, '__tests__', 'acceptance', `${capability}.test.ts`);
    const suite = existsSync(suitePath) ? readFileSync(suitePath, 'utf8') : '';

    it('tiene una suite de aceptación', () => {
      expect(existsSync(suitePath)).toBe(true);
    });

    it.each(requirements.flatMap((requirement) => requirement.scenarios.map((scenario) => [requirement.name, scenario])))(
      '%s → Scenario "%s" tiene una prueba',
      (requirement, scenario) => {
        expect(suite).toContain(`describe('${requirement}'`);
        expect(suite).toContain(`it('${scenario}'`);
      },
    );

    it('no tiene requisitos en la suite que no existan en la spec', () => {
      const describedRequirements = [...suite.matchAll(/^describe\('([^']+)'/gm)].map((match) => match[1]);
      expect(describedRequirements.sort()).toEqual(requirements.map((requirement) => requirement.name).sort());
    });
  });
});
