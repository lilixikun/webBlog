
const nav = require('./nav')
const sidebar = require('./sidebar')


module.exports = {
    title: 'xikun\'s blog',
    description: '成功的路上一点也不拥挤',
    markdown: {
        lineNumbers: true
    },
    extraWatchFiles: [
        '.vuepress/nav.js',
        '.vuepress/sidebar.js'
    ],
    head: [ // 注入到当前页面的 HTML <head> 中的标签
        ['link', { rel: 'icon', href: '/logo.jpg' }], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    serviceWorker: true, // 是否开启 PWA
    base: '/', // 这是部署到github相关的配置
    markdown: {
        lineNumbers: false // 代码块显示行号
    },
    themeConfig: {
        nav,
        sidebar,
        docsDir: 'docs',
        editLinks: true,
        sidebarDepth: 5,
        editLinkText: '在 Github 上编辑此页',
        lastUpdated: '更新时间',
    },
    plugins: [
        ["@vuepress/medium-zoom", true],
        ["@vuepress/back-to-top", true],
    ],
};