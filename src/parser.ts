import {
  type AST,
  Type,
  Identifier,
  Literal,
  CallExpression,
  UnaryExpression,
  MemberExpression,
  TernaryExpression,
  BinaryExpression,
  BlockStatement,
  FunctionDeclaration,
  VariableDeclaration,
  VariableDeclarator,
  ContinueStatement,
  BreakStatement,
  DiscardStatement,
  ReturnStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  DoWhileStatement,
  SwitchStatement,
  SwitchCase,
  StructDeclaration,
  PrecisionStatement,
  ArrayExpression,
  PreprocessorStatement,
} from './ast'
import { type Token, tokenize } from './tokenizer'

// TODO: this is GLSL-only, separate language constants
const TYPE_REGEX = /^(void|bool|float|u?int|[uib]?vec\d|mat\d(x\d)?)$/
const QUALIFIER_REGEX = /^(const|uniform|in|out|inout|centroid|flat|smooth|invariant|lowp|mediump|highp)$/
const VARIABLE_REGEX = new RegExp(`${TYPE_REGEX.source}|${QUALIFIER_REGEX.source}|layout`)

const isDeclaration = RegExp.prototype.test.bind(VARIABLE_REGEX)

const isOpen = RegExp.prototype.test.bind(/^[\(\[\{]$/)
const isClose = RegExp.prototype.test.bind(/^[\)\]\}]$/)

function getScopeDelta(token: Token): number {
  if (isOpen(token.value)) return 1
  if (isClose(token.value)) return -1
  return 0
}

let tokens: Token[] = []
let i: number = 0

function readUntil(value: string, body: Token[], offset: number = 0): Token[] {
  const output: Token[] = []
  let scopeIndex = 0

  while (offset < body.length) {
    const token = body[offset++]
    output.push(token)

    scopeIndex += getScopeDelta(token)
    if (scopeIndex === 0 && token.value === value) break
  }

  return output
}

function consumeUntil(value: string): Token[] {
  const output = readUntil(value, tokens, i)
  i += output.length
  return output
}

// https://engineering.desmos.com/articles/pratt-parser
// https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html

type Expression =
  | Literal
  | Identifier
  | UnaryExpression
  | BinaryExpression
  | TernaryExpression
  | CallExpression
  | MemberExpression
  | ArrayExpression

// TODO: complete precedence tables

const PREFIX_BINDING_POWERS: Record<string, [left: null, right: number]> = {
  '+': [null, 9],
  '-': [null, 9],
  '~': [null, 9],
  '!': [null, 9],
} as const

const POSTFIX_BINDING_POWERS: Record<string, [left: number, right: null]> = {
  '[': [11, null],
  '(': [11, null],
  '.': [11, null],
  '++': [11, null],
  '--': [11, null],
} as const

const INFIX_BINDING_POWERS: Record<string, [left: number, right: number]> = {
  '==': [2, 1],
  '?': [4, 3],
  '+': [5, 6],
  '-': [5, 6],
  '*': [7, 8],
  '/': [7, 8],
  '<': [14, 13],
  '>': [14, 13],
} as const

function advance(tokens: Token[], expected?: string): Token {
  const token = tokens.shift()

  if (token === undefined && expected !== undefined) {
    throw new SyntaxError(`Expected "${expected}"`)
  } else if (token === undefined) {
    throw new SyntaxError('Unexpected end of input')
  } else if (expected !== undefined && token.value !== expected) {
    throw new SyntaxError(`Expected "${expected}" got "${token.value}"`)
  }

  return token
}

function parseExpression(tokens: Token[], minBindingPower: number = 0): Expression | null {
  if (tokens.length === 0) return null

  let token = advance(tokens)

  let lhs: Expression
  if (token.type === 'identifier' || token.type === 'keyword') {
    lhs = new Identifier(token.value)
  } else if (token.type === 'bool' || token.type === 'float' || token.type === 'int') {
    lhs = new Literal(token.value)
  } else if (token.type === 'symbol' && token.value === '(') {
    lhs = parseExpression(tokens, 0)!
    advance(tokens, ')')
  } else if (token.type === 'symbol' && token.value in PREFIX_BINDING_POWERS) {
    const [_, rightBindingPower] = PREFIX_BINDING_POWERS[token.value]
    const rhs = parseExpression(tokens, rightBindingPower)!
    lhs = new UnaryExpression(token.value, null, rhs)
  } else {
    throw new SyntaxError(`Unexpected token: "${token.value}"`)
  }

  while (tokens.length) {
    token = tokens[0]

    const bindingPower = POSTFIX_BINDING_POWERS[token.value] || INFIX_BINDING_POWERS[token.value]
    if (!bindingPower) break

    const [leftBindingPower, rightBindingPower] = bindingPower
    if (leftBindingPower < minBindingPower) break

    advance(tokens)

    if (rightBindingPower === null) {
      if (token.value === '(') {
        const args: AST[] = []

        while (tokens[0]?.value !== ')') {
          args.push(parseExpression(tokens, 0)!)
          if (tokens[0]?.value !== ')') advance(tokens, ',')
        }
        advance(tokens, ')')

        if (lhs instanceof MemberExpression) {
          const type = new Type((lhs.object as Identifier).value, [lhs.property as Literal])
          lhs = new ArrayExpression(type, args)
        } else {
          lhs = new CallExpression(lhs, args)
        }
      } else if (token.value === '[') {
        const rhs = parseExpression(tokens, 0)!
        advance(tokens, ']')
        lhs = new MemberExpression(lhs, rhs)
      } else if (token.value === '.') {
        const rhs = parseExpression(tokens, 0)!
        lhs = new MemberExpression(lhs, rhs)
      } else {
        lhs = new UnaryExpression(token.value, lhs, null)
      }
    } else {
      if (token.value === '?') {
        const mhs = parseExpression(tokens, 0)!
        advance(tokens, ':')
        const rhs = parseExpression(tokens, rightBindingPower)!
        lhs = new TernaryExpression(lhs, mhs, rhs)
      } else {
        const rhs = parseExpression(tokens, rightBindingPower)!
        lhs = new BinaryExpression(token.value, lhs, rhs)
      }
    }
  }

  return lhs
}

