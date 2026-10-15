export interface Storage {
  get<T>(key: string, fallback: T): Promise<T>
  set<T>(key: string, value: T): Promise<void>
}

const PREFIX = 'ruokalista:'

export const localStorageAdapter: Storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // tallennus voi epäonnistua yksityisessä selaustilassa
    }
  },
}

// Tätä käyttää koko sovellus. Vaihda tähän myöhemmin taustapalvelu.
export const storage: Storage = localStorageAdapter