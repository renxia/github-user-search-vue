# 构建 Electron APP

支持使用 `electron-builder` 和 `electron-packager` 两种构建方式。

## 使用 `electron-builder` 构建(推荐)

该种方式支持 ns 打包 exe 安装文件。

```bash
node electron-builder.js --env <env>
# macOS 下构建 mac 的版本
node electron-builder.js --env <env> --plathform mac
```

`env` 参数可选值：

- `gtp、gtphk` 正式环境
- `gtpcs4` cs4 环境
- `gtpuat` uat 环境
- `gtptest`  test 环境
- `gtplc` 本地调试，使用域名 `lc.gf.com.cn:3006`

## 使用 `electron-packager` 构建

```bash
node electron-packager.js --env <env>
```

## 本地调试 Electron 脚本

1. 把此目录下的 launch.json 拷贝到根目录的 .vscode 目录下
2. 把根目录下的 package.json 的 main 属性值改成你要调试的 js 脚本文件路径
3. 重启 VSCODE，然后再在 vscode 编辑器启动调试

## 参考链接

- [icon 在线转换](https://www.easyicon.net/covert/)
- [electron-builder 配置项参考](https://electron.build/configuration/configuration)
- [electron-packager 配置项参考](https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options)
- [electronjs 中文文档](http://electronjs.org/docs)

[VSCodeSetup-ia32-1.13.1.exe](https://code.visualstudio.com/updates/v1_13)
[Github Electron v0.31.2](https://github.com/electron/electron/releases/tag/v0.31.2)

<https://www.kancloud.cn/wizardforcel/electron-doc/137776>

<https://segmentfault.com/a/1190000005598234>

<http://blog.csdn.net/u014595019/article/details/53349505>

<http://www.open-open.com/lib/view/open1487125044026.html>

<http://www.cnblogs.com/weishenhong/p/5238854.html>
