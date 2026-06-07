import React from 'react'
import './Spinner.css'

function Spinner() {
  return (
    <div className="spinner-wrapper" aria-label="Loading" role="status">
      <div className="spinner" />
      <p className="spinner-text">Fetching products…</p>
    </div>
  )
}

export default Spinner
