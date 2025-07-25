import TagSet from "./TagSet.js"
import { isFunction, isNumber, getType, isArray } from "is-what"

type CacheDriver = "local" | "session"

const Default: Required<StoreOptions> = {
  type: "local",
  expire: 0,
  prefix: "",
  serialize: JSON.stringify,
  deserialize: JSON.parse,
}

interface StoreOptions {
  type?: CacheDriver
  expire?: number
  prefix?: string
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}

class Store {
  #store: Storage
  #config: Required<StoreOptions>

  constructor(config: StoreOptions = {}) {
    this.#config = {
      ...Default,
      ...config,
    }

    this.#store = window[`${this.#config.type}Storage`] as Storage
  }

  create(config: StoreOptions = {}) {
    return new Store(config)
  }

  /**
   * 获取缓存对象句柄
   * @returns 缓存对象句柄
   */
  handler() {
    return this.#store
  }

  #getKey(key: string): string {
    return this.#config.prefix + key
  }

  set(key: string, value: any, expire: number | null = null): boolean {
    const cacheValue = {
      value,
      expire:
        expire || this.#config.expire !== 0
          ? Date.now() + (expire || this.#config.expire) * 1000
          : 0,
    }
    try {
      this.#store.setItem(this.#getKey(key), this.#config.serialize(cacheValue))

      return true
    } catch (_error) {
      return false
    }
  }

  has(key: string): boolean {
    return this.#store.getItem(this.#getKey(key)) !== null
  }

  get(key: string, defaultValue: any = null) {
    const cacheValue = this.#store.getItem(this.#getKey(key))
    if (cacheValue) {
      const parsedValue = this.#config.deserialize(cacheValue)
      if (parsedValue.expire === 0 || parsedValue.expire >= Date.now()) {
        return parsedValue.value
      }
      this.delete(key)
      return null
    } else {
      if (isFunction(defaultValue)) {
        return Reflect.apply(defaultValue, null, [])
      }
      return defaultValue
    }
  }

  /**
   * 如果key不存在则会返回false,存在的话删除直接返回true
   * @param key
   */
  delete(key: string) {
    if (!this.has(key)) {
      return false
    }
    this.#store.removeItem(this.#getKey(key))
    return true
  }

  clear(): boolean {
    this.#store.clear()
    return true
  }

  remember(
    key: string,
    value: any | (() => any),
    expire: number | null = null,
  ): any {
    const cachedValue = this.get(key)
    if (cachedValue !== null) {
      return cachedValue
    }

    if (isFunction(value)) {
      //允许第二个参数是一个函数
      const computedValue = value()
      this.set(key, computedValue, expire)
      return computedValue
    }
    this.set(key, value, expire)
    return value
  }

  inc(key: string, step: number = 1) {
    const cachedValue = this.get(key)

    if (!isNumber(cachedValue)) {
      throw new Error(
        `Unsupported operand types: ${getType(cachedValue)} + int`,
      )
    }
    this.set(key, cachedValue + step)
    //再查询返回出来
    return this.get(key)
  }

  dec(key: string, step: number = 1) {
    return this.inc(key, -step)
  }

  tag(tag: string | string[]) {
    return new TagSet(tag, this)
  }

  /**
   * 获取并删除缓存
   * @param key 缓存key
   * @param defaultValue
   * @returns
   */
  pull(key: string, defaultValue: any = null) {
    const value = this.get(key, defaultValue)
    this.delete(key)
    return value
  }

  push(key: string, value: any) {
    let item = this.get(key, [])

    if (!isArray(item)) {
      throw new Error(`only array cache can be push`)
    }

    item.push(value)

    if (item.length > 1000) {
      item.shift() // 删除最旧的
    }

    // 去重（保留第一次出现的顺序）
    item = [...new Set(item)]

    this.set(key, item)
  }

  switch(type: CacheDriver) {
    return new Store({
      type,
      expire: this.#config.expire,
      prefix: this.#config.prefix,
      serialize: this.#config.serialize,
      deserialize: this.#config.deserialize,
    })
  }

  /**
   * 获取标签的缓存标识列表
   * @param tag
   */
  getTagItems(tag: string) {
    return this.get(tag, [])
  }
}

// 创建 store 实例
const storeInstance = new Store()

function store(...args: [] | [string] | [string, any]) {
  if (args.length === 0) {
    return storeInstance
  } else if (args.length === 1) {
    return storeInstance.get(args[0])
  } else if (args.length === 2 && args[1] === null) {
    return storeInstance.delete(args[0])
  } else {
    return storeInstance.set(...args)
  }
}

type StoreFunctionProxy = {
  (...args: [] | [string] | [string, any] | [string, any, number]): any
} & StoreType

const proxyStore = new Proxy(store, {
  get(_, prop: string) {
    if (typeof storeInstance[prop as keyof Store] === "function") {
      return (...args: any[]) => {
        return (storeInstance[prop as keyof Store] as Function)(...args)
      }
    }
    throw new Error(`Method "${prop}" does not exist on Store`)
  },
  apply(_, __, args: [string] | [string, any]) {
    return _(...args)
  },
}) as StoreFunctionProxy

export default proxyStore

export type StoreType = InstanceType<typeof Store>
