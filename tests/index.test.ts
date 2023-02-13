import { describe, it, expect } from 'vitest'
import { tokenize, minify } from 'glsl-tools'

const glsl = /* glsl */ `#version 300 es
  precision mediump float;

  // single line

  /*
    multiline
  */

  #ifdef TEST
    const bool isTest = true;
  #endif

  uniform sampler2D map;
  out vec4 pc_FragColor;

  void main() {
    pc_FragColor = vec4(texture(map).rgb, 0.0);
    pc_FragColor.a += 1.0;
  }
`

describe('tokenize', () => {
  it('can tokenize GLSL ES 3.00', () => {
    expect(tokenize(glsl)).toMatchSnapshot()
  })
})

describe('minify', () => {
  it('can minify GLSL ES 3.00', () => {
    expect(minify(glsl)).toMatchSnapshot()
  })
})
