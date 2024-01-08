const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    bundle: [
      './src/abstractUI.ts',
      './src/config.ts',
      './src/classes.ts',
      './src/acmClasses.ts',
      './src/uml.ts',
      './src/highlightingVisualization.ts',
      './src/utils.ts',
      './src/natLangHighlightingVis.ts',
      './src/parse.ts',
      './src/parseACM.ts',
      './src/ui.ts',
      './src/main.ts',
      './src/umlHighlightingVisualization.ts',
      './src/splitVis.ts',
      './src/colorSupplier.ts',
      './src/visualizationMediator.ts',
      './src/codeModelNodeLinkVisualization.ts',
      './src/codeModelTreeVisualization.ts',
      './src/traceLinkVisualization.ts',
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