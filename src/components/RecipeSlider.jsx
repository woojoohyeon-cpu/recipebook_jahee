import { useState } from 'react'
import styles from './RecipeSlider.module.css'

export default function RecipeSlider({ recipes, onSelect }) {
  const [current, setCurrent] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)

  if (recipes.length === 0) return null

  const goPrev = () => current > 0 && setCurrent(c => c - 1)
  const goNext = () => current < recipes.length - 1 && setCurrent(c => c + 1)

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX)
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev()
    setTouchStartX(null)
  }

  const getStyle = (diff) => {
    const d = Math.abs(diff)
    if (d > 2) return null
    const SCALES   = [1,    0.83, 0.67]
    const OPACITY  = [1,    0.74, 0.40]
    const BLUR     = ['none', 'none', 'blur(2.5px)']
    const OFFSET   = [0,    65,   125] // vw
    const sign = diff > 0 ? 1 : -1
    const tx = d === 0
      ? 'translateX(-50%)'
      : `translateX(calc(-50% + ${sign * OFFSET[d]}vw))`
    return {
      transform: `${tx} scale(${SCALES[d]})`,
      opacity: OPACITY[d],
      filter: BLUR[d],
      zIndex: 5 - d * 2,
    }
  }

  return (
    <div
      className={styles.outer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.stage}>
        {recipes.map((recipe, idx) => {
          const diff = idx - current
          const style = getStyle(diff)
          if (!style) return null
          const isActive = diff === 0

          return (
            <div
              key={recipe.id}
              className={styles.item}
              style={style}
              onClick={() => isActive ? onSelect(idx) : setCurrent(idx)}
            >
              <div className={styles.photo}>
                {recipe.photo_url
                  ? <img src={recipe.photo_url} alt={recipe.title} loading="lazy" />
                  : <div className={styles.placeholder}>🍽️</div>
                }
              </div>
              <div className={styles.info}>
                <p className={styles.name}>{recipe.title}</p>
                {recipe.side_dishes?.length > 0 && (
                  <div className={styles.tags}>
                    {recipe.side_dishes.slice(0, 3).map((d, i) => (
                      <span key={i} className={styles.tag}>{d}</span>
                    ))}
                  </div>
                )}
                <p className={styles.date}>
                  {new Date(recipe.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {recipes.length > 1 && (
        <div className={styles.navRow}>
          <button className={styles.arrow} onClick={goPrev} disabled={current === 0}>‹</button>

          <div className={styles.dotWrap}>
            {recipes.length <= 9 ? (
              recipes.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.dotOn : ''}`}
                  onClick={() => setCurrent(i)}
                />
              ))
            ) : (
              <span className={styles.counter}>{current + 1} / {recipes.length}</span>
            )}
          </div>

          <button className={styles.arrow} onClick={goNext} disabled={current === recipes.length - 1}>›</button>
        </div>
      )}
    </div>
  )
}