function parseVariable(
  qualifiers: string[] = [],
  layout: Record<string, string | boolean> | null = null,
): VariableDeclaration {
  i-- // TODO: remove backtrack hack

  const kind = null // TODO: WGSL
  const type = new Type(tokens[i++].value, null)

  const declarations: VariableDeclarator[] = []

  const body = consumeUntil(';')
  let j = 0

  while (j < body.length) {
    const name = body[j++].value

    let prefix: AST | null = null
    if (body[j].value === '[') {
      j++ // skip [
      prefix = new ArrayExpression(new Type(type.name, [parseExpression([body[j++]]) as any]), [])
      j++ // skip ]
    }

    let value: AST | null = null

    const delimiter = body[j++]
    if (delimiter?.value === '=') {
      const right = readUntil(',', body, j)
      j += right.length

      value = parseExpression(right.slice(0, -1))
    }

    declarations.push(new VariableDeclarator(name, value ?? prefix))
  }

  return new VariableDeclaration(layout, qualifiers, kind, type, declarations)
}

function parseFunction(qualifiers: string[]): FunctionDeclaration {
  i-- // TODO: remove backtrack hack

  const type = new Type(tokens[i++].value, null)
  const name = tokens[i++].value
  const args: VariableDeclaration[] = []

  // TODO: merge with parseVariable
  const header = consumeUntil(')').slice(1, -1)
  let j = 0
  while (j < header.length) {
    const qualifiers: string[] = []
    while (header[j] && header[j].type !== 'identifier') {
      qualifiers.push(header[j++].value)
    }
    const type = new Type(qualifiers.pop()!, null)

    const line = readUntil(',', header, j)
    j += line.length

    const name = line.shift()!.value

    let prefix: AST | null = null
    if (line[0]?.value === '[') {
      line.shift() // skip [
      prefix = new ArrayExpression(new Type(type.name, [parseExpression([line.shift()!]) as any]), [])
      line.shift() // skip ]
    }

    if (line[line.length - 1]?.value === ',') line.pop() // skip ,

    const value = parseExpression(line) ?? prefix

    const declarations: VariableDeclarator[] = [new VariableDeclarator(name, value)]

    args.push(new VariableDeclaration(null, qualifiers, null, type, declarations))
  }

  let body = null
  if (tokens[i].value === ';') i++ // skip ;
  else body = parseBlock()

  return new FunctionDeclaration(name, type, qualifiers, args, body)
}

function parseIndeterminate(): VariableDeclaration | FunctionDeclaration {
  i-- // TODO: remove backtrack hack

  let layout: Record<string, string | boolean> | null = null
  if (tokens[i].value === 'layout') {
    i++ // skip layout

    layout = {}

    let key: string | null = null
    while (tokens[i] && tokens[i].value !== ')') {
      const token = tokens[i++]

      if (token.value === ',') key = null
      if (token.type === 'symbol') continue

      if (!key) {
        key = token.value
        layout[key] = true
      } else {
        layout[key] = token.value
      }
    }

    i++ // skip )
  }

  const qualifiers: string[] = []
  while (tokens[i] && QUALIFIER_REGEX.test(tokens[i].value)) {
    qualifiers.push(tokens[i++].value)
  }
  i++

  return tokens[i + 1]?.value === '(' ? parseFunction(qualifiers) : parseVariable(qualifiers, layout)
}

function parseStruct(): StructDeclaration {
  const name = tokens[i++].value
  i++ // skip {
  const members: VariableDeclaration[] = []
  while (tokens[i] && tokens[i].value !== '}') {
    i++ // TODO: remove backtrack hack
    members.push(parseIndeterminate() as VariableDeclaration)
  }
  i++ // skip }
  i++ // skip ;

  return new StructDeclaration(name, members)
}

function parseReturn(): ReturnStatement {
  const body = consumeUntil(';')
  body.pop() // skip ;

  const argument = parseExpression(body)

  return new ReturnStatement(argument as any)
}

