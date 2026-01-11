import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default withNuxt([
  prettierConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': [
        'warn',
        {
          endOfLine: 'lf',
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
])
