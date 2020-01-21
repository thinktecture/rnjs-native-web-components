module.exports = {
  mode: 'production',
  entry: {
      'rating': './src/rating.js',
  },
  output: {
      filename: 'native-web-rating.js',
  },
  module: {
      rules: [
          {
              test: /\.(html)$/,
              use: {
                  loader: 'html-loader',
              },
          },
          {
              test: /\.(png|jpe?g|gif)$/i,
              use: [
                  {
                      loader: 'file-loader',
                  },
              ],
          },
      ],
  },
};
