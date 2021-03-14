# microbundle

## microbundle

通常我们在进行开发一个SDK包工具的时候、首先需要配置 `TypeScript`、然后再就是一堆 `rollup` 的配置，装一堆的各种插件，那么这个时候 `microbundl` 是你最好不过的选择了。 `microbundle` 号称 "微小组件的零配置打包器"，它是围绕 `rollup` 构建的打包器 ，天然支持 `TypeScript`，并且它可以一件生成 `ES modules`， `CommonJS`， `UMD` 等多目标格式。

## 上车

首先我们进行项目初始化：

```js
npm init 
npm i microbundle -D
```

配置入口文件 `src/index.ts`，随便写入

```ts
export default class Mylib {
  constructor() {
    this.init("mylib");
  }
  /**
   * 初始化
   * @param name 名字
   */
  init(name: string) {
    console.log(`初始化!${name}`);
  }
}
```

配置 `package.json` 文件 

```json
{
  "source": "src/index.ts",
  "main": "dist/index.js",
  "module": "dist/index.modern.js",
  "types": "dist/index.d.ts",
  "unpkg": "dist/index.umd.js",
  "scripts": {
    "dev": "microbundle watch",
    "build": "microbundle",
   }
}
```

ok，现在使用启动命令 `yarn build`，看看在`dist`目录下都生成了什么  

![microbundle](/engineering/microbundle.png)

`microbundl` 按照配置我们生成了我们对应的包文件、最舒服的是给我们生成了 `index.d.ts`。这允许了一个 `TypeScript` 项目将正确的类型信息反向指派给组件包 -- 通过这种间接方式，完成了本来要引入 `.ts` 文件才能达到的类型识别目标。  

## 文档生成

上面包也生成了，`NPM` 上也发布了，接下来就到写文档的时候了。 这里可以采用 **TypeDoc** + **api-extractor** 自动生成文档。

安装对应依赖 

```js
npm i @microsoft/api-extractor -D
npm i typedoc -D
```

按照文档对 `tsconfig.json` 进行配置 

```json
{
  "compilerOptions": {
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "module": "ESNext",
    "target": "ESNext",
    "noImplicitAny": true,
    "noImplicitThis": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "declarationDir": "./typings"
  },
  "include": [
    "./src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.spec.ts"
  ]
}
```

依次执行  `api-extractor init`，`api-extractor run --local --diagnostics` 命令

执行 `init` 命名会生成一个 `api-extractor.json` 文件，里面配置有些糟乱，下面是一份本人的配置文件，供参考

```json
{
	"$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
	"mainEntryPointFilePath": "typings/index.d.ts",
	"bundledPackages": [],
	"compiler": {
		"overrideTsconfig": {
			"compilerOptions": {
				"declaration": false
			}
		}
	},
	"apiReport": {
		"enabled": false,
		"reportFolder": "<projectFolder>/docs/"
	},
	"docModel": {
		"enabled": false,
		"apiJsonFilePath": "<projectFolder>/temp/<unscopedPackageName>.api.json"
	},
	"dtsRollup": {
		"enabled": true,
		"omitTrimmingComments": true,
		"untrimmedFilePath": "dist/typings/index.d.ts"
	},
	"tsdocMetadata": {
		"enabled": false
	},
	"messages": {
		"compilerMessageReporting": {
			"default": {
				"logLevel": "warning"
			}
		},
		"extractorMessageReporting": {
			"default": {
				"logLevel": "warning"
			}
		},
		"tsdocMessageReporting": {
			"default": {
				"logLevel": "warning"
			}
		}
	}
}
```

最后使用 `typedoc` 生成文档

```js
typedoc --out docs src
```

在目录下会生成一个 `docs` 目录，打开 `index.html`

![microbundle](/engineering/docs.png)

## 参考

[TypeDoc](http://typedoc.org/api/)

[API-Extractor](https://api-extractor.com/pages/setup/invoking/)

[microbundle](https://github.com/developit/microbundle)