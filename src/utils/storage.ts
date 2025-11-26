import { useState } from 'react'

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : defaultValue
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
}

export const useStorage = <T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] => {
  const storedValue = storage.get<T>(key, defaultValue)
  const [value, setValue] = useState<T>(storedValue)

  const updateValue = (newValue: T): void => {
    setValue(newValue)
    storage.set<T>(key, newValue)
  }

  return [value, updateValue]
}
