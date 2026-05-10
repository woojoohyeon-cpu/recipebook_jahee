import { useState } from 'react'
import styles from './MenuTab.module.css'

const CATEGORIES = ['국·찌개', '메인반찬', '기타반찬', '밥·면', '쌈·샐러드', '한상차림', '기타']

function fmtDate(s) {
  const d = new Date(s)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function MenuTab({ recipes, onSelect }) {
  const [tags, setTags] = useState([])
  const [inputVal, setInputVal] = useState('')

  const hitCount = (recipe) =>
    tags.length ? tags.filter(t => (recipe.ingredients ?? []).includes(t)).length : 0

  const addTags = (str) => {
    const newTags = str.split(',').map(s => s.trim()).filter(t => t && !tags.includes(t))
    if (newTags.length) setTags(prev => [...prev, ...newTags])
  }

  const removeTag = (t) => setTags(tags.filter(s => s !== t))

  const totalMatched = tags.length
    ? recipes.filter(r => hitCount(r) > 0).length
    : recipes.length

  return (
    <div>
      {/* 재료 검색 */}
      <div className={styles.searchWrap}>
        <p className={styles.searchLabel}>냉장고에서 찾기</p>
        <div className={styles.tagField} onClick={() => document.getElementById('menuTagInput').focus()}>
          {tags.map(t => (
            <span key={t} className={styles.chip}>
              {t}
              <button
                className={styles.chipRm}
                type="button"
                onClick={e => { e.stopPropagation(); removeTag(t) }}
              >×</button>
            </span>
          ))}
          <input
            id="menuTagInput"
            type="text"
            className={styles.tagInput}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault()
                addTags(inputVal)
                setInputVal('')
              }
            }}
            placeholder="재료 입력 후 Enter  예) 두부, 양파"
          />
        </div>
        <p className={styles.hint}>보유한 재료를 입력하면 만들 수 있는 요리를 찾아드려요</p>
        {tags.length > 0 && (
          <div className={styles.banner}>
            {totalMatched > 0
              ? `🍽️  「${tags.join('」·「')}」으(로) 만들 수 있는 요리 ${totalMatched}가지`
              : '일치하는 재료가 없어요. 다른 재료를 시도해보세요.'
            }
          </div>
        )}
      </div>

      {/* 메뉴판 섹션 */}
      <div className={styles.menuBody}>
        {tags.length > 0 && totalMatched === 0 && (
          <div className={styles.noMatch}>
            <p className={styles.noMatchIcon}>🥢</p>
            <p>해당 재료로 만들 수 있는 요리가 없어요</p>
            <p className={styles.noMatchSub}>다른 재료를 입력해보세요</p>
          </div>
        )}

        {CATEGORIES.map(cat => {
          const items = recipes.filter(r => r.category === cat)
          if (!items.length) return null

          const sorted = tags.length
            ? [...items].sort((a, b) => hitCount(b) - hitCount(a))
            : items
          const matched = tags.length ? sorted.filter(r => hitCount(r) > 0).length : items.length
          if (tags.length && matched === 0) return null

          return (
            <div key={cat} className={styles.catSec}>
              <div className={styles.catHd}>
                <span className={styles.catNm}>{cat}</span>
              </div>
              <hr className={styles.catRule} />

              {sorted.map(recipe => {
                const hc = hitCount(recipe)
                const searching = tags.length > 0
                return (
                  <div
                    key={recipe.id}
                    className={[
                      styles.row,
                      searching && hc > 0 ? styles.matched : '',
                      searching && hc === 0 ? styles.dimmed : '',
                    ].join(' ')}
                    onClick={() => onSelect(recipe)}
                  >
                    <div className={styles.thumb}>
                      {recipe.photo_url
                        ? <img src={recipe.photo_url} alt={recipe.title} loading="lazy" />
                        : '🍽️'
                      }
                    </div>
                    <div className={styles.detail}>
                      <div className={styles.nameLine}>
                        <span className={styles.name}>{recipe.title}</span>
                        <span className={styles.leader} />
                        <span className={styles.date}>{fmtDate(recipe.created_at)}</span>
                      </div>
                      <div className={styles.ingList}>
                        {(recipe.ingredients ?? []).map(ing => (
                          <span
                            key={ing}
                            className={`${styles.ing} ${tags.includes(ing) ? styles.ingHit : ''}`}
                          >{ing}</span>
                        ))}
                        {hc > 0 && <span className={styles.badge}>{hc}가지 매칭 ✓</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
