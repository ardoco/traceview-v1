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
      './src/artifactVisualizations/highlightingVisualization.ts',
      './src/utils.ts',
      './src/artifactVisualizations/natLangHighlightingVis.ts',
      './src/parse.ts',
      './src/parseACM.ts',
      './src/initVisPopup.ts',
      './src/main.ts',
      './src/artifactVisualizations/umlHighlightingVisualization.ts',
      './src/application.ts',
      './src/colorSupplier.ts',
      './src/visualizationMediator.ts',
      './src/artifactVisualizations/codeModelTreeVisualization.ts',
      './src/traceLinkVisualization.ts',
      './src/uiFactory.ts',
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