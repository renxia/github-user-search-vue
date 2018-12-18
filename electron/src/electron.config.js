/*
 * @Author: renxia
 * @Date: 2018-12-06 09:59:10
 * @LastEditTime: 2018-12-18 08:44:15
 * @Description: CONFIG
 */

module.exports = {
  envList: ['test', 'uat', 'cs4', 'lc'],
  appName: {
    test: 'lzwme-gus-test',
    lc: 'lzwme-gus-lc',
  },
  domain: {
    test: 'https://lzw.me/pages/demo/github-user-search-vue/',
    lc: 'http://localhost:3009',
  },
  installer: {
    localName: {
      test: 'LZWME-GUS-TEST',
      lc: 'LZWME-GUS-LC',
    },
  },
  getPackEnv(env) {
    let packEnv = env;

    if (!this.envList.includes(packEnv)) {
      packEnv = process.env.PACK_ENV;
    }

    if (!this.envList.includes(packEnv)) {
      packEnv = 'lc';
    }

    return packEnv;
  },
  release: {
    srcDir: 'electron/src',
    distDir: 'dist/electron',
  },
};
