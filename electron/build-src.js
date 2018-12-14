/*
 * @Author: renxia
 * @Date: 2018-12-05 15:50:03
 * @LastEditTime: 2018-12-14 11:03:57
 * @Description: 构建 electron/src 目录中的内容至 dist/electron 目录中
 */
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const pkg = require('../package.json');
const CFG = require('./src/electron.config');
const ROOT_DIR = path.join(__dirname, '../');
const SRC_DIR = path.join(ROOT_DIR, CFG.release.srcDir);
const DIST_DIR = path.join(ROOT_DIR, CFG.release.distDir);

// 获取目标配置
const argv = require('minimist')(process.argv.slice(2));
const env = CFG.getPackEnv(argv.env);
const isCLI = argv.cli;

const APP_NAME = CFG.appName[env];
const builder = {
  clearDist() {
    console.log(chalk.cyan.bold('Clean Dist Folder: '), DIST_DIR);
    fs.removeSync(DIST_DIR);
  },
  async copyFiles() {
    if (!fs.existsSync(path.join(ROOT_DIR, 'dist/webapp/index.html'))) {
      console.log(chalk.red.bold('请先执行 APP 源码构建！'));
      return false;
    }

    const copyList = [
      {
        src: SRC_DIR,
        dest: DIST_DIR,
      },
      {
        src: path.join(SRC_DIR, `../resources/res-${env}`),
        dest: path.join(DIST_DIR, 'resources'),
      },
      {
        src: path.join(SRC_DIR, '../resources/common'),
        dest: path.join(DIST_DIR, 'resources/common'),
      },
      {
        src: path.join(ROOT_DIR, 'dist/webapp'),
        dest: path.join(DIST_DIR, 'app'),
      },
    ];

    copyList.forEach(item => {
      if (!fs.existsSync(item.src)) {
        console.warn('源目录不存在！', item.src);
        return;
      }

      console.log(chalk.cyan.bold('Copy:'), item.src, chalk.green.bold('to'), item.dest);

      // 目录不存在或无法访问则尝试创建目录
      try {
        fs.accessSync(item.dest);
      } catch (err) {
        fs.ensureDirSync(item.dest);
      }

      fs.copySync(item.src, item.dest);
    });

    return true;
  },
  async replaceFiles() {
    console.log(chalk.cyan.bold('\nStart Replace Files...'));
    // 改写文件配置的列表
    const replaceFileList = [
      {
        //   src: 'main.js',
        //   dest: 'main.js',
        //   replaceTexts: [{
        //     initText: '__pathname__',
        //     newText: DOMAIN,
        //   }, {
        //     initText: '__BUILD_ENV__',
        //     newText: env,
        //   }, ]
        // }, {
        src: 'package.json', // 相对 SRC_DIR 的位置
        dest: 'package.json', // 相对 DIST_DIR 的位置
        replaceTexts: [
          {
            initText: '__version__',
            newText: pkg.version,
          },
          {
            initText: 'appname',
            newText: APP_NAME,
          },
          {
            initText: '__packEnv__',
            newText: env,
          },
        ],
      },
    ];

    replaceFileList.forEach(async config => {
      config.src = path.join(SRC_DIR, config.src);
      config.dest = path.join(DIST_DIR, config.dest || config.src);

      console.log(chalk.yellow.bold(config.src), 'to', chalk.yellow.bold(config.dest));

      if (config.initText || config.replaceTexts) {
        // 读取文件内容
        const dataStr = fs.readFileSync(config.src, 'utf8');
        let dataStrNew = dataStr;

        if (config.initText && config.newText) {
          dataStrNew = dataStr.replace(config.initText, config.newText);
        } else if (config.replaceTexts) {
          config.replaceTexts.forEach(replaceItem => {
            dataStrNew = dataStrNew.replace(replaceItem.initText, replaceItem.newText);
          });
        }

        // 目录不存在或无法访问则尝试创建目录
        const destDir = path.dirname(config.dest);
        try {
          fs.accessSync(destDir);
        } catch (err) {
          fs.ensureDirSync(destDir);
        }

        // 写入到 destDir
        // fs.outputFileSync(config.dest, dataStrNew);
        fs.writeFileSync(config.dest, dataStrNew, 'utf8');
      } else {
        // 复制文件
        fs.copySync(config.src, config.dest);
      }
    });
  },
  async start() {
    console.log(chalk.yellow.bold('Start Build Sources For Env:'), chalk.green.bold(env), '\n');

    try {
      this.clearDist();
      await this.copyFiles();
      await this.replaceFiles();
      console.log(chalk.green.bold('\n Release To:'), DIST_DIR);
      console.log(chalk.green.bold(' =============== Release electron sources success! =================\n'));
    } catch (err) {
      console.log(err);
    }
  },
};

if (isCLI) {
  builder.start();
}

module.exports = builder;
