// src/hooks/useOfflineCheckin.js
import { useState, useEffect } from 'react'
import { postRequest } from '../API/API'

export function useOfflineCheckin() {
  const [isOnline, setIsOnline] = useState(
    navigator.onLine
  )

  // ✅ Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncOfflineData() // auto sync!
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener(
      'online', handleOnline
    )
    window.addEventListener(
      'offline', handleOffline
    )

    return () => {
      window.removeEventListener(
        'online', handleOnline
      )
      window.removeEventListener(
        'offline', handleOffline
      )
    }
  }, [])

  // ✅ Save to localStorage when offline
  const saveCheckin = async (data) => {
    if (isOnline) {
      // Online → save directly to DB
      try {
        console.log("Sending data:", data)
        const response = await postRequest(
          'auth/checkin', data
        )
        return { success: true, online: true }
      } catch (error) {
        // If request fails save offline
        saveToLocal(data)
        return { success: true, online: false }
      }
    } else {
      // Offline → save to localStorage
      saveToLocal(data)
      return { success: true, online: false }
    }
  }

  // ✅ Save to localStorage
  const saveToLocal = (data) => {
    const existing = JSON.parse(
      localStorage.getItem('offline_checkins')
      || '[]'
    )
    existing.push({
      ...data,
      id: Date.now(),
      savedAt: new Date().toISOString()
    })
    localStorage.setItem(
      'offline_checkins',
      JSON.stringify(existing)
    )
    console.log('Saved offline:', existing.length)
  }

  // ✅ Sync when back online
  const syncOfflineData = async () => {
    const offline = JSON.parse(
      localStorage.getItem('offline_checkins')
      || '[]'
    )

    if (offline.length === 0) return

    console.log('Syncing', offline.length, 'records')

    const failed = []

    for (const item of offline) {
      try {
        await postRequest(
          'auth/checkin', item
        )
        alert('Data is sync to database')
      } catch (error) {
        failed.push(item) // keep failed ones
      }
    }

    // Keep only failed ones
    localStorage.setItem(
      'offline_checkins',
      JSON.stringify(failed)
    )

    console.log('Sync complete!')
  }

  return {
    isOnline,
    saveCheckin,
    syncOfflineData
  }
}