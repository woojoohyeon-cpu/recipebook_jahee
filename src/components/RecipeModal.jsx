import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './RecipeModal.module.css'

export default function RecipeModal({ recipes, initialIndex, onClose, onDeleted }) {
  const [idx, setIdx] = useState(initialIndex)
  const recipe = recipes[idx]
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const touchStartX = useRef(null)
  const sheetRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setConfirmDelete(false)
    if (sheetRef.current) sheetRef.current.scrollTop = 0
  }, [idx])

  const goPrev = () => { if (idx > 0) setIdx(i => i - 1) }
  const goNext = () => { if (idx < recipes.length - 1) setIdx(i => i + 1) }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      diff > 0 ? goNext() : goPrev()
    }
    touchStartX.current = null
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error } = await supabase.from('recipes').delete().eq('id', recipe.id)
    if (!error) { onDeleted(); onClose() }
    else setDeleting(false)
  }

  const zoomIn = () => setZoom(z => Math.min(+(z + 0.5).toFixed(1), 3))
  const zoomOut = () => setZoom(z => Math.max(+(z - 0.5).toFixed(1), 0.5))
  const rotateL = () => setRotation(r => (r - 90 + 360) % 360)
  const rotateR = () => setRotation(r => (r + 90) % 360)
  const reset = () => { setZoom(1); setRotation(0) }

  const date = new Date(recipe.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.sheet} ref={sheetRef}>
        <div className={styles.handle} />

        <div className={styles.headerBar}>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
          {recipes.length > 1 && (
            <span className={styles.counter}>{idx + 1} / {recipes.length}</span>
          )}
          <button
            className={styles.editBtn}
            onClick={() => { onClose(); navigate(`/edit/${recipe.id}`) }}
          >
            ✎ 수정
          </button>
        </div>

        <div
          className={styles.photoWrap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.photoInner}
            style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
          >
            {recipe.photo_url
              ? <img src={recipe.photo_url} alt={recipe.title} />
              : <div className={styles.noPhoto}>📷</div>
            }
          </div>

          {idx > 0 && (
            <button className={`${styles.navBtn} ${styles.navPrev}`} onClick={goPrev}>‹</button>
          )}
          {idx < recipes.length - 1 && (
            <button className={`${styles.navBtn} ${styles.navNext}`} onClick={goNext}>›</button>
          )}

          <div className={styles.controls}>
            <button onClick={rotateL} title="왼쪽 회전">↺</button>
            <button onClick={rotateR} title="오른쪽 회전">↻</button>
            <button onClick={zoomIn} title="확대">＋</button>
            <button onClick={zoomOut} title="축소">－</button>
            {(zoom !== 1 || rotation !== 0) && (
              <button onClick={reset} title="초기화">⊙</button>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <h2 className={styles.title}>{recipe.title}</h2>

          <div className={styles.meta}>
            <span className={styles.catBadge}>{recipe.category}</span>
            <span className={styles.date}>{date}</span>
          </div>

          {recipe.ingredients?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🥕 재료</h3>
              <ul className={styles.ingredientList}>
                {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
              </ul>
            </div>
          )}

          {recipe.side_dishes?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🍽 반찬 구성</h3>
              <div className={styles.sideTags}>
                {recipe.side_dishes.map((d, i) => (
                  <span key={i} className={styles.sideTag}>{d}</span>
                ))}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`${styles.deleteBtn} ${confirmDelete ? styles.deleteConfirm : ''}`}
            >
              {deleting ? '삭제 중...' : confirmDelete ? '⚠️ 정말 삭제할게요' : '🗑 삭제'}
            </button>
            {confirmDelete && !deleting && (
              <button onClick={() => setConfirmDelete(false)} className={styles.cancelBtn}>취소</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
