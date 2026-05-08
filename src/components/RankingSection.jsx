import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './RankingSection.module.css'

export default function RankingSection() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: recipes } = await supabase.from('recipes').select('title')
      if (recipes) {
        const counts = {}
        recipes.forEach(r => { counts[r.title] = (counts[r.title] || 0) + 1 })
        setData(
          Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        )
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const max = data[0]?.[1] ?? 1
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className={styles.section}>
      <button className={styles.toggleBtn} onClick={() => setIsOpen(o => !o)}>
        <h2 className={styles.title}>🏅 자주 만든 요리 랭킹</h2>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>›</span>
      </button>

      {isOpen && (
        loading ? (
          <p className={styles.msg}>불러오는 중...</p>
        ) : data.length === 0 ? (
          <p className={styles.msg}>아직 레시피가 없어요</p>
        ) : (
          <ul className={styles.list}>
            {data.map(([title, count], i) => (
              <li key={title} className={styles.item}>
                <span className={styles.rank}>
                  {i < 3 ? medals[i] : `${i + 1}`}
                </span>
                <span className={styles.name}>{title}</span>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className={styles.count}>{count}회</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
