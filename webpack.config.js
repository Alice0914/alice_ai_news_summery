const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Check if we're in production (Vercel sets this) or if env vars are already present
const isProduction = process.env.NODE_ENV === 'production';
const hasEnvVars = process.env.FIREBASE_API_KEY;

// Load environment variables from .env.local ONLY for local development
// In production (Vercel), environment variables are injected by the platform
if (!hasEnvVars) {
  const envResult = dotenv.config({ path: path.resolve(__dirname, '.env.local') });

  if (envResult.error) {
    console.warn('⚠️  Warning: Could not load .env.local file:', envResult.error.message);
    console.warn('   This is expected in production where env vars are set by the platform.');
  } else {
    console.log('✅ Loaded .env.local file (local development)');
  }
} else {
  console.log('✅ Using environment variables from platform (Vercel/CI)');
}

// Debug: Log which Firebase env vars are present (without showing values for security)
const firebaseVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
];

if (!isProduction) {
  console.log('🔧 Firebase Environment Variables:');
  firebaseVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      console.log(`  ✓ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`  ✗ ${varName}: MISSING`);
    }
  });
}

module.exports = (env) => {
  // Handle both boolean true and string "true" from CLI
  const isAdmin = env && (env.admin === true || env.admin === 'true');
  console.log('🔧 Build Mode:', isAdmin ? 'Admin Tool' : 'User App');

  return {
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      clean: true,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.json$/,
          type: 'json',
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: 'body',
      }),
      // Expose selected environment variables to the client bundle
      new webpack.DefinePlugin({
        'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
        'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
        'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
        'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
        'process.env.FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID),
        'process.env.ADMIN_MODE': JSON.stringify(isAdmin),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
      open: true,
    },
    mode: process.env.NODE_ENV || 'development',
  };
};

