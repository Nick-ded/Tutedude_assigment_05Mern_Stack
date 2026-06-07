import React from 'react'
import useFetch from './hooks/useFetch'
import './App.css'

const API_URL = 'https://jsonplaceholder.typicode.com/photos?_limit=200'

const COLORS = [
  '#3b82f6', '#7c3aed', '#22c55e', '#ec4899',
  '#f97316', '#06b6d4', '#a3e635', '#f43f5e',
  '#8b5cf6', '#14b8a6', '#facc15', '#ef4444',
  '#3b82f6', '#6366f1', '#e879f9', '#0ea5e9',
  '#fb923c', '#4ade80', '#c084fc', '#38bdf8',
]

function getColor(id) {
  return COLORS[(id - 1) % COLORS.length]
}

function PhotoCard({ photo }) {
  return (
    <div className="card">
      {/* Square color block using padding-top trick */}
      <div className="card__img">
        <div
          className="card__img-inner"
          style={{ backgroundColor: getColor(photo.id) }}
        >
          <span className="card__size-label">600 x 600</span>
        </div>
      </div>
      <p className="card__title">{photo.title}</p>
    </div>
  )
}

function App() {
  const { data: photos, loading, error } = useFetch(API_URL)

  return (
    <div className="page">
      <h1 className="page-title">Photos</h1>

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      )}

      {error && <p className="error-msg">Error: {error}</p>}

      {!loading && !error && photos && (
        <div className="grid">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
