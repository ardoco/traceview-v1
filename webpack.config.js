const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    bundle: [
      './src/classes.ts',
      './src/uml.ts',
      './src/highlightingVisualization.ts',
      './src/utils.ts',
      './src/natLangHighlightingVis.ts',
      './src/parse.ts',
      './src/ui.ts',
      './src/main.ts',
      './src/umlHighlightingVisualization.ts',
      './src/splitVisualization.ts'
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};