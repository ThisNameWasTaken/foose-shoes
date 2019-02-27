module.exports = {
  presets: [['@babel/preset-env', { modules: false, useBuiltIns: "usage" }]],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};
