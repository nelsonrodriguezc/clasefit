import { disciplineOf } from '@/presentation/disciplines';
import { DEFAULT_DISCIPLINE_COPY, DISCIPLINE_COPY } from '@/presentation/messages';

describe('Disciplinas (ícono, descripción y etiquetas por clase)', () => {
  it('Spinning usa el texto y las etiquetas del mockup', () => {
    expect(disciplineOf('Spinning')).toEqual({
      icon: 'bike',
      description: 'Clase de alta intensidad enfocada en mejorar la resistencia cardiovascular, fuerza y quema de calorías.',
      tags: [
        { label: 'Cardio', icon: 'heart-pulse' },
        { label: 'Fuerza', icon: 'dumbbell' },
        { label: 'Resistencia', icon: 'fire' },
      ],
    });
  });

  it('cada disciplina del catálogo tiene su propio ícono y un ícono para cada etiqueta', () => {
    for (const name of ['Spinning', 'Funcional', 'Yoga', 'Rumba']) {
      const discipline = disciplineOf(name);
      expect(DISCIPLINE_COPY[name]).toBeDefined();
      expect(discipline.icon).not.toBe('arm-flex');
      for (const tag of discipline.tags) expect(tag.icon).not.toBe('arm-flex');
    }
  });

  it('una clase desconocida usa un ícono y un texto genéricos, sin romper la pantalla', () => {
    expect(disciplineOf('Pilates')).toEqual({ icon: 'arm-flex', description: DEFAULT_DISCIPLINE_COPY.description, tags: [] });
  });
});
