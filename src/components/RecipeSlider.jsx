import { useState, useEffect, useRef } from 'react'
import styles from './RecipeSlider.module.css'

const PEEK = 62 // px visible from each edge for ±1 card

export default function RecipeSlider({ recipes, onSelect }) {
  const [current, setCurrent] = useState(0)
  const [touchStartX, setTouchStartX] = useState(null)
  const [cw, setCw] = useState(0)
  const outerRef = useRef(null)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const update = () => setCw(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (recipes.length === 0) return null

  const SCALE1 = 0.83
  const cardW = cw > 0 ? Math.min(cw * 0.58, 280) : 218
  // ±1 card center = screen_center + offset, peek = screen_right - (±1_left_edge)
  // left_edge = center - halfScaled → offset = screen_w/2 - PEEK + halfScaled
  const offset1 = cw > 0 ? cw / 2 - PEEK + (cardW * SCALE1 / 2) : 208
  const stageH = cardW * 4 / 3 + 72

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
    if (d > 1) return null
    const sign = diff > 0 ? 1 : -1
    const tx = d === 0
      ? 'translateX(-50%)'
      : `translateX(calc(-50% + ${sign * offset1}px))`
    return {
      transform: `${tx} scale(${d === 0 ? 1 : SCALE1})`,
      opacity: d === 0 ? 1 : 0.72,
      zIndex: 3 - d,
    }
  }

  return (
    <div
      className={styles.outer}
      ref={outerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.stage} style={{ height: stageH }}>
        {recipes.map((recipe, idx) => {
          const diff = idx - current
          const cardStyle = getStyle(diff)
          if (!cardStyle) return null
          return (
            <div
              key={recipe.id}
              className={styles.item}
              style={{ ...cardStyle, width: `${cardW}px` }}
              onClick={() => diff === 0 ? onSelect(idx) : setCurrent(idx)}
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
