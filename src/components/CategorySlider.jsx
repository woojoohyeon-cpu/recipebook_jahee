import { useState, useRef, useEffect } from 'react'
import styles from './CategorySlider.module.css'

function visibleCount() {
  const w = window.innerWidth
  if (w >= 1024) return 5
  if (w >= 768) return 4
  if (w >= 520) return 3
  return 2
}

function fmtDate(s) {
  const d = new Date(s)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function CategorySlider({ category, recipes, onSelect }) {
  const [idx, setIdx] = useState(0)
  const [vc, setVc] = useState(visibleCount())
  const trackRef = useRef(null)
  const touchXRef = useRef(null)

  useEffect(() => {
    const update = () => setVc(visibleCount())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const maxIdx = Math.max(0, recipes.length - vc)

  const slide = (dir) => {
    setIdx(prev => Math.max(0, Math.min(prev + dir, maxIdx)))
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track || !track.children.length) return
    const cardW = track.children[0].offsetWidth
    track.style.transform = `translateX(-${idx * (cardW + 10)}px)`
  }, [idx, vc])

  if (!recipes.length) return null

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.catName}>{category}</h3>
        {maxIdx > 0 && (
          <div className={styles.arrows}>
            <button className={styles.arrow} onClick={() => slide(-1)} disabled={idx === 0}>‹</button>
            <button className={styles.arrow} onClick={() => slide(1)} disabled={idx >= maxIdx}>›</button>
          </div>
        )}
      </div>

      <div
        className={styles.outer}
        onTouchStart={e => { touchXRef.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchXRef.current === null) return
          const dx = touchXRef.current - e.changedTouches[0].clientX
          if (Math.abs(dx) > 40) slide(dx > 0 ? 1 : -1)
          touchXRef.current = null
        }}
      >
        <div className={styles.track} ref={trackRef}>
          {recipes.map(recipe => (
            <div key={recipe.id} className={styles.card} onClick={() => onSelect(recipe)}>
              <div className={styles.photo}>
                {recipe.photo_url
                  ? <img src={recipe.photo_url} alt={recipe.title} loading="lazy" />
                  : <div className={styles.noPhoto}>🍽️</div>
                }
              </div>
              <div className={styles.info}>
                <div className={styles.cardTitle}>{recipe.title}</div>
                <div className={styles.cardDate}>{fmtDate(recipe.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {maxIdx > 0 && (
        <div className={styles.pips}>
          {Array.from({ length: maxIdx + 1 }, (_, i) => (
            <button
              key={i}
              className={`${styles.pip} ${i === idx ? styles.pipOn : ''}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