function parseIf(): IfStatement {
  const test = parseExpression(consumeUntil(')'))!
  const consequent = parseBlock()

  let alternate = null
  if (tokens[i].value === 'else') {
    i++ // TODO: remove backtrack hack

    if (tokens[i].value === 'if') {
      i++
      alternate = parseIf()
    } else {
      alternate = parseBlock()
    }
  }

  return new IfStatement(test, consequent, alternate)
}

function parseWhile(): WhileStatement {
  const test = parseExpression(consumeUntil(')'))!
  const body = parseBlock()

  return new WhileStatement(test, body)
}

function parseFor(): ForStatement {
  const delimiterIndex = i + (readUntil(')', tokens, i).length - 1)

  i++ // skip (
  i++ // TODO: remove backtrack hack

  const init = parseVariable()
  const test = parseExpression(consumeUntil(';').slice(0, -1))
  const update = parseExpression(tokens.slice(i, delimiterIndex))

  i = delimiterIndex
  i++ // skip )

  const body = parseBlock()

  return new ForStatement(init, test, update, body)
}

function parseDoWhile(): DoWhileStatement {
  const body = parseBlock()
  i++ // skip while
  const test = parseExpression(consumeUntil(')'))!
  i++ // skip ;

  return new DoWhileStatement(test, body)
}

function parseSwitch(): SwitchStatement {
  const discriminant = parseExpression(consumeUntil(')'))
  const delimiterIndex = i + readUntil('}', tokens, i).length - 1

  const cases: SwitchCase[] = []
  while (i < delimiterIndex) {
    const token = tokens[i++]

    if (token.value === 'case') {
      const test = parseExpression(consumeUntil(':').slice(0, -1))
      const consequent = parseStatements()
      cases.push(new SwitchCase(test, consequent))
    } else if (token.value === 'default') {
      i++ // skip :
      const consequent = parseStatements()
      cases.push(new SwitchCase(null, consequent))
    }
  }

  return new SwitchStatement(discriminant!, cases)
}

function parsePrecision(): PrecisionStatement {
  const precision = tokens[i++].value
  const type = new Type(tokens[i++].value, null)
  i++ // skip ;
  return new PrecisionStatement(precision as any, type)
}

function parsePreprocessor(): PreprocessorStatement {
  const name = tokens[i++].value

  const body = consumeUntil('\\').slice(0, -1)
  let value: AST[] | null = null

  if (name !== 'else' && name !== 'endif') {
    value = []

    if (name === 'define') {
      const left = parseExpression([body.shift()!])!
      const right = parseExpression(body)!
      value.push(left, right)
    } else if (name === 'extension') {
      const left = parseExpression([body.shift()!])!
      body.shift() // skip :
      const right = parseExpression(body)!
      value.push(left, right)
    } else if (name === 'include') {
      value.push(parseExpression(body.slice(1, -1))!)
    } else {
      value.push(parseExpression(body)!)
    }
  }

  return new PreprocessorStatement(name, value)
}

function parseStatements(): AST[] {
  const body: AST[] = []
  let scopeIndex = 0

  while (i < tokens.length) {
    const token = tokens[i++]

    scopeIndex += getScopeDelta(token)
    if (scopeIndex < 0) break

    let statement: AST | null = null

    if (token.value === '#') {
      statement = parsePreprocessor()
    } else if (token.type === 'keyword') {
      if (token.value === 'case' || token.value === 'default') {
        i--
        break
      } else if (token.value === 'struct') statement = parseStruct()
      else if (token.value === 'continue') (statement = new ContinueStatement()), i++
      else if (token.value === 'break') (statement = new BreakStatement()), i++
      else if (token.value === 'discard') (statement = new DiscardStatement()), i++
      else if (token.value === 'return') statement = parseReturn()
      else if (token.value === 'if') statement = parseIf()
      else if (token.value === 'while') statement = parseWhile()
      else if (token.value === 'for') statement = parseFor()
      else if (token.value === 'do') statement = parseDoWhile()
      else if (token.value === 'switch') statement = parseSwitch()
      else if (token.value === 'precision') statement = parsePrecision()
      else if (isDeclaration(token.value) && tokens[i].value !== '[') statement = parseIndeterminate()
    }

    if (statement) {
      body.push(statement)
    } else {
      const line = [token, ...consumeUntil(';')]
      if (line[line.length - 1].value === ';') line.pop()
      const expression = parseExpression(line)
      if (expression) body.push(expression)
    }
  }

  return body
}

function parseBlock(): BlockStatement {
  i++ // skip {
  const body = parseStatements()
  return new BlockStatement(body)
}

const DIRECTIVE_REGEX = /(^\s*#[^\\]*?)(\n|\/[\/\*])/gm

/**
 * Parses a string of GLSL (WGSL WIP) code into an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree).
 */
export function parse(code: string): AST[] {
  // Remove (implicit) version header
  code = code.replace('#version 300 es', '')

  // Escape newlines after directives, skip comments
  code = code.replace(DIRECTIVE_REGEX, '$1\\$2')

  // TODO: preserve
  tokens = tokenize(code).filter((token) => token.type !== 'whitespace' && token.type !== 'comment')
  i = 0

  return parseStatements()
}
