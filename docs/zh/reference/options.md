# 选项

| 参数        | 描述                                |
| ----------- | ----------------------------------- |
| type        | 缓存类型: `local`、`session`        |
| expire      | 缓存有效期 （默认为0 表示永久缓存） |
| prefix      | 缓存前缀（默认为空）                |
| serialize   | 缓存序列化方法                      |
| deserialize | 缓存反序列化方法                    |

## 默认配置

```js
{
  type: "local",
  expire: 0,
  prefix: "",
  serialize: JSON.stringify,
  deserialize: JSON.parse,
}
```
