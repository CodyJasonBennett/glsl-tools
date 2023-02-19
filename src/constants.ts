// https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf
// NOTE: restrictions from 5.25-5.26 apply https://registry.khronos.org/webgl/specs/latest/2.0
export const GLSL_KEYWORDS = [
  // 3.8 Keywords
  'const',
  'uniform',
  'layout',
  'centroid',
  'flat',
  'smooth',
  'break',
  'continue',
  'do',
  'for',
  'while',
  'switch',
  'case',
  'default',
  'if',
  'else',
  'in',
  'out',
  'inout',
  'float',
  'int',
  'void',
  'bool',
  'true',
  'false',
  'invariant',
  'discard',
  'return',
  'mat2',
  'mat3',
  'mat4',
  'mat2x2',
  'mat2x3',
  'mat2x4',
  'mat3x2',
  'mat3x3',
  'mat3x4',
  'mat4x2',
  'mat4x3',
  'mat4x4',
  'vec2',
  'vec3',
  'vec4',
  'ivec2',
  'ivec3',
  'ivec4',
  'bvec2',
  'bvec3',
  'bvec4',
  'uint',
  'uvec2',
  'uvec3',
  'uvec4',
  'lowp',
  'mediump',
  'highp',
  'precision',
  'sampler2D',
  'sampler3D',
  'samplerCube',
  'sampler2DShadow',
  'samplerCubeShadow',
  'sampler2DArray',
  'sampler2DArrayShadow',
  'isampler2D',
  'isampler3D',
  'isamplerCube',
  'isampler2DArray',
  'usampler2D',
  'usampler3D',
  'usamplerCube',
  'usampler2DArray',
  'struct',

  // 3.8 Keywords - Reserved for future use
  'attribute',
  'varying',
  'coherent',
  'volatile',
  'restrict',
  'readonly',
  'writeonly',
  'resource',
  'atomic_uint',
  'noperspective',
  'patch',
  'sample',
  'subroutine',
  'common',
  'partition',
  'active',
  'asm',
  'class',
  'union',
  'enum',
  'typedef',
  'template',
  'this',
  'goto',
  'inline',
  'noinline',
  'volatile',
  'public',
  'static',
  'extern',
  'external',
  'interface',
  'long',
  'short',
  'double',
  'half',
  'fixed',
  'unsigned',
  'superp',
  'input',
  'output',
  'hvec2',
  'hvec3',
  'hvec4',
  'dvec2',
  'dvec3',
  'dvec4',
  'fvec2',
  'fvec3',
  'fvec4',
  'sampler3DRect',
  'filter',
  'image1D',
  'image2D',
  'image3D',
  'imageCube',
  'iimage1D',
  'iimage2D',
  'iimage3D',
  'iimageCube',
  'uimage1D',
  'uimage2D',
  'uimage3D',
  'uimageCube',
  'image1DArray',
  'image2DArray',
  'iimage1DArray',
  'iimage2DArray',
  'uimage1DArray',
  'uimage2DArray',
  'imageBuffer',
  'iimageBuffer',
  'uimageBuffer',
  'sampler1D',
  'sampler1DShadow',
  'sampler1DArray',
  'sampler1DArrayShadow',
  'isampler1D',
  'isampler1DArray',
  'usampler1D',
  'usampler1DArray',
  'sampler2DRect',
  'sampler2DRectShadow',
  'isampler2DRect',
  'usampler2DRect',
  'samplerBuffer',
  'isamplerBuffer',
  'usamplerBuffer',
  'sampler2DMS',
  'isampler2DMS',
  'usampler2DMS',
  'sampler2DMSArray',
  'isampler2DMSArray',
  'usampler2DMSArray',
  'sizeof',
  'cast',
  'namespace',
  'using',

  // 3.5 Preprocessor
  '#define',
  '#undef',
  '#if',
  '#ifdef',
  '#ifndef',
  '#else',
  '#elif',
  '#endif',
  '#error',
  '#pragma',
  '#extension',
  '#version',
  '#line',

  // 3.5 Preprocessor - Operators
  'defined',

  // 3.5 Preprocessor - Macros
  '__LINE__',
  '__FILE__',
  '__VERSION__',
  'GL_ES',

  // 7.1 Vertex Shader Special Variables
  'gl_VertexID',
  'gl_InstanceID',
  'gl_Position',
  'gl_PointSize',

  // 7.2 Fragment Shader Special Variables
  'gl_FragCoord',
  'gl_FrontFacing',
  'gl_FragDepth',
  'gl_PointCoord',

  // 7.3 Built-in Constants
  'gl_MaxVertexAttribs',
  'gl_MaxVertexUniformVectors',
  'gl_MaxVertexOutputVectors',
  'gl_MaxFragmentInputVectors',
  'gl_MaxVertexTextureImageUnits',
  'gl_MaxCombinedTextureImageUnits',
  'gl_MaxTextureImageUnits',
  'gl_MaxFragmentUniformVectors',
  'gl_MaxDrawBuffers',
  'gl_MinProgramTexelOffset',
  'gl_MaxProgramTexelOffset',

  // 7.4 Built-in Uniform State
  'gl_DepthRangeParameters',
  'gl_DepthRange',

  // 8.1 Angle and Trigonometry Functions
  'radians',
  'degrees',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sinh',
  'cosh',
  'tanh',
  'asinh',
  'acosh',
  'atanh',

  // 8.2 Exponential Functions
  'pow',
  'exp',
  'log',
  'exp2',
  'log2',
  'sqrt',
  'inversesqrt',

  // 8.3 Common Functions
  'abs',
  'sign',
  'floor',
  'trunc',
  'round',
  'roundEven',
  'ceil',
  'fract',
  'mod',
  'modf',
  'min',
  'max',
  'clamp',
  'mix',
  'step',
  'smoothstep',
  'isnan',
  'isinf',
  'floatBitsToInt',
  'floatBitsToUint',
  'intBitsToFloat',
  'uintBitsToFloat',

  // 8.4 Floating-Point Pack and Unpack Functions
  'packSnorm2x16',
  'unpackSnorm2x16',
  'packUnorm2x16',
  'unpackUnorm2x16',
  'packHalf2x16',
  'unpackHalf2x16',

  // 8.5 Geometric Functions
  'length',
  'distance',
  'dot',
  'cross',
  'normalize',
  'faceforward',
  'reflect',
  'refract',
  'matrixCompMult',
  'outerProduct',
  'transpose',
  'determinant',
  'inverse',

  // 8.7 Vector Relational Functions
  'lessThan',
  'lessThanEqual',
  'greaterThan',
  'greaterThanEqual',
  'equal',
  'notEqual',
  'any',
  'all',
  'not',

  // 8.8 Texture Lookup Functions
  'textureSize',
  'texture',
  'textureProj',
  'textureLod',
  'textureOffset',
  'texelFetch',
  'texelFetchOffset',
  'textureProjOffset',
  'textureLodOffset',
  'textureProjLod',
  'textureProjLodOffset',
  'textureGrad',
  'textureGradOffset',
  'textureProjGrad',
  'textureProjGradOffset',

  // 8.9 Fragment Processing Functions
  'dFdx',
  'dFdy',
  'fwidth',

  // Additional directives
  '#include',

  // WEBGL_multi_draw https://registry.khronos.org/webgl/extensions/WEBGL_multi_draw
  'gl_DrawID', // vertex only

  // OVR_multiview2 https://registry.khronos.org/webgl/extensions/OVR_multiview2
  // OCULUS_multiview https://github.com/KhronosGroup/WebGL/issues/2912
  'gl_ViewID_OVR',
  'GL_OVR_multiview2',
]

// 3.2 Character Set, 5.1 Operators
export const GLSL_SYMBOLS = [
  // Preprocessor
  '#',

  // Line continuation
  '\\',

  // Comments
  '//',
  '/*',
  '*/',

  // Punctuation
  '.',
  ',',
  ';',
  '{',
  '}',
  '(',
  ')',
  '[',
  ']',

  // Comparison
  '?',
  ':',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',

  // Modifier
  '~',
  '=',
  '!',
  '+',
  '-',
  '/',
  '&',
  '|',
  '^',
  '%',
  '<<',
  '>>',

  // Operators
  '++',
  '--',
  '==',
  '!=',
  '+=',
  '-=',
  '/=',
  '&=',
  '|=',
  '^=',
  '%=',
  '<<=',
  '>>=',
]
