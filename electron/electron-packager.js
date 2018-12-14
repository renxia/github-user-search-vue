/*
 * @Author: renxia
 * @Date: 2018-12-04 16:37:01
 * @LastEditTime: 2018-12-14 16:55:39
 * @Description: 使用 electron-packager 打包 electron/src 下内容至 release/packager-gus-<env> 目录
 */
const chalk = require('chalk');
const path = require('path');
const packager = require('electron-packager');
const buildSrc = require('./build-src');
const CFG = require('./src/electron.config');
const argv = require('minimist')(process.argv.slice(2));
const ROOT_DIR = path.join(__dirname, '../');
const packEnv = CFG.getPackEnv(argv.env);
const RES_DIR = path.join(__dirname, `./resources/res-${packEnv}`);
const platform = argv.platform || process.env.PACK_PLATFORM || 'all';

const startPack = () => {
  /**
   * `electron-packager` options
   * https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
   */
  const opts = {
    // Target 'x64' architecture
    arch: process.env.PACK_ARCH || 'x64', // 'ia32'

    // Compress app using 'electron/asar'
    asar: true,

    // The source directory
    dir: path.join(__dirname, '../dist/electron'),

    // Set electron app icon
    // File extensions are added based on platform
    icon: path.join(RES_DIR, 'app.ico'),

    // Ignore files that would bloat final build size
    ignore: /(^\/(src|test|\.[a-z]+|README|yarn|static|dist\/web))|\.gitkeep/,

    // Save builds to `builds`
    out: path.join(__dirname, `../release/packager-gus-${packEnv}`),

    // Overwrite existing builds
    overwrite: true,

    electronVersion: '3.0.10',

    appVersion: '0.0.1.0', //.. pkg.version,
    appCopyright: `Copyright(C) ${new Date().getFullYear()} lzwme, Inc. All rights reseved.`,
    platform,

    // Windows targets only
    win32metadata: {
      CompanyName: 'lzwme',
    },

    /** OS X/Mac App Store targets only */
    appBundleId: `com.lzwme.gus-${packEnv}`,
    osxSign: false,

    // afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    //   rebuild({ buildPath, electronVersion, arch })
    //     .then(() => callback())
    //     .catch((error) => callback(error));
    // }],
  };

  console.log(chalk.yellow.bold('Release For Env: '), chalk.bold.green(packEnv));
  console.log(chalk.cyan.bold('Release To:'), opts.out, '\n');

  return packager(opts)
    .then(appPaths => {
      console.log(chalk.green.bold('\n Done!'));
      return opts;
    })
    .catch(err => {
      console.log(err);
      return opts;
    });
};

/**
 * 构建 windows 下的安装包
 * @param {*} opts
 */
const packWinInstaller = opts => {
  const installer = require('electron-installer-windows');
  const options = {
    src: path.join(opts.out, `${CFG.appName[packEnv]}-win32-${opts.arch}/`),
    dest: opts.out, // 'release/packager-gus-test/',
    icon: opts.icon,
    // version: '0.1.0.0',
    noMsi: true,
  };

  console.log(chalk.yellow.bold('\nCreating package (this may take a while)'));

  installer(options)
    .then(() => console.log(`Successfully created package at ${options.dest}`))
    .catch(err => {
      console.error(err, err.stack);
      process.exit(1);
    });
};

/**
 * 构建 mackos 下的安装包
 * @param {*} opts
 */
const packMacosInstaller = async opts => {
  // 只有 mac 平台下才能打包 dmg 安装文件
  if (process.env.platform !== 'darwin') {
    console.log(chalk.red.bold('忽略 dmg 安装包构建，在 MacOS 系统下才能打包输出 dmg 应用'));
    return opts;
  }

  console.log(chalk.yellow.bold(`Sign for ${CFG.appName[packEnv]}.app...`));
  // 签名
  const signAsync = require('electron-osx-sign').signAsync;
  await signAsync({
    app: path.join(opts.out, `${CFG.appName[packEnv]}-mas-${opts.arch}/${CFG.appName[packEnv]}.app`),
  })
    .then(function() {
      console.log('Application signed');
    })
    .catch(function(err) {
      console.log(err);
    });

  console.log(chalk.yellow.bold(`Create installer for ${CFG.appName[packEnv]}.app...`));
  // 打包 dmg 文件
  const createDMG = require('electron-installer-dmg');
  new Promise((resolve, reject) => {
    createDMG(
      {
        appPath: path.join(ROOT_DIR, 'release/packager-gus-test/lzwme-gus-test-mas-x64/lzwme-gus-test.app'),
        name: `gus-${packEnv}`,
        // The title of the produced DMG, which will be shown when mounted.
        title: `lzwme-gus-${packEnv}`,
        overwrite: true,
        out: path.join(ROOT_DIR, 'release/packager-gus-test'),
        icon: path.join(RES_DIR, 'app.png'),
        iconSize: '128', // 默认为 80
      },
      function done(err) {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        resolve();
        console.log('done!');
      }
    );
  });

  return opts;
};

buildSrc
  .start()
  .then(() => startPack())
  .then(opts => packMacosInstaller(opts))
  .then(opts => packWinInstaller(opts))
  .catch(err => {
    console.log('构建失败！', err);
  });
