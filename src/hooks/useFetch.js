import { useState, useEffect, useCallback } from 'react'

/**
 * useFetch — custom hook for fetching data from an API URL.
 *
 * @param {string} url - The API endpoint to fetch from.
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: Function }}
 */
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!url) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const json = await response.json()
      setData(json)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Something went wrong while fetching data.')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export default useFetch
