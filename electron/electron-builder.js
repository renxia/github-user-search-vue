/*
 * @Author: renxia
 * @Date: 2018-12-04 16:37:01
 * @LastEditTime: 2018-12-18 09:11:13
 * @Description: 使用 electron-builder 打包 electron/src 下内容至 release/builder-gus-<env> 目录
 */

const chalk = require('chalk');
const builder = require('electron-builder');
const Platform = builder.Platform;
const path = require('path');
const CFG = require('./src/electron.config');
const buildSrc = require('./build-src');

const argv = require('minimist')(process.argv.slice(2));
const packEnv = CFG.getPackEnv(argv.env);
const platform = argv['platform'] || 'all';
const resDir = path.join(__dirname, `./resources/res-${packEnv}`);

/**
 * `electron-builder` options
 * https://github.com/electron-userland/electron-builder
 * https://electron.build/configuration/configuration
 */
const opts = {
  appId: `com.lzwme.gus-${packEnv}.app`,
  icon: path.join(resDir, 'app_256x256.png'),
  productName: `gus-${packEnv}`,
  artifactName: '${productName}-${platform}-${arch}_${version}.${ext}',
  electronVersion: '3.0.10',
  // remoteBuild: false,
  directories: {
    app: path.join(__dirname, '../dist/electron'),
    buildResources: path.join(__dirname, `./resources/res-${packEnv}`),
    output: path.join(__dirname, `../release/builder-gus-${packEnv}`),
  },
  dmg: {
    icon: path.join(resDir, 'app.icns'),
  },
  linux: {
    target: ['zip'],
    icon: path.join(resDir, 'app_256x256.png'),
  },
  mac: {
    // category: "com.lzwme.app.mac",
    target: ['dmg', 'zip', 'pkg'],
    icon: path.join(resDir, 'app.icns'),
  },
  win: {
    target: ['nsis', '7z'], // , , 'zip', 'msi'
    icon: path.join(resDir, 'app_256x256.ico'),
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowElevation: true,
    allowToChangeInstallationDirectory: false,
    installerHeaderIcon: path.join(resDir, 'app_256x256.ico'),
    installerIcon: path.join(resDir, 'app_256x256.ico'),
    // installerHeader: path.join(resDir, `app_256x256.png`),
    // installerSidebar: path.join(resDir, `app_256x256.png`),
    // installerHeader: 'installerHeader.bmp',
    // include: 'installer.nsh',
    // script: 'installer.nsi',
    // publish: {}
  },
  // publish: [{
  //   "provider": "generic",
  //   //类似于autoUpdater.setFeedURL(url)中的url，用于自动更新的文件地址
  //   "url": "http://www.xxx.com/"
  // }],
  afterPack(packer) {
    console.log('packed!');
  },
  afterAllArtifactBuild(packer) {
    console.log('afterAllArtifactBuild!');
  },
};

const buildStart = async () => {
  console.log(chalk.yellow.bold('Release For Env: '), chalk.bold.green(packEnv));

  // 开启调试模式
  if (argv.debug) {
    process.env.DEBUG = 'electron-builder';
  }

  if (['win', 'all'].includes(platform)) {
    await builder.build({
      targets: Platform.WINDOWS.createTarget(),
      // targets: Platform.LINUX.createTarget(),
      // targets: Platform.MAC.createTarget(),
      config: opts,
    });
  }

  if (['linux', 'all'].includes(platform)) {
    await builder.build({
      targets: Platform.LINUX.createTarget(),
      config: opts,
    });
  }

  // 只有在 mac 平台上才构建 mac 版本
  if (process.platform === 'darwin' && ['mac', 'all'].includes(platform)) {
    await builder.build({
      targets: Platform.MAC.createTarget(),
      config: opts,
    });
  }
};

buildSrc
  .start()
  .then(() => buildStart())
  .then(() => {
    console.log('\nDone!');
  })
  .catch(error => {
    console.log(error);
  });
