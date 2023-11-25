const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    bundle: [
      './src/classes.ts',
      './src/visualizationClasses.ts',
      './src/utils.ts',
      './src/highlightingVisualization.ts',
      './src/parse.ts',
      './src/main.ts',
      './src/umlHighlightingVisualization.ts',
      './src/splitVisualization.ts'
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
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