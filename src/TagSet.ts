import type { StoreType } from "./index.js"

/**
 *  标签集合
 */
class TagSet {
  #tag: string | string[]
  #store

  constructor(tag: string | string[], store: StoreType) {
    //标签的缓存Key
    this.#tag = Array.isArray(tag) ? tag : [tag]

    //缓存句柄
    this.#store = store
  }

  set(key: string, value: any, expire: number | null = null) {
    this.append(key)
    return this.#store.set(key, value, expire)
  }

  append(key: string) {
    for (const tag of this.#tag) {
      //读取标签
      const tagItems = this.#store.getTagItems(tag)

      //判断标签是否在数组里,不再就直接加入
      if (!tagItems.includes(key)) {
        //加入数组
        tagItems.push(key)

        //重新设置回去
        this.#store.set(tag, tagItems)
      }
    }
    return null
  }

  clear() {
    for (const tag of this.#tag) {
      const tagItems = this.#store.getTagItems(tag)

      //分别遍历删除所有的缓存
      for (const cacheKey of tagItems) {
        this.#store.delete(cacheKey)
      }
      //再删除标签本身
      this.#store.delete(tag)
    }
    return true
  }
}

export default TagSet
