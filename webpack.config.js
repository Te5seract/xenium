const path = require("path"),
    webpack = require("webpack"),
    TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry : "./src/core.js",
    mode : "production",
    output : {
        path : path.resolve(__dirname, "dist"),
        filename : "xenium.min.js",
    },
    optimization : {
        minimize : true,
        minimizer : [
            new TerserPlugin({
                terserOptions : {
                    keep_fnames : true
                }
            })
        ]
    }
};
