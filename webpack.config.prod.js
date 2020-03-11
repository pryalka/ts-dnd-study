const path = require('path');
const CleanPlugin = require('clean-webpack-plugin');

// Webpack uses node.js exports system
module.exports = {
  // This is the production mode config file
  mode: 'production',
  // Entry point file where webpack starts it's job
  entry: './src/app.ts',
  // Outout file where webpack results will be presented
  output: {
    filename: 'bundle.js',
    // Webpack uses absilute file path for output file
    path: path.resolve(__dirname, 'dist')
  },
  // Do not generate sourcemaps
  devtool: 'none',
  // Here we describe how to work with files processed by webpack
  module: {
    // We do it with the help of rules array
    rules: [
      {
        // Check if webpack have to apply the rule for the file
        test: /\.ts$/, // We want apply the rule for *.ts files
        use: 'ts-loader', // Apply ts-loader for every *.ts file
        exclude: /node_modules/ // Do not apply the rule for files inside node_moudeles
      }
    ]
  },
  // Define which file extensions webpack should check when handle files
  resolve: {
    extensions: ['.ts', '.js']
  },
  // Utilities applied to the entire project workflow
  plugins: [
    // Clean dist folder when doing new builds
    new CleanPlugin.CleanWebpackPlugin()
  ]
};
