var path = require('path');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: __dirname,
    libraryTarget: 'umd',
    filename: "./dist/index.js"
  },
  devServer: {
    contentBase: './demo'
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
            "presets": ['@babel/preset-env']
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
