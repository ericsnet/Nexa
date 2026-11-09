const test = require('node:test');
const assert = require('node:assert/strict');
const Nexa = require('../nexa.js');

function execute(source) {
  const output = [];
  const result = Nexa.run(source, { output: value => output.push(value) });
  return { output, result };
}

test('muestra texto y concatena variables', () => {
  const { output } = execute('variable nombre = "Nexa"\nmostrar "Hola, " + nombre');
  assert.deepEqual(output, ['Hola, Nexa']);
});

test('admite declaración natural y compacta', () => {
  const { result } = execute('crear variable edad con valor 15\nvariable precio = 2');
  assert.deepEqual(result.variables, { edad: 15, precio: 2 });
});

test('evalúa operaciones respetando precedencia', () => {
  const { output } = execute('mostrar 2 + 3 * 4');
  assert.deepEqual(output, ['14']);
});

test('admite comparaciones naturales con y sin tilde', () => {
  const { output } = execute('variable X = 8\nvariable Y = 4\nsi X es más grande que Y haz:\n mostrar "correcto"\nfin');
  assert.deepEqual(output, ['correcto']);
});

test('admite condición compacta y alternativa', () => {
  const { output } = execute('variable edad = 12\nsi (edad >= 18):\n mostrar "adulto"\nsi no:\n mostrar "menor"\nfin');
  assert.deepEqual(output, ['menor']);
});

test('ejecuta repetir y mientras', () => {
  const { output } = execute('repetir 2 veces:\n mostrar "x"\nfin\nvariable i = 0\nmientras i es menor que 2 haz:\n mostrar i\n i = i + 1\nfin');
  assert.deepEqual(output, ['x', 'x', '0', '1']);
});

test('detecta división entre cero', () => {
  assert.throws(() => execute('mostrar 10 / 0'), /dividir entre cero/);
});

test('detecta variables no declaradas', () => {
  assert.throws(() => execute('mostrar fantasma'), /no existe/);
});
