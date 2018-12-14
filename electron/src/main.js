/*
 * @Author: renxia
 * @Date: 2018-12-05 15:22:25
 * @LastEditTime: 2018-12-14 15:36:40
 * @Description: 入口程序
 * @docs http://electronjs.org/docs
 */

const path = require('path');
const url = require('url');
const electron = require('electron');
const { app, BrowserWindow, Menu, dialog } = electron;
const pkg = require('./package.json');
const CFG = require('./electron.config');

const BUILD_ENV = pkg.packEnv || 'test';
const remoteDomain = CFG.domain[BUILD_ENV];
let mainWindow;

// app.commandLine.appendSwitch('--disable-http-cache');
app.commandLine.appendSwitch('--enable-npapi');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

/**
 * 获取菜单栏配置
 */
function getMenuTpl() {
  const template = [];
  const menuList = {
    label: '菜单',
    submenu: [
      {
        label: '重新加载',
        accelerator: 'Ctrl+R',
        click: function() {
          loadUrl();
        },
      },
      /*
      {
        label: '设置',
        accelerator: 'Alt+Command+S',
        click: function() {
          ActionCreators.showSettings();
        }
      }
      */
      {
        label: '关于',
        click: function(item, focusedWindow) {
          const version = app.getVersion();
          const appName = 'lzwme-' + BUILD_ENV;

          dialog.showMessageBox({
            type: 'info',
            title: '關於',
            message: ['Github User Search APP', '當前軟體版本：' + appName + '-' + version].join('\n'),
            buttons: [],
          });
        },
      },
    ],
  };
  template.push(menuList);

  // 开发环境下，添加开发工具
  if (['test', 'lc'].includes(BUILD_ENV)) {
    template.push({
      label: '开发工具',
      accelerator: 'Ctrl+Shift+J',
      click: function(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
    });
  }

  return template;
}
/**
 * 加载 URL 页面
 * @param {*} win
 */
function loadUrl(win) {
  let entryUrl;

  win = win || mainWindow;
  if (pkg.appConfig && pkg.appConfig.useRemote) {
    entryUrl = remoteDomain + '?time=' + new Date().getTime();
    win.loadURL(entryUrl, {
      // extraHeaders: 'pragma: no-cache\n',
    });
  } else {
    entryUrl = url.format({
      pathname: path.join(__dirname, 'app/index.html'),
      protocol: 'file:',
      slashes: true,
    });
    win.loadURL(entryUrl);
  }
}
/**
 * 初始化 mainWindow 内的事件监听
 */
function initWindowEvents() {
  let isQuitConfirm = false;

  mainWindow.on('close', function(e) {
    if (isQuitConfirm) {
      return true;
    }

    e.preventDefault();

    const handler = function(idx) {
      if (idx === 1) {
        isQuitConfirm = true;
        mainWindow.close();
      }
    };
    dialog.showMessageBox(
      {
        type: 'question',
        title: '提示',
        message: '确定要退出 GUS 系统？',
        buttons: ['取消', '确定'],
      },
      handler
    );
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  function unresponsiveHandler(type, title, msg) {
    return function() {
      const options = {
        type: type,
        title: title,
        message: msg,
        buttons: ['重新打开', '关闭'],
      };

      dialog.showMessageBox(options, function(idx) {
        if (idx === 0) {
          loadUrl();
        } else {
          mainWindow.close();
        }
      });
    };
  }

  mainWindow.webContents.on(
    'crashed',
    unresponsiveHandler('error', '程序运行出错', '遇到了一个严重的错误，请尝试重新打开')
  );

  mainWindow.on('unresponsive', unresponsiveHandler('info', '程序运行出错', '程序失去响应，请尝试重新打开'));
}
/**
 * 创建 mainWindow
 */
function createWindow() {
  const template = getMenuTpl();
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  const iconPath = path.resolve(__dirname, './resources/app.png');

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    icon: iconPath,
    // show: false,
    autoHideMenuBar: true,
    webPreferences: {
      plugins: true,
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  initWindowEvents();
  loadUrl(mainWindow);
  mainWindow.maximize();

  // 本地开发模式下，自动打开开发工具
  if (['lc'].includes(BUILD_ENV)) {
    mainWindow.toggleDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
