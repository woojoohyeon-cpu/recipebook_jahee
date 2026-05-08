import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CategoryFilter from '../components/CategoryFilter'
import RecipeModal from '../components/RecipeModal'
import RankingSection from '../components/RankingSection'
import RecipeSlider from '../components/RecipeSlider'
import styles from './RecipeList.module.css'

const CATEGORIES = ['전체', '국·찌개', '메인반찬', '기타반찬', '밥·면', '쌈·샐러드', '한상차림', '기타']

export default function RecipeList() {
  const [recipes, setRecipes] = useState([])
  const [category, setCategory] = useState('전체')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    fetchRecipes()
  }, [category, debouncedSearch])

  const fetchRecipes = async () => {
    setLoading(true)
    let query = supabase.from('recipes').select('*').order('created_at', { ascending: false })
    if (category !== '전체') query = query.eq('category', category)
    if (debouncedSearch.trim()) query = query.ilike('title', `%${debouncedSearch.trim()}%`)
    const { data, error } = await query
    if (!error) setRecipes(data ?? [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>자희 쉐프의 레시피 회고록</h1>
        <div className={styles.headerActions}>
          <button onClick={handleLogout} className={styles.logoutBtn}>나가기</button>
        </div>
      </header>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="음식 이름으로 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.searchClear} onClick={() => setSearch('')}>×</button>
        )}
      </div>

      <RankingSection />

      <CategoryFilter categories={CATEGORIES} active={category} onChange={setCategory} />

      {loading ? (
        <div className={styles.state}><div className="loading-spinner" /></div>
      ) : recipes.length === 0 ? (
        <div className={styles.state}>
          <p className={styles.emptyIcon}>{search ? '🔍' : '🥢'}</p>
          <p className={styles.emptyText}>
            {search ? `"${search}" 검색 결과가 없어요` : '아직 레시피가 없어요'}
          </p>
          {!search && <p className={styles.emptyHint}>+ 버튼을 눌러 첫 요리를 기록해보세요!</p>}
        </div>
      ) : (
        <RecipeSlider
          key={`${category}|${debouncedSearch}`}
          recipes={recipes}
          onSelect={setSelectedIndex}
        />
      )}

      <button
        className={styles.fab}
        onClick={() => navigate('/upload')}
        aria-label="레시피 추가"
      >
        +
      </button>

      {selectedIndex !== null && (
        <RecipeModal
          recipes={recipes}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onDeleted={() => { fetchRecipes(); setSelectedIndex(null) }}
        />
      )}
    </div>
  )
}
