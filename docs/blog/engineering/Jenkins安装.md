# Jenkins安装

```
wget https://pkg.jenkins.io/redhat-stable/jenkins-2.235.1-1.1.noarch.rpm
```

执行安装
```
rpm -ivh jenkins-2.235.1-1.1.noarch.rpm
```

解决和默认java 端口冲突

```
vi /etc/sysconfig/jenkins
JENKINS_PORT = "8082"
```

启动报错

![jdk-err.jepg](../../.vuepress/public/engineering/jdk-err.jpeg)

发现版本过高,卸载原来的jdk,重新安装 jdk

## 卸载JDK

确定 jdk 版本

```
rpm -qa | grep jdk 
```
得到  java-1.4.2-gcj-compat-1.4.2.0-40jpp.115 

卸载

```
rpm -e  java-1.4.2-gcj-compat-1.4.2.0-40jpp.115 
```


重新启动jenkins

```
service jenkins restart
```

发现报错 

![jenkins_err.png](../../.vuepress/public/engineering/jenkins_err.png)

不要慌  解决方案如下

安装 插件

```
yum install fontconfig
yum install dejavu-sans-fonts 
```

再次重启

![jenkins_pwd.png](../../.vuepress/public/engineering/jenkins_pwd.png)


**查看密码**

```
cat /var/lib/jenkins/secrets/initialAdminPassword
```

## 修改下载源地址

进入 **/var/lib/jenkins** 

```
vim hudson.model.UpdateCenter.xml

// url 改成 
http://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

```

进入 **/var/lib/jenkins/updates** 执行

```
sed -i 's/http:\/\/updates.jenkins-ci.org\/download/https:\/\/mirrors.tuna.tsinghua.edu.cn\/jenkins/g' default.json && sed -i 's/http:\/\/www.google.com/https:\/\/www.baidu.com/g' default.json
```
 
填入密码后选择安装推荐的插件


![jenkins_down.png](../../.vuepress/public/engineering/jenkins_down.png)


## 汉化并添加用户

**Jenkins->Manage Jenkins->Manage Plugins**,点击 Available 

输入 **Chinese**  安装完成后  刷新页面 提示添加用户, 这里输入  root  root   点击登录 


![jenkins_start.png](../../.vuepress/public/engineering/jenkins_start.png)


## 自定义 jenkins 配置

编辑 jenkins 配置

```
vim /etc/init.d/jenkins
```

GTS/754f2f2e1e1477d50dab4bd788b12608bd7b4d6e