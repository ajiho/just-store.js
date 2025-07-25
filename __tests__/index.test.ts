import { expect, test, describe, beforeEach, it, vi, afterEach } from "vitest"
import store from "../src/index.ts"

describe("Store 基础功能", () => {
  let originalSetItem: typeof Storage.prototype.setItem

  beforeEach(() => {
    store.clear() // 每个测试前清空缓存
    vi.useFakeTimers() // 使用假的计时器
    originalSetItem = Storage.prototype.setItem
  })

  afterEach(() => {
    Storage.prototype.setItem = originalSetItem
    vi.restoreAllMocks()
  })

  it("设置缓存", () => {
    store.set("name", "jack")
    expect(store.get("name")).toBe("jack")
  })

  it("设置缓存-支持过期时间", () => {
    store.set("name", "jack", 1)
    expect(store.get("name")).toBe("jack")

    // 前进 1001 毫秒，模拟过期
    vi.advanceTimersByTime(1001)
    // 再次读取，应返回 null（已过期并删除）
    expect(store.get("name")).toBe(null)
  })

  it("触发 setItem 抛出异常并覆盖 catch", () => {
    // 模拟 setItem 抛出异常
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("模拟 setItem 失败")
    })

    const result = store.set("testKey", "testValue")

    expect(result).toBe(false)
  })

  it("缓存自增", () => {
    store.set("count", 1)
    expect(store.inc("count")).toBe(2)

    //应该抛出非数字类型的错误
    store.set("count", "hello")
    expect(() => store.inc("count")).toThrowError(
      "Unsupported operand types: String + int",
    )
  })

  it("缓存自减", () => {
    store.set("count", 4)
    expect(store.dec("count", 3)).toBe(1)
  })

  it("缓存获取支持默认值", () => {
    expect(store.get("name")).toBe(null)
    expect(store.get("name", "default")).toBe("default")
    expect(typeof store.get("name", () => "fn")).toBe("string")
  })

  it("push:针对数组的情况追加数据", () => {
    store.set("arr", [1, 2])
    store.push("arr", 3)
    store.push("arr", 3)
    store.push("arr", 4)
    // 获取不会重复的数据
    expect(store.get("arr")).toEqual([1, 2, 3, 4])

    // 非数组类型的数据异常
    store.set("arr", "arr")
    expect(() => store.push("arr", 3)).toThrowError(
      "only array cache can be push",
    )

    // 如果数组超过1000个项，则应删除最旧的项
    const key = "test-push-overflow"

    // 先设置一个包含 1000 项的缓存
    store.set(
      key,
      Array.from({ length: 1000 }, (_, i) => i),
    )

    // push 第 1001 项
    store.push(key, 1000)

    const result = store.get(key)

    expect(result.length).toBe(1000) // 长度应该还是 1000
    expect(result[0]).toBe(1) // 最旧的 0 被移除了
    expect(result.includes(1000)).toBe(true) // 新添加的在里面
  })

  it("删除数据", () => {
    store.set("name", "hello")
    store.delete("name")
    expect(store.get("name")).toBe(null)
  })

  it("获取并删除缓存", () => {
    store.set("name", "rose")
    expect(store.pull("name")).toBe("rose")
    expect(store.get("name")).toBe(null)
  })

  it("清空所有的缓存", () => {
    store.set("name", "jack")
    store.set("name2", "rose")

    store.clear()

    expect(store.get("name")).toBe(null)
    expect(store.get("name2")).toBe(null)
  })

  it("不存在则写入缓存数据后返回", () => {
    const time = Date.now()
    const val = store.remember("time", time)
    expect(val).toBe(time)
    expect(store.get("time")).toBe(time)

    const val2 = store.remember("time", 9999)
    expect(val2).toBe(time) // 不会覆盖

    // 支持函数
    store.remember("fn", function () {
      return "fn"
    })
    expect(store.get("fn")).toBe("fn")
  })

  it("tag 操作:set + clear + getTagItems", () => {
    store.tag("group1").set("a", 1)
    store.tag("group1").set("b", 2)
    store.tag("group1").append("c")

    expect(store.get("a")).toBe(1)
    expect(store.getTagItems("group1")).toEqual(
      expect.arrayContaining(["a", "b", "c"]),
    )

    store.tag("group1").clear()
    expect(store.get("a")).toBe(null)
    expect(store.get("b")).toBe(null)
    expect(store.get("c")).toBe(null)
  })

  it("支持多个标签同时操作", () => {
    store.tag(["t1", "t2"]).set("k1", 123)
    store.tag(["t1", "t2"]).set("k2", 456)
    expect(store.get("k1")).toBe(123)

    store.tag("t1").clear()
    expect(store.get("k1")).toBe(null)
    expect(store.get("k2")).toBe(null)
  })

  it("switch 切换缓存类型", () => {
    const local = store.switch("local")
    const session = store.switch("session")

    local.set("name", "local")
    session.set("name", "session")

    expect(local.get("name")).toBe("local")
    expect(session.get("name")).toBe("session")
  })

  it("create 创建自定义实例", () => {
    const newStore = store.create({ prefix: "my_", expire: 2 })
    newStore.set("key", "val")
    expect(localStorage.getItem("my_key")).toContain("val")
  })

  it("助手函数调用方式", () => {
    store("x", "y", 100)
    expect(store("x")).toBe("y")

    store("x", null)
    expect(store("x")).toBe(null)

    expect(store()).toBeInstanceOf(Object)
  })

  it("获取缓存对象实例", () => {
    const storage = store.handler()
    expect(storage).toBeInstanceOf(Object)
  })

  it("调用不存在的方法应该抛出错误", () => {
    expect(() => {
      // @ts-expect-error 用于绕过 TypeScript 类型检查
      store.ccb()
    }).toThrowError('Method "ccb" does not exist on Store')
  })
})
