# Sonar简单使用

## Linux安装jdk


## Linux 安装 sonarqube
去[官网](https://www.sonarqube.org/downloads/) 下载安装包


**执行解压**

```
unzip sonarqube-8.4.0.35506
```


- bin 目录存放了各个环境的启动脚本
- conf 目录存放sonarqube的配置文件
- logs 目录存放着启动和运行时的日志文件

进入对应操作系统

```
cd linux-x86-64/
```

查看sonarqube 命名

```
./sonar.sh
```

启动之前先使用 chown 命令将sonarqube及其子目录授权给一个非root的用户，sonarqube及其es等软件禁止 root账户启动，因此需要切换一个非root账户，授权的用户需要有bin目录及其子目录的读取和可执行的权限

**添加用户**

```
useradd xikun
```

**设置密码**
```
passwd xikun
```

**把文件夹的授权给某一个用户**

```
chown -R xikun /usr/local/src/sonarqube-8.4.0.35506
```

**切换用户**

```
su xikun
```

**启动sonar**
```
./sonar.sh start
```
**查看sonar 是否启动**

```
ss -ntpl | grep 9000
```

![sonar_start.jepe](../../.vuepress/public/engineering/sonar_start.jpeg)

## 访问服务器:9000

点击登陆进入 

默认账户,密码 都是 **admin**

安装中文插件 **chinese**

![sonar_chinese.jepe](../../../docs/.vuepress/public/engineering/sonar_chinese.png)


## sonarqube 账号 token 的生成

onarqube支持生成用户token，以便在命令行或者脚本中使用token代表账号操作sonarbue，避免造成账号密码的泄露。
点击sonarqube首页右上角头像，进入我的账号

![token.png](../../../docs/.vuepress/public/engineering/sonar_token.png)

**token**
201e7b90ae737e356d65b6edd205ee31758d77ff

## 检测前段代码

- 创建一个项目如 test_01
- 生成token,生成token时会要求输入一个密钥，如果不输入的话会直接使用项目名，安全起见，输入一个随机字符串
- 选择语言，进行构建即可。因为是js,ts项目，所以需要额外下载sonar-scanner，安装完成后，直接使用下面给的命令进行检查即可


下载 **sonar-scanner** 到本地 并配置环境变量

macOs 下

```
vim ~/.bash_profile

export sonar = xxxx/bin

export PATH=${sonar}:xx

source ~/.bash_profile
```

查看 **sonar-scanner** 版本

```
sonar-scanner  -v
```

### 测试代码

如现在我们现在要 检查项目A 的代码 那么在项目根目录下 新建 **sonar-project.properties**,填入一下信息

```
sonar.host.url=

#----- Default source code encoding
 sonar.sourceEncoding=UTF-8
 sonar.source=.
 sonar.projectKey=test_01
 sonar.login=
```

在项目终端执行

```
sonar-scanner
```

![sonar-scanner.png](../../.vuepress/public/engineering/sonar-scanner.png)

然后就是漫长的等待

![sonar_wait.png](../../.vuepress/public/engineering/sonar_wait.png)

最后我们查看网站的代码检查报表

![sonar_repo.png](../../.vuepress/public/engineering/sonar_repo.png)


项目令牌

test：**40e778e195cd49feb2c135c215753e32f3cb657c**




