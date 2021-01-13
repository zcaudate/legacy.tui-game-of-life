const webpack = require("webpack");
const path = require("path");
const RunNodeWebpackPlugin = require("run-node-webpack-plugin");
const WebpackNodeExternals = require("webpack-node-externals")

const common_config = {
  entry: "./src/main.js",
  target: "node",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "@sucrase/webpack-loader",
            options: { transforms: ["jsx"] },
          },
        ],
      },
    ],
  },
  externals: [WebpackNodeExternals()],
};

const dev_config = {
  ...common_config,
  mode: "development",
  output: { path: path.join(__dirname, "dist"), filename: "main.js" },
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();', {
      raw: true,
      entryOnly: false,
    }),
    new RunNodeWebpackPlugin(),
  ],
};

const prod_config = {
  ...common_config,
  mode: "production",
  output: { path: path.join(__dirname, "dist"), filename: "main.min.js" },
  plugins: [new webpack.IgnorePlugin(/\.(css|less)$/)],
};

function config(env) {
  if (env.prod) {
    return prod_config;
  } else {
    return dev_config;
  }
}

module.exports=config