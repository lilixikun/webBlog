# RBAC

## 基于RBAC的权限验证

权限验证的场景以及需求：
- 特定额角色用户才能操作特定的资源
- 不同的用户能操作同类资源的特定实体
- 不同的用户操作特定资源的不同属性

`“谁（User）拥有什么权限（Authority）去操作（Operation）哪些资源（Resource）”`

根据角色完成权限的控制 - RBAC (role based access control)

下面讲以 [CASL](https://github.com/stalniy/casl) 介绍基本用法

## CASL

安装 npm 包 

```bash
npm install @casl/ability
```