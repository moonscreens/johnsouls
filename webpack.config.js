const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const { extendDefaultPlugins } = require("svgo");

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	output: {
		path: `${__dirname}/dist`,
		filename: 'bundle.js',
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			hash: true,
		}),
	],
	devServer: {
		contentBase: `${__dirname}/dist`,
		compress: true,
		port: 1234,
	},
	module: {
		rules: [
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				type: "asset",
			},
			{
				test: /\.(webp|avif|gltf|glb)$/i,
				loader: 'file-loader',
				options: {
					outputPath: 'images',
				},
			},
			{
				test: /\.html$/i,
				use: ['html-loader'],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	optimization: {
		minimizer: [
			"...",
			new ImageMinimizerPlugin({
				minimizer: {
					implementation: ImageMinimizerPlugin.imageminMinify,
					options: {
						// Lossless optimization with custom option
						// Feel free to experiment with options for better result for you
						plugins: [
							["gifsicle", { interlaced: true }],
							["jpegtran", { progressive: true }],
							["optipng", { optimizationLevel: 5 }],
							// Svgo configuration here https://github.com/svg/svgo#configuration
							[
								"svgo",
								{
									plugins: extendDefaultPlugins([
										{
											name: "removeViewBox",
											active: false,
										},
										{
											name: "addAttributesToSVGElement",
											params: {
												attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
											},
										},
									]),
								},
							],
						],
					},
				},
			}),
		],
	},

};