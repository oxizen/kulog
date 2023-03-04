/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript'
  ],
  rules: {
    semi: ["error", "always"],
    quotes: ["error", "single"]
  },
  parserOptions: {
    ecmaVersion: 'latest',
    project: "./tsconfig.json"
  },
  globals: {
    "Deployment": "readonly",
    "DeploymentList": "readonly",
    "PodList": "readonly"
  }
}
