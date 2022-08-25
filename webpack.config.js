module.exports = {
  entry: './src/index.ts',
  output: {
    path: __dirname,
    libraryTarget: 'umd',
    filename: './dist/index.js',
  },
  devServer: {
    contentBase: './demo',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ["@babel/preset-typescript"],
                [
                  '@babel/preset-env',
                  {
                    targets: '> 0.25%, not dead',
                  },
                ],
              ],
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },
}
