import React from 'react';
import { SupportedLanguage } from '../types';

export interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'type' | 'function' | 'operator' | 'punctuation' | 'plain';
  value: string;
}

// Language-specific keyword tables
const KEYWORDS_BY_LANG: Record<string, Set<string>> = {
  python: new Set([
    'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'while', 'for', 'in',
    'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'None', 'True', 'False',
    'self', 'is', 'not', 'and', 'or', 'pass', 'break', 'continue', 'raise', 'async', 'await', 'assert'
  ]),
  javascript: new Set([
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'switch', 'case',
    'default', 'class', 'extends', 'import', 'export', 'from', 'async', 'await', 'new', 'this',
    'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'null', 'undefined', 'true', 'false', 'of'
  ]),
  typescript: new Set([
    'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while', 'switch', 'case',
    'default', 'class', 'extends', 'import', 'export', 'from', 'async', 'await', 'new', 'this',
    'typeof', 'instanceof', 'try', 'catch', 'finally', 'throw', 'null', 'undefined', 'true', 'false',
    'interface', 'type', 'implements', 'enum', 'readonly', 'as', 'any', 'void'
  ]),
  cpp: new Set([
    'int', 'char', 'float', 'double', 'void', 'bool', 'auto', 'class', 'struct', 'public',
    'private', 'protected', 'template', 'typename', 'std', 'cout', 'cin', 'endl', 'new', 'delete',
    'return', 'if', 'else', 'for', 'while', 'nullptr', 'const', 'static', 'virtual', 'override',
    'constexpr', 'sizeof', 'namespace', 'using'
  ]),
  c: new Set([
    'int', 'char', 'float', 'double', 'void', 'struct', 'typedef', 'sizeof', 'return', 'if',
    'else', 'for', 'while', 'NULL', 'const', 'static', 'extern', 'switch', 'case', 'break', 'continue'
  ]),
  java: new Set([
    'public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'void', 'int',
    'boolean', 'char', 'double', 'float', 'long', 'String', 'new', 'return', 'if', 'else', 'for',
    'while', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'this', 'super',
    'null', 'true', 'false', 'System', 'out', 'println', 'print', 'override', 'enum'
  ]),
  rust: new Set([
    'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'match', 'if', 'else', 'for', 'while',
    'loop', 'return', 'use', 'mod', 'crate', 'self', 'Self', 'true', 'false', 'Option', 'Some',
    'None', 'Result', 'Ok', 'Err', 'String', 'println!', 'print!', 'i32', 'i64', 'u32', 'u64',
    'usize', 'bool', 'as', 'ref', 'where', 'move'
  ]),
  go: new Set([
    'package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface', 'return', 'if',
    'else', 'for', 'range', 'make', 'new', 'nil', 'true', 'false', 'string', 'int', 'int64',
    'bool', 'defer', 'go', 'select', 'chan', 'fmt', 'Println', 'Printf', 'Error', 'nil'
  ]),
  php: new Set([
    'function', 'class', 'public', 'private', 'protected', 'return', 'if', 'else', 'elseif',
    'foreach', 'for', 'while', 'new', 'echo', 'print', 'null', 'true', 'false', 'try', 'catch',
    'finally', 'throw', 'use', 'namespace', 'PDO', 'array', 'static', 'var'
  ]),
  sql: new Set([
    'select', 'from', 'where', 'insert', 'into', 'update', 'delete', 'join', 'inner', 'left',
    'right', 'outer', 'on', 'group', 'by', 'having', 'order', 'asc', 'desc', 'limit', 'create',
    'table', 'primary', 'key', 'foreign', 'references', 'and', 'or', 'not', 'null', 'values',
    'set', 'drop', 'alter', 'as', 'distinct', 'count', 'sum', 'avg', 'like', 'in', 'between'
  ]),
  ruby: new Set([
    'def', 'end', 'class', 'module', 'return', 'if', 'elsif', 'else', 'unless', 'while',
    'until', 'do', 'yield', 'puts', 'nil', 'true', 'false', 'require', 'attr_accessor', 'attr_reader'
  ]),
  swift: new Set([
    'func', 'var', 'let', 'class', 'struct', 'enum', 'import', 'return', 'if', 'else', 'guard',
    'for', 'in', 'switch', 'case', 'nil', 'true', 'false', 'print', 'init', 'self', 'override',
    'public', 'private', 'mutating'
  ]),
  html: new Set([
    'html', 'head', 'body', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'a', 'button', 'input', 'form',
    'script', 'style', 'link', 'meta', 'title', 'section', 'header', 'footer', 'main', 'nav'
  ]),
};

