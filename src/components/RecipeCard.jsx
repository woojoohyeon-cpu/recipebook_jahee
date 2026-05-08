import styles from './RecipeCard.module.css'

const CATEGORY_EMOJI = {
  '국·찌개': '🍲',
  '메인반찬': '🥩',
  '소반찬': '🥬',
  '밥·면': '🍜',
  '쌈·샐러드': '🥗',
  '기타': '🍽️',
}

export default function RecipeCard({ recipe, onClick }) {
  const emoji = CATEGORY_EMOJI[recipe.category] ?? '🍽️'
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
          <div className={styles.placeholder}>{emoji}</div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{recipe.title}</p>
        <p className={styles.date}>{date}</p>
      </div>
    </div>
  )
}
