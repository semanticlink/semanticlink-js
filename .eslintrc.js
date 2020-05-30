module.exports = {
    root: true,

    env: {
        browser: true,
        es6: true,
        node: false,
        jest: true,
    },

    extends: [
        // see https://github.com/standard/eslint-config-standard/blob/master/eslintrc.json
        'plugin:@typescript-eslint/recommended',
    ],

    rules: {

        // see https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        // '@typescript-eslint/explicit-function-return-type': "off",
        '@typescript-eslint/explicit-function-return-type': [
            0,
            {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
            },
        ],
        '@typescript-eslint/no-explicit-any': 'off',

        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'semi': ['error', 'always'],
        'linebreak-style': 'off',

        // All strings should be single quotes, however:
        //   - string templates are allowed
        //   - if there is a double quoted string to allow less escaping, allow double quotes.
        //
        // see
        // - https://eslint.org/docs/rules/quotes.html
        'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],

        //
        // Code should be all indented with 4 spaces (not tabs), and the switch/case statements
        // should also be indented.
        //
        // see
        // - https://eslint.org/docs/rules/indent
        'indent': ['error', 4, { 'SwitchCase': 1 }],

        //
        //  Add a trailing comma on multi-line elements, so that additional items can be added to
        //  without causing a change in ownership of the original source lines (by having to add
        //  the comma)
        //
        'comma-dangle': ['error', {
            'arrays': 'always-multiline',
            'objects': 'always-multiline',
            'imports': 'always-multiline',
            'exports': 'always-multiline',
            'functions': 'never',
        }],

        // With function calls it is helpful to have the function call parenthesis bound/close to
        // the name.
        //
        // see
        //   - https://eslint.org/docs/rules/space-before-function-paren
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'always',
        }],

        // Ternary operators are treated the same as all other operators. Binary OR operator
        // is treated as special (not sure why).
        //
        // see
        // - https://eslint.org/docs/rules/operator-linebreak
        'operator-linebreak': ['error', 'after', {
            'overrides': {
                // "?": "before",
                // ":": "before",
                '|>': 'before',
            },
        }],

        // This is a performance optimisation. It isn't clear if this would be removed by the typescript
        // compiler. The await would have to be re-added if the method is extended.
        //
        // see
        //  - https://eslint.org/docs/rules/no-return-await
        'no-return-await': 'off',

        // This setting defaults to having spaces on the inside of object (dictionary) declarations.
        // The JetBrains settings need to be changed so this this is consistent.
        //
        // However the following have to be checked (not the default):
        //   Editor -> CodeStyle -> Typescript-> 'Spaces' -> Within -> 'Object Literal braces'
        //   Editor -> CodeStyle -> Typescript-> 'Spaces' -> Within -> 'ES6 import/export braces'
        //
        //  see
        //    - https://eslint.org/docs/rules/object-curly-spacing
        //
        // 'object-curly-spacing': ['error', 'always']
    },

    plugins: [
        '@typescript-eslint',
    ],

    parser: '@typescript-eslint/parser',

    parserOptions: {},
};
