import styles from './RecipeCard.module.css'

export default function RecipeCard({ recipe, onClick }) {
  const date = new Date(recipe.created_at).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.photo}>
        {recipe.photo_url
          ? <img src={recipe.photo_url} alt={recipe.title} loading="lazy" />
          : <div className={styles.placeholder}>🍽️</div>
        }
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{recipe.title}</p>
        {recipe.side_dishes?.length > 0 && (
          <div className={styles.tags}>
            {recipe.side_dishes.slice(0, 3).map((d, i) => (
              <span key={i} className={styles.tag}>{d}</span>
            ))}
          </div>
        )}
        <p className={styles.date}>{date}</p>
      </div>
    </div>
  )
}
