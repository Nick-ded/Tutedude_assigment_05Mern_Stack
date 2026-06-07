import React from 'react'
import './ProductCard.css'

/**
 * ProductCard — displays a single product from the API.
 */
function ProductCard({ product }) {
  const { title, price, description, category, images } = product

  // Safely get the first image URL
  const imageUrl = Array.isArray(images) && images.length > 0
    ? images[0].replace(/["\[\]]/g, '')
    : 'https://placehold.co/300x200?text=No+Image'

  return (
    <div className="product-card">
      <div className="product-card__image-wrapper">
        <img
          src={imageUrl}
          alt={title}
          className="product-card__image"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x200?text=No+Image'
          }}
        />
        <span className="product-card__category">
          {category?.name ?? 'Uncategorized'}
        </span>
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">{title}</h3>
        <p className="product-card__description">
          {description?.length > 100
            ? description.slice(0, 100) + '…'
            : description}
        </p>
        <div className="product-card__footer">
          <span className="product-card__price">${price}</span>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
