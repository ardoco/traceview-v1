const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    bundle: [
      './src/abstractUI.ts',
      './src/config.ts',
      './src/classes.ts',
      './src/acmClasses.ts',
      './src/artifacts/uml.ts',
      './src/artifactVisualizations/highlightingVisualization.ts',
      './src/artifactVisualizations/codeModelTreeVisualization.ts',
      './src/artifactVisualizations/traceLinkVisualization.ts',
      './src/artifactVisualizations/natLangHighlightingVis.ts',
      './src/artifactVisualizations/umlHighlightingVisualization.ts',
      './src/utils.ts',
      './src/ui/initVisPopup.ts',
      './src/main.ts',
      './src/app/application.ts',
      './src/colorSupplier.ts',
      './src/visualizationMediator.ts',
      './src/uiFactory.ts',
      './src/parse/parse.ts',
      './src/parse/parseACM.ts',
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