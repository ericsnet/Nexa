/* Nexa 0.1 — intérprete experimental. Sin dependencias externas. */
(function (root) {
  'use strict';

  class NexaError extends Error {
    constructor(message, line) {
      super(line ? `Línea ${line}: ${message}` : message);
      this.name = 'NexaError';
      this.line = line || null;
    }
  }

  const fold = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const cleanLine = (line) => {
    let quote = null;
    let escaped = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (quote) { if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '#') return line.slice(0, i).trim();
    }
    return line.trim();
  };

  function normalizeNaturalExpression(source) {
    let s = source;
    const replacements = [
      [/\bes\s+mayor\s+o\s+igual\s+que\b/gi, ' >= '],
      [/\bes\s+mas\s+grande\s+o\s+igual\s+que\b/gi, ' >= '],
      [/\bes\s+menor\s+o\s+igual\s+que\b/gi, ' <= '],
      [/\bes\s+mas\s+pequeno\s+o\s+igual\s+que\b/gi, ' <= '],
      [/\bes\s+mas\s+grande\s+que\b/gi, ' > '],
      [/\bes\s+mayor\s+que\b/gi, ' > '],
      [/\bsupera\s+a\b/gi, ' > '],
      [/\bes\s+mas\s+pequeno\s+que\b/gi, ' < '],
      [/\bes\s+menor\s+que\b/gi, ' < '],
      [/\bes\s+igual\s+a\b/gi, ' == '],
      [/\bes\s+igual\s+que\b/gi, ' == '],
      [/\bes\s+distinto\s+de\b/gi, ' != '],
      [/\bes\s+diferente\s+de\b/gi, ' != '],
      [/\bes\s+mas\s+grande\b/gi, ' > '],
      [/\bes\s+mayor\b/gi, ' > '],
      [/\bes\s+menor\b/gi, ' < '],
      [/\bmas\b/gi, ' + '],
      [/\bmenos\b/gi, ' - '],
      [/\bpor\b/gi, ' * '],
      [/\bentre\b/gi, ' / '],
    ];
    const parts = s.match(/("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|([^"']+)/g) || [];
    return parts.map(part => {
      if (part.startsWith('"') || part.startsWith("'")) return part;
      let out = part.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      for (const [pattern, replacement] of replacements) out = out.replace(pattern, replacement);
      return out;
    }).join(' ');
  }

  function tokenize(source, line) {
    const text = normalizeNaturalExpression(source);
    const tokens = [];
    const re = /\s+|(?:\d+(?:\.\d+)?)|(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?:[A-Za-z_ÁÉÍÓÚÜÑáéíóúüñ][\wÁÉÍÓÚÜÑáéíóúüñ]*)|(?:>=|<=|==|!=|&&|\|\||\*\*|[()+\-*/%><!,])/gy;
    let pos = 0;
    while (pos < text.length) {
      re.lastIndex = pos;
      const match = re.exec(text);
      if (!match) throw new NexaError(`No entiendo esta expresión cerca de «${text.slice(pos, pos + 12)}».`, line);
      const raw = match[0];
      pos = re.lastIndex;
      if (/^\s+$/.test(raw)) continue;
      if (/^\d/.test(raw)) tokens.push({ type: 'number', value: Number(raw), raw });
      else if (raw[0] === '"' || raw[0] === "'") {
        const body = raw.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\([\\"'])/g, '$1');
        tokens.push({ type: 'string', value: body, raw });
      } else if (/^[A-Za-z_ÁÉÍÓÚÜÑáéíóúüñ]/.test(raw)) {
        const word = fold(raw);
        if (word === 'verdadero' || word === 'true') tokens.push({ type: 'literal', value: true, raw });
        else if (word === 'falso' || word === 'false') tokens.push({ type: 'literal', value: false, raw });
        else if (word === 'nulo' || word === 'null') tokens.push({ type: 'literal', value: null, raw });
        else if (word === 'no') tokens.push({ type: 'operator', value: '!', raw });
        else tokens.push({ type: 'identifier', value: raw, raw });
      } else if (raw === ',') tokens.push({ type: 'comma', value: raw, raw });
      else tokens.push({ type: 'operator', value: raw, raw });
    }
    tokens.push({ type: 'eof', value: '', raw: '' });
    return tokens;
  }

  class ExpressionParser {
    constructor(tokens, line) { this.tokens = tokens; this.index = 0; this.line = line; }
    current() { return this.tokens[this.index]; }
    take() { return this.tokens[this.index++]; }
    match(value) { if (this.current().value === value) { this.take(); return true; } return false; }
    expect(value) { if (!this.match(value)) throw new NexaError(`Se esperaba «${value}».`, this.line); }
    parse() {
      const expression = this.binary(0);
      if (this.current().type !== 'eof') throw new NexaError(`Elemento inesperado «${this.current().raw}».`, this.line);
      return expression;
    }
    binary(min) {
      let left = this.unary();
      const precedence = { '||': 1, '&&': 2, '==': 3, '!=': 3, '>': 4, '<': 4, '>=': 4, '<=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6, '**': 7 };
      while (this.current().type === 'operator' && (precedence[this.current().value] || 0) >= min && precedence[this.current().value]) {
        const op = this.take().value;
        const p = precedence[op];
        const right = this.binary(p + (op === '**' ? 0 : 1));
        left = { kind: 'binary', op, left, right };
      }
      return left;
    }
    unary() {
      if (this.match('!')) return { kind: 'unary', op: '!', value: this.unary() };
      if (this.match('-')) return { kind: 'unary', op: '-', value: this.unary() };
      if (this.match('+')) return { kind: 'unary', op: '+', value: this.unary() };
      return this.primary();
    }
    primary() {
      const token = this.take();
      if (token.type === 'number' || token.type === 'string' || token.type === 'literal') return { kind: 'literal', value: token.value };
      if (token.type === 'identifier') {
        if (this.match('(')) {
          const args = [];
          if (!this.match(')')) {
            do { args.push(this.binary(0)); } while (this.match(','));
            this.expect(')');
          }
          return { kind: 'call', name: fold(token.value), args };
        }
        return { kind: 'variable', name: token.value };
      }
      if (token.value === '(') {
        const value = this.binary(0);
        this.expect(')');
        return value;
      }
      throw new NexaError(`Se esperaba un valor, pero apareció «${token.raw || 'fin'}».`, this.line);
    }
  }

  function parseExpression(source, line) {
    return new ExpressionParser(tokenize(source, line), line).parse();
  }

  function evaluate(node, env, line) {
    if (node.kind === 'literal') return node.value;
    if (node.kind === 'variable') {
      if (!env.has(node.name)) throw new NexaError(`La variable «${node.name}» no existe.`, line);
      return env.get(node.name);
    }
    if (node.kind === 'call') {
      if (node.name === 'preguntar' || node.name === 'leer') {
        const promptText = node.args.length ? String(evaluate(node.args[0], env, line)) : 'Introduce un valor:';
        const answer = typeof root.prompt === 'function' ? root.prompt(promptText) : '';
        return answer === null ? '' : answer;
      }
      throw new NexaError(`La función «${node.name}» todavía no está disponible en Nexa 0.1.`, line);
    }
    if (node.kind === 'unary') {
      const value = evaluate(node.value, env, line);
      if (node.op === '!') return !value;
      if (node.op === '-') return -Number(value);
      return Number(value);
    }
    if (node.kind === 'binary') {
      const left = evaluate(node.left, env, line);
      if (node.op === '&&') return Boolean(left) && Boolean(evaluate(node.right, env, line));
      if (node.op === '||') return Boolean(left) || Boolean(evaluate(node.right, env, line));
      const right = evaluate(node.right, env, line);
      switch (node.op) {
        case '+': return typeof left === 'string' || typeof right === 'string' ? String(left) + String(right) : Number(left) + Number(right);
        case '-': return Number(left) - Number(right);
        case '*': return Number(left) * Number(right);
        case '/': if (Number(right) === 0) throw new NexaError('No se puede dividir entre cero.', line); return Number(left) / Number(right);
        case '%': if (Number(right) === 0) throw new NexaError('No se puede dividir entre cero.', line); return Number(left) % Number(right);
        case '**': return Number(left) ** Number(right);
        case '>': return left > right;
        case '<': return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '==': return left === right || (typeof left === 'number' && typeof right === 'number' && left === right);
        case '!=': return left !== right;
        default: throw new NexaError(`Operador no compatible: ${node.op}.`, line);
      }
    }
    throw new NexaError('Expresión no válida.', line);
  }

  function stripOuterParens(text) {
    let s = text.trim();
    if (!s.startsWith('(') || !s.endsWith(')')) return s;
    let depth = 0, quote = null, escaped = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (quote) { if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') { depth--; if (depth === 0 && i !== s.length - 1) return s; }
    }
    return depth === 0 ? s.slice(1, -1).trim() : s;
  }

  class NexaInterpreter {
    constructor(options = {}) {
      this.output = options.output || (() => {});
      this.maxSteps = options.maxSteps || 100000;
      this.steps = 0;
      this.env = new Map();
      this.lines = [];
      this.index = 0;
    }
    emit(value) { this.output(String(value)); }
    step(line) { this.steps++; if (this.steps > this.maxSteps) throw new NexaError('Se ha alcanzado el límite de seguridad de ejecución.', line); }
    peek() { return this.lines[this.index] || null; }
    next() { return this.lines[this.index++] || null; }
    parseBlock(stopAtElse = false) {
      const statements = [];
      while (this.index < this.lines.length) {
        const item = this.peek();
        const key = fold(item.text);
        if (key === 'fin' || (stopAtElse && /^(si\s+no|sino)(\s*:)?$/.test(key))) break;
        this.next();
        const text = item.text;
        if (!text) continue;
        const simple = fold(text);
        if (/^programa\s+/.test(simple)) continue;
        if (simple === 'si no:' || simple === 'sino:' || simple === 'si no' || simple === 'sino') {
          throw new NexaError('«si no» solo puede aparecer dentro de un bloque «si».', item.number);
        }
        let match;
        if ((match = text.match(/^si\s+(.+?)\s*(?:haz\s*)?:?$/i))) {
          let condition = match[1].trim();
          if (fold(condition).endsWith(' haz')) condition = condition.slice(0, -4).trim();
          condition = stripOuterParens(condition);
          const yes = this.parseBlock(true);
          let no = [];
          if (this.peek() && /^(si\s+no|sino)(\s*:)?$/i.test(this.peek().text)) { this.next(); no = this.parseBlock(false); }
          if (!this.peek() || fold(this.peek().text) !== 'fin') throw new NexaError('Falta «fin» para cerrar el bloque «si».', item.number);
          this.next();
          statements.push({ kind: 'if', condition: parseExpression(condition, item.number), yes, no, line: item.number });
          continue;
        }
        if ((match = text.match(/^repetir\s+(.+?)\s+veces\s*:?$/i)) || (match = text.match(/^repetir\s*\((.+)\)\s*:?$/i))) {
          const count = match[1].trim();
          const body = this.parseBlock(false);
          if (!this.peek() || fold(this.peek().text) !== 'fin') throw new NexaError('Falta «fin» para cerrar «repetir».', item.number);
          this.next();
          statements.push({ kind: 'repeat', count: parseExpression(count, item.number), body, line: item.number });
          continue;
        }
        if ((match = text.match(/^mientras\s+(.+?)\s*(?:haz\s*)?:?$/i))) {
          let condition = match[1].trim();
          if (fold(condition).endsWith(' haz')) condition = condition.slice(0, -4).trim();
          condition = stripOuterParens(condition);
          const body = this.parseBlock(false);
          if (!this.peek() || fold(this.peek().text) !== 'fin') throw new NexaError('Falta «fin» para cerrar «mientras».', item.number);
          this.next();
          statements.push({ kind: 'while', condition: parseExpression(condition, item.number), body, line: item.number });
          continue;
        }
        if ((match = text.match(/^preguntar\s+(.+?)\s+y\s+guardar\s+en\s+([\wÁÉÍÓÚÜÑáéíóúüñ_]+)\s*$/i))) {
          const promptExpr = parseExpression(match[1].trim(), item.number);
          statements.push({ kind: 'declare', name: match[2], value: { kind: 'call', name: 'preguntar', args: [promptExpr] }, line: item.number });
          continue;
        }
        if ((match = text.match(/^crear\s+variable\s+([\wÁÉÍÓÚÜÑáéíóúüñ_]+)\s+con\s+valor\s+(.+)$/i))) {
          statements.push({ kind: 'declare', name: match[1], value: parseExpression(match[2], item.number), line: item.number });
          continue;
        }
        if ((match = text.match(/^variable\s+([\wÁÉÍÓÚÜÑáéíóúüñ_]+)\s*=\s*(.+)$/i))) {
          statements.push({ kind: 'declare', name: match[1], value: parseExpression(match[2], item.number), line: item.number });
          continue;
        }
        if ((match = text.match(/^([\wÁÉÍÓÚÜÑáéíóúüñ_]+)\s*=\s*preguntar\s*\((.*)\)\s*$/i))) {
          statements.push({ kind: 'assign', name: match[1], value: { kind: 'call', name: 'preguntar', args: [parseExpression(match[2], item.number)] }, line: item.number });
          continue;
        }
        if ((match = text.match(/^([\wÁÉÍÓÚÜÑáéíóúüñ_]+)\s*=\s*(.+)$/))) {
          statements.push({ kind: 'assign', name: match[1], value: parseExpression(match[2], item.number), line: item.number });
          continue;
        }
        if ((match = text.match(/^(mostrar|escribir|imprimir)\s+(.+)$/i))) {
          statements.push({ kind: 'print', value: parseExpression(match[2], item.number), line: item.number });
          continue;
        }
        if ((match = text.match(/^(mostrar|escribir|imprimir)\s*\((.*)\)\s*$/i))) {
          statements.push({ kind: 'print', value: parseExpression(match[2], item.number), line: item.number });
          continue;
        }
        throw new NexaError(`No reconozco la instrucción «${text}».`, item.number);
      }
      return statements;
    }
    executeStatements(statements) {
      for (const statement of statements) {
        this.step(statement.line);
        switch (statement.kind) {
          case 'print': this.emit(evaluate(statement.value, this.env, statement.line)); break;
          case 'declare': this.env.set(statement.name, evaluate(statement.value, this.env, statement.line)); break;
          case 'assign':
            if (!this.env.has(statement.name)) throw new NexaError(`No puedes cambiar «${statement.name}» porque todavía no existe. Declárala primero.`, statement.line);
            this.env.set(statement.name, evaluate(statement.value, this.env, statement.line));
            break;
          case 'if': this.executeStatements(evaluate(statement.condition, this.env, statement.line) ? statement.yes : statement.no); break;
          case 'repeat': {
            const count = Number(evaluate(statement.count, this.env, statement.line));
            if (!Number.isInteger(count) || count < 0 || count > 10000) throw new NexaError('La repetición necesita un número entero entre 0 y 10000.', statement.line);
            for (let i = 0; i < count; i++) this.executeStatements(statement.body);
            break;
          }
          case 'while': {
            let turns = 0;
            while (evaluate(statement.condition, this.env, statement.line)) {
              if (++turns > 10000) throw new NexaError('El bucle «mientras» superó las 10000 iteraciones.', statement.line);
              this.executeStatements(statement.body);
            }
            break;
          }
        }
      }
    }
    run(source) {
      this.env = new Map(); this.steps = 0; this.index = 0;
      this.lines = String(source).split(/\r?\n/).map((raw, i) => ({ text: cleanLine(raw), number: i + 1 })).filter(x => x.text.length > 0);
      const ast = this.parseBlock(false);
      if (this.index < this.lines.length) throw new NexaError('Hay una instrucción sin cerrar.', this.lines[this.index].number);
      this.executeStatements(ast);
      return { variables: Object.fromEntries(this.env), steps: this.steps };
    }
  }

  function run(source, options = {}) {
    const interpreter = new NexaInterpreter(options);
    return interpreter.run(source);
  }

  root.Nexa = { run, NexaInterpreter, NexaError, version: '0.1.0' };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Nexa;
})(typeof globalThis !== 'undefined' ? globalThis : window);
