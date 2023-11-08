import {
  type Node,
  type Literal,
  type Identifier,
  type VariableDeclaration,
  type BlockStatement,
  type FunctionDeclaration,
  type CallExpression,
  type MemberExpression,
  type ArrayExpression,
  type IfStatement,
  type WhileStatement,
  type ForStatement,
  type DoWhileStatement,
  type SwitchCase,
  type SwitchStatement,
  type StructDeclaration,
  type UnaryExpression,
  type BinaryExpression,
  type TernaryExpression,
  type ReturnStatement,
  type ContinueStatement,
  type BreakStatement,
  type DiscardStatement,
} from './ast'
import { type Token, tokenize } from './tokenizer'

const isLiteral = (node: Node): node is Literal => (node as any).__brand === 'Literal'
const isIdentifier = (node: Node): node is Identifier => (node as any).__brand === 'Identifier'
const isVariableDeclaration = (node: Node): node is VariableDeclaration =>
  (node as any).__brand === 'VariableDeclaration'
const isBlockStatement = (node: Node): node is BlockStatement => (node as any).__brand === 'BlockStatement'
const isFunctionDeclaration = (node: Node): node is FunctionDeclaration =>
  (node as any).__brand === 'FunctionDeclaration'
const isCallExpression = (node: Node): node is CallExpression => (node as any).__brand === 'CallExpression'
const isMemberExpression = (node: Node): node is MemberExpression => (node as any).__brand === 'MemberExpression'
const isArrayExpression = (node: Node): node is ArrayExpression => (node as any).__brand === 'ArrayExpression'
const isIfStatement = (node: Node): node is IfStatement => (node as any).__brand === 'IfStatement'
const isWhileStatement = (node: Node): node is WhileStatement => (node as any).__brand === 'WhileStatement'
const isForStatement = (node: Node): node is ForStatement => (node as any).__brand === 'ForStatement'
const isDoWhileStatement = (node: Node): node is DoWhileStatement => (node as any).__brand === 'DoWhileStatement'
const isSwitchCase = (node: Node): node is SwitchCase => (node as any).__brand === 'SwitchCase'
const isSwitchStatement = (node: Node): node is SwitchStatement => (node as any).__brand === 'SwitchStatement'
const isStructDeclaration = (node: Node): node is StructDeclaration => (node as any).__brand === 'StructDeclaration'
const isUnaryExpression = (node: Node): node is UnaryExpression => (node as any).__brand === 'UnaryExpression'
const isBinaryExpression = (node: Node): node is BinaryExpression => (node as any).__brand === 'BinaryExpression'
const isTernaryExpression = (node: Node): node is TernaryExpression => (node as any).__brand === 'TernaryExpression'
const isReturnStatement = (node: Node): node is ReturnStatement => (node as any).__brand === 'ReturnStatement'
const isContinueStatement = (node: Node): node is ContinueStatement => (node as any).__brand === 'ContinueStatement'
const isBreakStatement = (node: Node): node is BreakStatement => (node as any).__brand === 'BreakStatement'
const isDiscardStatement = (node: Node): node is DiscardStatement => (node as any).__brand === 'DiscardStatement'

const isOpen = RegExp.prototype.test.bind(/^[\(\[\{]$/)
const isClose = RegExp.prototype.test.bind(/^[\)\]\}]$/)

function getScopeIndex(token: Token): number {
  if (isOpen(token.value)) return 1
  if (isClose(token.value)) return -1
  return 0
}

/**
 * Parses a string of GLSL or WGSL code into an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree).
 */
export function parse(code: string): Node[] {
  // TODO: preserve
  const tokens = tokenize(code).filter((token) => token.type !== 'whitespace' && token.type !== 'comment')
  let i = 0

  // TODO: this is GLSL-only, separate language constants
  const isType = RegExp.prototype.test.bind(/^(void|bool|float|u?int|[ui]?vec\d|mat\d(x\d)?)$/)
  const isStorage = RegExp.prototype.test.bind(/^(uniform|in|out|attribute|varying)$/)
  const isQualifier = RegExp.prototype.test.bind(/^(centroid|flat|smooth)$/)

  function getTokensUntil(value: string): Token[] {
    const output: Token[] = []
    let scopeIndex = 0

    while (i < tokens.length) {
      const token = tokens[i++]
      output.push(token)

      scopeIndex += getScopeIndex(token)
      if (scopeIndex === 0 && token.value === value) break
    }

    return output
  }

  function parseBlock<T extends BlockStatement>(node: T): T {
    if (tokens[i].value === '{') i++

    let scopeIndex = 0

    while (i < tokens.length) {
      const token = tokens[i++]

      scopeIndex += getScopeIndex(token)
      if (scopeIndex < 0) break // skip }

      let statement: Node | null = null

      if (token.type === 'keyword') {
        if (isQualifier(token.value) || isStorage(token.value) || isType(token.value) || token.value === 'const') {
          if (tokens[i + 2]?.value === '(') {
            const body = getTokensUntil('}')
            statement = { __brand: 'FunctionDeclaration', body }
          } else {
            const qualifiers: string[] = []
            while (tokens[i].type !== 'identifier') qualifiers.push(tokens[i++].value)
            const type = qualifiers.pop()!

            const body = getTokensUntil(';')
            const name = body.shift()!.value
            body.pop() // skip ;

            let value = null
            if (body.length) {
              // TODO: parse expression
            }

            statement = { __brand: 'VariableDeclaration', name, type, value, qualifiers } satisfies VariableDeclaration
          }
        } else if (token.value === 'return') {
          const body = getTokensUntil(';')
          statement = { __brand: 'ReturnStatement', body }
        } else if (token.value === 'if') {
          const body = getTokensUntil('}')
          statement = { __brand: 'IfStatement', body }
        } else if (token.value === 'for') {
          const body = getTokensUntil('}')
          statement = { __brand: 'ForStatement', body }
        }
      }

      if (statement) node.body.push(statement)
    }

    return node
  }

  const program: BlockStatement = { __brand: 'BlockStatement', body: [] }
  parseBlock(program)

  return program.body
}

const glsl = /* glsl */ `
  flat in mat4 test;

  if (true) {
    gl_FragColor = vec4(1, 0, 0, 1); // red
  }
`

console.log(parse(glsl))
