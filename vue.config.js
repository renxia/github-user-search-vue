const anyParse = require('co-body');
const apiMock = require('@lzwme/simple-mock');
const chalk = require('chalk');
const proxyTarget = 'https://api.github.com/';

const config = {
  baseUrl: '',
  assetsDir: 'resources',
  // Links: https://webpack.js.org/configuration/dev-server/
  devServer: {
    open: true,
    https: false,
    port: 3009,
    compress: true,
    disableHostCheck: true,
    // Links: https://github.com/chimurai/http-proxy-middleware
    proxy: {
      '/users': {
        target: proxyTarget,
        changeOrigin: true,
        onProxyRes(proxyRes, req, res) {
          apiMock.saveApi(req, res, proxyRes.headers['content-encoding']);
        },
        async onProxyReq(proxyReq, req, res) {
          // 尝试解码 post 请求参数至 req.body
          if (!req.body && proxyReq.getHeader('content-type')) {
            try {
              req.body = await anyParse({ req });
            } catch (err) {
              // console.log(err);
            }
          }

          apiMock.render(req, res).then(isMocked => {
            if (!isMocked) {
              console.log(chalk.cyan('[apiProxy]'), req._parsedUrl.pathname, '\t', chalk.yellow(proxyTarget));
            }
          });
        },
      },
    },
  },
};

config.devServer.proxy['/repositories'] = config.devServer.proxy['/users'];

module.exports = config;
