// Guards the guarantee given by jest.config.js: the whole suite runs in UTC+14,
// far from America/Bogota (UTC-5), so time-zone bugs cannot hide behind the dev machine's zone.
describe('Entorno de pruebas', () => {
  it('ejecuta la suite en una zona horaria extrema (Pacific/Kiritimati, UTC+14)', () => {
    expect(process.env.TZ).toBe('Pacific/Kiritimati');
    // A recent instant: Kiritimati only moved to UTC+14 in 1995 (it was UTC-10:40 in 1970).
    expect(new Date('2026-10-06T12:00:00Z').getTimezoneOffset()).toBe(-14 * 60);
  });
});
