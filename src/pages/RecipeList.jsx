import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CategorySlider from '../components/CategorySlider'
import MenuTab from '../components/MenuTab'
import RecipeModal from '../components/RecipeModal'
import styles from './RecipeList.module.css'

const CATEGORIES = ['국·찌개', '메인반찬', '기타반찬', '밥·면', '쌈·샐러드', '한상차림', '기타']

export default function RecipeList() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('gallery')
  const [selectedIndex, setSelectedIndex] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchRecipes() }, [])

  const fetchRecipes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setRecipes(data ?? [])
    setLoading(false)
  }

  const handleSelect = (recipe) => {
    const idx = recipes.findIndex(r => r.id === recipe.id)
    if (idx !== -1) setSelectedIndex(idx)
  }

  const handleLogout = async () => { await supabase.auth.signOut() }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.headerSub}>Chef Jahee's Recipe Archive</p>
          <h1 className={styles.title}>자희 쉐프의 메뉴판</h1>
          {!loading && (
            <p className={styles.recipeCount}>총 {recipes.length}개의 레시피</p>
          )}
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>나가기</button>
      </header>

      <div className={styles.tabBar}>
        <button
          className={`${styles.tabBtn} ${tab === 'gallery' ? styles.tabActive : ''}`}
          onClick={() => setTab('gallery')}
        >
          📷 사진 갤러리
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'menu' ? styles.tabActive : ''}`}
          onClick={() => setTab('menu')}
        >
          🔍 메뉴 · 검색
        </button>
      </div>

      {loading ? (
        <div className={styles.state}><div className="loading-spinner" /></div>
      ) : tab === 'gallery' ? (
        <div className={styles.galleryBody}>
          {recipes.length === 0 ? (
            <div className={styles.state}>
              <p className={styles.emptyIcon}>🥢</p>
              <p className={styles.emptyText}>아직 레시피가 없어요</p>
              <p className={styles.emptyHint}>+ 버튼을 눌러 첫 요리를 기록해보세요!</p>
            </div>
          ) : (
            CATEGORIES.map(cat => {
              const catRecipes = recipes.filter(r => r.category === cat)
              if (!catRecipes.length) return null
              return (
                <CategorySlider
                  key={cat}
                  category={cat}
                  recipes={catRecipes}
                  onSelect={handleSelect}
                />
              )
            })
          )}
        </div>
      ) : (
        <MenuTab recipes={recipes} onSelect={handleSelect} />
      )}

      <button
        className={styles.fab}
        onClick={() => navigate('/upload')}
        aria-label="레시피 추가"
      >+</button>

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
