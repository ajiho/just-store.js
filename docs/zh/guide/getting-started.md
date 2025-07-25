---
sidebar: true
---

# 介绍

<div class="badge">

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![npm](https://img.shields.io/npm/v/just-store.js)](https://www.npmjs.com/package/just-store.js)
[![cdn version](https://data.jsdelivr.com/v1/package/npm/just-store.js/badge)](https://www.jsdelivr.com/package/npm/just-store.js)
[![codecov](https://codecov.io/gh/ajiho/just-store.js/graph/badge.svg?token=G2P1AI238H)](https://codecov.io/gh/ajiho/just-store.js)
[![Test](https://img.shields.io/github/actions/workflow/status/ajiho/just-store.js/test.yml?label=Unit%20Test&branch=main)](https://github.com/ajiho/just-store.js/actions/workflows/test.yml)

</div>

---

让LocalStorage和SessionStorage的API更加优雅和强大,灵感来源于php框架[thinkphp](https://github.com/top-think/framework)的[缓存](https://doc.thinkphp.cn/v8_0/caches.html)部分,保持高度相似的API

## 安装

::: code-group

```sh [npm]
$ npm add -D just-store.js
```

```sh [pnpm]
$ pnpm add -D just-store.js
```

```sh [yarn]
$ yarn add -D just-store.js
```

```sh [bun]
$ bun add -D just-store.js
```

```html [CDN]
<script src="https://unpkg.com/just-store.js@latest/dist/foo.browser.min.js"></script>
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/just-store.js@latest/dist/foo.browser.min.js"></script>
```

:::

::: tip
如果你是通过CDN链接直接在页面想锁定到特定版本，你应该更换@latest 到指定版本(例如@0.0.1),您可以在[unpkg](https://unpkg.com/just-store.js@latest/dist/),[jsdelivr](https://cdn.jsdelivr.net/npm/just-store.js@latest/dist/)找到可用模块的完整列表
:::

## 基本用法

```js
// 这里以import为例导入
import store from "just-store.js"

//助手函数用法
store("name", "jack") // 设置缓存
store("name", "jack", 3600) //设置缓存数据,3600秒后过期
store("name") //获取缓存数据
store("name", null) //删除缓存数据

// 明确的方法调用
store.set("name", "jack") // 设置缓存
store.set("name", "jack", 3600) // 设置缓存,3600秒过期

store.get("name") //获取缓存数据
store.delete("name") //删除缓存数据

// ... 更多方法参考下面的API部分
```

> [!CAUTION] 提示
> 此时你可能产生疑问`store`它用的是LocalStorage还是SessionStorage?🤔你可以查看[默认配置参数](/reference/options#默认配置),如果默认的缓存驱动一开始就不满足您的需求，您可以查看[切换缓存类型](/guide/getting-started#切换缓存类型)以及[自定义缓存配置](/guide/getting-started#自定义缓存配置)这部分的文档

## API

### 设置缓存

```js
store.set("name", $value)
// 缓存在3600秒之后过期
store.set("name", $value, 3600)
```

如果设置成功返回true，否则返回false。

### 缓存自增

针对数值类型的缓存数据，可以使用自增操作，例如：

```js
store.set("name", 1)
// name自增（步进值为1）
store.inc("name")
// name自增（步进值为3）
store.inc("name", 3)
```

> [!WARNING]
> 只能对数字或者浮点型数据进行自增和自减操作。

### 缓存自减

针对数值类型的缓存数据，可以使用自减操作，例如：

```js
// name自减（步进值为1）
store.dec("name")
// name自减（步进值为3）
store.dec("name", 3)
```

### 获取缓存

获取缓存数据可以使用：

```js
store.get("name")
```

如果`name` 值不存在，则默认返回 `null` 。

支持指定默认值，例如：

```js
store.get("name", "")
```

表示如果`name`值不存在，则返回空字符串。

支持传入闭包作为默认值获取

```js
store.get("name", function () {
  // 动态返回数据
})
```

### 追加一个缓存数据

如果缓存数据是一个数组，可以通过`push`方法追加一个数据。

```js
store.set("name", [1, 2, 3])
store.push("name", 4)
store.push("name", 4)
store.push("name", 4)
store.push("name", 5)
store.get("name") // [1,2,3,4,5]
```

### 删除缓存

```js
store.delete("name")
```

### 获取并删除缓存

```js
store.pull("name")
```

如果`name`值不存在，则返回`null`，支持指定默认值

```js
store.pull("name", "")
```

### 清空缓存

```js
store.clear()
```

### 不存在则写入缓存数据后返回

```js
store.remember("start_time", Date.now())
```

如果start_time缓存数据不存在，则会设置缓存数据为当前时间。
第二个参数可以使用闭包方法获取缓存数据，并支持依赖注入。

```js
store.remember("start_time", function () {
  return Date.now()
})
```

remember方法的第三个参数可以设置缓存的有效期。

### 缓存标签

支持给缓存数据打标签，例如：

```js
store.tag('tag')->set('name1','value1');
store.tag('tag')->set('name2','value2');

// 清除tag标签的缓存数据
store.tag('tag')->clear();
```

缓存标签不会改变缓存的读取操作，所以获取方式依然是：

```js
store.get("name1")
```

并支持同时指定多个缓存标签操作

```js
store.tag(['tag1', 'tag2'])->set('name1', 'value1');
store.tag(['tag1', 'tag2'])->set('name2', 'value2');

// 清除多个标签的缓存数据
store.tag(['tag1','tag2'])->clear();
```

可以追加某个缓存标识到标签

```js
store.tag('tag')->append('name3');
```

获取标签的缓存标识列表

```js
store.getTagItems("tag")
```

### 获取缓存对象

可以获取缓存对象，并且调用驱动类的高级方法，例如：

```js
// 获取缓存对象句柄
const handler = store.handler()
```

### 助手函数

在TP框架中缓存它提供了助手函数的用法,这里也提供了函数的用法,没有额外的导入,直接把`store`当作函数来用就可以了

```js
// 设置缓存数据
store("name", $value, 3600)
// 获取缓存数据
console.log(store("name"))
// 删除缓存数据
store("name", null)
// 返回缓存对象实例
const store = store()
```

### 切换缓存类型

没有指定缓存类型的话，默认是`LocalStorage`，可以动态切换

```js
// 使用LocalStorage缓存
store.set('name','value',3600);
store.get('name');

// 使用SessionStorage缓存
store.switch('sesson')->set('name','value',3600);
store.switch('sesson')->get('name');

// 切换到LocalStorage缓存
store.switch('local')->set('name','value',3600);
store.switch('local')->get('name');
```

> [!WARNING]
> 在TP框架中它[切换缓存](https://doc.thinkphp.cn/v8_0/caches.html#%E5%88%87%E6%8D%A2%E7%BC%93%E5%AD%98%E7%B1%BB%E5%9E%8B)类型的方法名称是`store`,由于`just-store.js`的包名就是`store`因此为了避免混乱换了一个更有清晰的方法名称`switch`

如果要返回当前缓存类型对象的句柄，可以使用

```js
// 获取SessionStorage原始对象
const sessionStorage = store.store('session')->handler();
```

### 自定义缓存配置

```js
const mystore = store.create({ type: "session", prefix: "my_", expire: 10 }) //创建自己的Store实例

// 还是相同方式调用方法
mystore.set("name", "value", 3600)
```
