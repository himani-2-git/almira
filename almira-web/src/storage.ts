import { emptyData, isAlmiraData, normalizeData, type AlmiraData } from './types.ts'

const DB_NAME = 'almira-local'
const STORE_NAME = 'app'
const STATE_KEY = 'state'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function stateKey(ownerId?: string): string {
  return ownerId ? `account:${ownerId}` : STATE_KEY
}

export async function loadData(ownerId?: string): Promise<AlmiraData> {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const request = transaction.objectStore(STORE_NAME).get(stateKey(ownerId))
      request.onsuccess = () => {
        if (request.result !== undefined && !isAlmiraData(request.result)) { reject(new Error('Invalid local backup')); return }
        resolve(normalizeData(request.result ?? emptyData))
      }
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function saveData(data: AlmiraData, ownerId?: string): Promise<void> {
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(data, stateKey(ownerId))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } finally {
    db.close()
  }
}

export async function clearAccountCache(ownerId: string): Promise<void> {
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).delete(stateKey(ownerId))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } finally { db.close() }
}

export async function imageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a JPG, PNG or WebP image.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Choose an image smaller than 12 MB.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const maxSide = 1000
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not process this image.')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    URL.revokeObjectURL(url)
  }
}
