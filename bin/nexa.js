#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const Nexa = require('../nexa.js');

const args = process.argv.slice(2);
if (args[0] === 'ejecutar') args.shift();
const filename = args[0];
if (!filename || args.length > 1 || filename === '--help' || filename === '-h') {
  console.log('Nexa 0.1.0 — intérprete experimental');
  console.log('Uso: nexa <archivo.nx>');
  console.log('     nexa ejecutar <archivo.nx>');
  process.exit(filename ? 0 : 1);
}
if (path.extname(filename).toLowerCase() !== '.nx') {
  console.error('Error: los programas Nexa deben tener extensión .nx');
  process.exit(1);
}
try {
  const source = fs.readFileSync(filename, 'utf8');
  global.prompt = (question) => {
    process.stdout.write(`${question} `);
    const buffer = Buffer.alloc(8192);
    const bytes = fs.readSync(0, buffer, 0, buffer.length, null);
    return buffer.toString('utf8', 0, bytes).replace(/\r?\n$/, '');
  };
  const result = Nexa.run(source, { output: value => console.log(value) });
  if (process.env.NEXA_DEBUG === '1') {
    console.log('\nVariables:', result.variables);
    console.log('Instrucciones:', result.steps);
  }
} catch (error) {
  console.error(error.message || String(error));
  process.exitCode = 1;
}
