import styles from './CategoryFilter.module.css'

export default function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.btn} ${active === cat ? styles.active : ''}`}
            onClick={() => onChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
