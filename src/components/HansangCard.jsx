import styles from './HansangCard.module.css'

export default function HansangCard({ recipe, onClick }) {
  const date = new Date(recipe.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.photo}>
        {recipe.photo_url ? (
          <img src={recipe.photo_url} alt={recipe.title} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>🍱</div>
        )}
        <span className={styles.badge}>한상차림</span>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{recipe.title}</h3>

        {recipe.side_dishes?.length > 0 && (
          <div className={styles.tags}>
            {recipe.side_dishes.map((dish, i) => (
              <span key={i} className={styles.tag}>{dish}</span>
            ))}
          </div>
        )}

        <p className={styles.date}>{date}</p>
      </div>
    </div>
  )
}
