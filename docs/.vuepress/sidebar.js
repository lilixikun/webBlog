const blog = [
    {
        title: 'HTTP',
        collapsable: true,
        children: [
            'http/HTTP协议1',
            'http/HTTP缓存',
            'http/TCP-IP'
        ]
    },
    {
        title: 'Node',
        collapsable: true,
        children: [
            'node/从零搭建个人博客网站1-自动加载全局路由',
            'node/从零搭建个人博客网站2-全局异常处理',
            'node/从零搭建个人博客网站3-使用 Sequelize操作mySql',
            'node/从零搭建个人博客4-集成jwt',
            'node/SSR',
            'node/BFF架构初探'
        ]
    },
    {
        title: '前段工程化',
        collapsable: true,
        children: [
            'engineering/打造属于自己的脚手架',
            'engineering/脚手架的可视化操作',
            'engineering/Jenkins安装',
            'engineering/sonar简单使用'
        ]
    }
]

// 算法
const algorithm = [
    {
        title: '数组',
        collapsable: false,
        children: [
            'array/count',
            'array/bisection_method',
            'array/find_min_number'
        ]
    },
    {
        title: '字符串',
        collapsable: false,
        children: [
            'string/slide_window'
        ]
    },
    {
        title: '栈、队列、链表',
        collapsable: false,
        children: [
            'sort/queue',
            'sort/linked_list',
            'linked_list/find_key'
        ]
    },
    {
        title: '趣味算法',
        collapsable: false,
        children: [
            'other/cards',
            'other/range_of_motion'
        ]
    },
]

// 开源相关
const open_source = [
    {
        title: '开源贡献',
        collapsable: false,
        children: [
            '',
        ]
    },
    {
        title: 'TinyDB',
        collapsable: false,
        children: [
            'github/indexeddb',
            'github/tinydb_docapi'
        ]
    },
    {
        title: 'Simple-dark',
        collapsable: false,
        children: [
            'vscode/Simple-dark'
        ]
    },
    {
        title: 'tscli',
        collapsable: false,
        children: [
            'cli/tscli'
        ]
    }
]

module.exports = {
    '/blog/': blog,
    '/algorithm/': algorithm,
    '/open_source/': open_source
}