const TYPES_BY_LANG: Record<string, Set<string>> = {
  python: new Set(['int', 'str', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'Optional', 'Union', 'Any']),
  javascript: new Set(['Array', 'Object', 'Function', 'Promise', 'Map', 'Set', 'JSON', 'Math', 'console']),
  typescript: new Set(['Array', 'Object', 'Function', 'Promise', 'Map', 'Set', 'Record', 'Partial', 'string', 'number', 'boolean', 'any', 'void']),
  cpp: new Set(['vector', 'string', 'map', 'set', 'unordered_map', 'pair', 'size_t', 'unique_ptr', 'shared_ptr']),
  c: new Set(['size_t', 'ssize_t', 'uint32_t', 'int32_t', 'uint8_t', 'FILE']),
  java: new Set(['ArrayList', 'HashMap', 'HashSet', 'List', 'Map', 'Set', 'Integer', 'Double', 'Boolean', 'Thread', 'Exception']),
  rust: new Set(['Vec', 'HashMap', 'HashSet', 'Box', 'Rc', 'Arc', 'Mutex', 'RefCell', 'str', 'char']),
  go: new Set(['byte', 'rune', 'error', 'float32', 'float64', 'uint', 'uint64']),
  php: new Set(['PDOException', 'Exception', 'DateTime', 'stdClass']),
  sql: new Set(['varchar', 'integer', 'int', 'bigint', 'boolean', 'timestamp', 'date', 'text', 'decimal', 'float']),
  ruby: new Set(['Array', 'Hash', 'String', 'Integer', 'Float', 'Symbol']),
  swift: new Set(['Array', 'Dictionary', 'String', 'Int', 'Double', 'Float', 'Bool']),
  html: new Set(['class', 'id', 'href', 'src', 'type', 'name', 'value', 'rel', 'placeholder']),
};

export function tokenizeCode(code: string, language: SupportedLanguage): Token[] {
  const langKey = language.toLowerCase();
  const keywords = KEYWORDS_BY_LANG[langKey] || KEYWORDS_BY_LANG.javascript;
  const types = TYPES_BY_LANG[langKey] || TYPES_BY_LANG.javascript;

  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    // 1. Comments
    // Python/Ruby/Shell style: #
    if ((langKey === 'python' || langKey === 'ruby') && code[i] === '#') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }
    // SQL style: --
    if (langKey === 'sql' && code[i] === '-' && code[i + 1] === '-') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }
    // C-style single-line: //
    if (code[i] === '/' && code[i + 1] === '/') {
      let end = code.indexOf('\n', i);
      if (end === -1) end = len;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }
    // C-style multi-line: /* ... */
    if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end === -1) end = len;
      else end += 2;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }
    // HTML comment: <!-- ... -->
    if (code.slice(i, i + 4) === '<!--') {
      let end = code.indexOf('-->', i + 4);
      if (end === -1) end = len;
      else end += 3;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 2. Python Triple Quotes """ or '''
    if (langKey === 'python' && (code.slice(i, i + 3) === '"""' || code.slice(i, i + 3) === "'''")) {
      const quote = code.slice(i, i + 3);
      let end = code.indexOf(quote, i + 3);
      if (end === -1) end = len;
      else end += 3;
      tokens.push({ type: 'string', value: code.slice(i, end) });
      i = end;
      continue;
    }

    // 3. Strings: ", ', `
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      let j = i + 1;
      let escaped = false;
      while (j < len) {
        if (!escaped && code[j] === quote) {
          j++;
          break;
        }
        if (code[j] === '\\') {
          escaped = !escaped;
        } else {
          escaped = false;
        }
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // 4. Preprocessor directives in C/C++ (#include, #define)
    if ((langKey === 'cpp' || langKey === 'c') && code[i] === '#') {
      let j = i + 1;
      while (j < len && /[a-zA-Z_]/.test(code[j])) j++;
      tokens.push({ type: 'keyword', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // 5. Numbers (hex, float, int)
    if (/\d/.test(code[i]) || (code[i] === '.' && /\d/.test(code[i + 1] || ''))) {
      let j = i;
      if (code[j] === '0' && (code[j + 1] === 'x' || code[j + 1] === 'X')) {
        j += 2;
        while (j < len && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < len && /[0-9._eE]/.test(code[j])) j++;
      }
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }

    // 6. Word: Identifier, Keyword, Type, or Function
    if (/[a-zA-Z_$]/.test(code[i]) || (code[i] === '@')) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_$-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const lower = word.toLowerCase();

      // Check if followed by '(' -> function call
      let k = j;
      while (k < len && (code[k] === ' ' || code[k] === '\t')) k++;
      const isFunction = code[k] === '(';

      if (keywords.has(langKey === 'sql' ? lower : word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (types.has(word) || types.has(lower)) {
        tokens.push({ type: 'type', value: word });
      } else if (isFunction) {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    // 7. Operators & Punctuation
    if (/[+\-*/%=<>!&|^~?:;,.(){}\[\]]/.test(code[i])) {
      const ch = code[i];
      const isPunctuation = /[;,.(){}\[\]]/.test(ch);
      tokens.push({
        type: isPunctuation ? 'punctuation' : 'operator',
        value: ch,
      });
      i++;
      continue;
    }

    // 8. Whitespace / Newlines / Unrecognized
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }

  return tokens;
}

// Convert tokens into styled React spans
export function renderHighlightedCode(code: string, language: SupportedLanguage): React.ReactNode {
  const tokens = tokenizeCode(code, language);

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'keyword':
        return <span key={idx} className="text-purple-400 font-semibold">{token.value}</span>;
      case 'type':
        return <span key={idx} className="text-cyan-300 font-medium">{token.value}</span>;
      case 'string':
        return <span key={idx} className="text-emerald-300">{token.value}</span>;
      case 'comment':
        return <span key={idx} className="text-slate-500 italic">{token.value}</span>;
      case 'number':
        return <span key={idx} className="text-amber-400 font-mono">{token.value}</span>;
      case 'function':
        return <span key={idx} className="text-blue-300 font-medium">{token.value}</span>;
      case 'operator':
        return <span key={idx} className="text-pink-400">{token.value}</span>;
      case 'punctuation':
        return <span key={idx} className="text-slate-400">{token.value}</span>;
      default:
        return <span key={idx} className="text-slate-200">{token.value}</span>;
    }
  });
}
