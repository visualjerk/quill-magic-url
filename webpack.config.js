var path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname,
    libraryTarget: 'umd',
    filename: "./dist/index.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'babel-loader',
          options: {
            "presets": [["es2015", {"modules": false}]]
          }
        }]
      },
      {
        test: /\.svg$/,
        use: [{
          loader: 'raw-loader'
        }]
      }
    ]
  }
};