const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

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
      './src/app/visualizationObserver.ts',
      './src/app/application.ts',
      './src/utils.ts',
      './src/ui/initVisPopup.ts',
      './src/main.ts',
      './src/colorSupplier.ts',
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
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public", to: "" },
      ],
    }),
  ]
};