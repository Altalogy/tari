const ObjectUtils = {
  /**
   * Is it the object?
   * @param {any} item
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isObject: (item: any): boolean => {
    return item && typeof item === 'object' && !Array.isArray(item)
  },

  /**
   * Make a deep merge of two or more objects
   * @param {any} target
   * @param {any[]} sources
   * @returns {any}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergeDeep: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...sources: any
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any => {
    if (!sources.length) return target
    const source = sources.shift()
    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      for (const key in source) {
        if (ObjectUtils.isObject(source[key])) {
          if (!target[key])
            Object.assign(target, {
              [key]: {},
            })
          ObjectUtils.mergeDeep(target[key], source[key])
        } else {
          Object.assign(target, {
            [key]: source[key],
          })
        }
      }
    }
    return ObjectUtils.mergeDeep(target, ...sources)
  },
}

export default ObjectUtils
