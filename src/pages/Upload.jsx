import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Upload.module.css'

const CATEGORIES = ['국·찌개', '메인반찬', '소반찬', '밥·면', '쌈·샐러드', '한상차림', '기타']
const today = () => new Date().toISOString().split('T')[0]

export default function Upload({ user }) {
  const [mode, setMode] = useState('single')
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.backBtn}>← 돌아가기</button>
        <h2 className={styles.headerTitle}>레시피 추가</h2>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeTab} ${mode === 'single' ? styles.modeTabActive : ''}`}
          onClick={() => setMode('single')}
        >
          1개 추가
        </button>
        <button
          className={`${styles.modeTab} ${mode === 'bulk' ? styles.modeTabActive : ''}`}
          onClick={() => setMode('bulk')}
        >
          여러 개 한꺼번에
        </button>
      </div>

      {mode === 'single'
        ? <SingleForm user={user} navigate={navigate} />
        : <BulkForm user={user} navigate={navigate} />
      }
    </div>
  )
}

function SingleForm({ user, navigate }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('국·찌개')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [sideDishes, setSideDishes] = useState([])
  const [sideDishInput, setSideDishInput] = useState('')
  const [cookedDate, setCookedDate] = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef(null)

  useEffect(() => {
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current) }
  }, [])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = URL.createObjectURL(f)
    previewUrlRef.current = url
    setFile(f); setPreview(url)
  }

  const addTag = (list, setList, input, setInput) => {
    const t = input.trim()
    if (t && !list.includes(t)) { setList(p => [...p, t]); setInput('') }
  }
  const removeTag = (list, setList, item) => setList(list.filter(i => i !== item))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true); setError('')

    try {
      let photoUrl = null
      if (file) {
        const ext = file.name.split('.').pop().toLowerCase()
        const { data, error: ue } = await supabase.storage
          .from('recipe-photos')
          .upload(`${user.id}/${Date.now()}.${ext}`, file)
        if (ue) throw ue
        photoUrl = supabase.storage.from('recipe-photos').getPublicUrl(data.path).data.publicUrl
      }

      const { error: ie } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: title.trim(),
        category,
        photo_url: photoUrl,
        ingredients,
        side_dishes: category === '한상차림' ? sideDishes : [],
        created_at: new Date(cookedDate).toISOString(),
      })
      if (ie) throw ie
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('저장 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <button type="button" className={styles.photoArea} onClick={() => fileInputRef.current?.click()}>
        {preview
          ? <img src={preview} alt="미리보기" className={styles.preview} />
          : (
            <div className={styles.photoPlaceholder}>
              <span className={styles.photoIcon}>📷</span>
              <p>사진 추가</p>
              <p className={styles.photoHint}>카메라 또는 갤러리에서 선택</p>
            </div>
          )
        }
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      <div className={styles.field}>
        <label>카테고리</label>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <button
              key={cat} type="button"
              className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="title">메뉴 이름</label>
        <input
          id="title" type="text" value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 된장찌개, 잡채, 나물비빔밥..." required
        />
      </div>

      <div className={styles.field}>
        <label>재료<span className={styles.optional}> (선택)</span></label>
        <div className={styles.tagInputRow}>
          <input
            type="text" value={ingredientInput}
            onChange={e => setIngredientInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(ingredients, setIngredients, ingredientInput, setIngredientInput) } }}
            placeholder="재료 입력 후 Enter 또는 추가" className={styles.tagInput}
          />
          <button type="button" onClick={() => addTag(ingredients, setIngredients, ingredientInput, setIngredientInput)} className={styles.addTagBtn}>추가</button>
        </div>
        {ingredients.length > 0 && (
          <div className={styles.tags}>
            {ingredients.map((ing, i) => (
              <span key={i} className={styles.tag}>
                {ing}
                <button type="button" onClick={() => removeTag(ingredients, setIngredients, ing)} className={styles.tagRemove}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {category === '한상차림' && (
        <div className={styles.field}>
          <label>반찬 목록<span className={styles.optional}> (선택)</span></label>
          <div className={styles.tagInputRow}>
            <input
              type="text" value={sideDishInput}
              onChange={e => setSideDishInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(sideDishes, setSideDishes, sideDishInput, setSideDishInput) } }}
              placeholder="반찬 이름 입력 후 Enter 또는 추가" className={styles.tagInput}
            />
            <button type="button" onClick={() => addTag(sideDishes, setSideDishes, sideDishInput, setSideDishInput)} className={styles.addTagBtn}>추가</button>
          </div>
          {sideDishes.length > 0 && (
            <div className={styles.tags}>
              {sideDishes.map((d, i) => (
                <span key={i} className={styles.tag}>
                  {d}
                  <button type="button" onClick={() => removeTag(sideDishes, setSideDishes, d)} className={styles.tagRemove}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="date">요리한 날짜</label>
        <input
          id="date" type="date" value={cookedDate}
          onChange={e => setCookedDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={loading || !title.trim()} className={styles.submitBtn}>
        {loading ? '저장 중...' : '저장하기'}
      </button>
    </form>
  )
}

function BulkForm({ user, navigate }) {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('국·찌개')
  const [cookedDate, setCookedDate] = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const previewUrlsRef = useRef([])

  useEffect(() => {
    return () => { previewUrlsRef.current.forEach(u => URL.revokeObjectURL(u)) }
  }, [])

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files)
    const newItems = files.map(f => {
      const url = URL.createObjectURL(f)
      previewUrlsRef.current.push(url)
      const autoTitle = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      return { id: crypto.randomUUID(), file: f, preview: url, title: autoTitle }
    })
    setItems(prev => [...prev, ...newItems])
    e.target.value = ''
  }

  const updateTitle = (id, title) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, title } : it))
  }

  const removeItem = (id, previewUrl) => {
    URL.revokeObjectURL(previewUrl)
    setItems(prev => prev.filter(it => it.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) { setError('사진을 먼저 선택해주세요.'); return }
    if (items.some(it => !it.title.trim())) { setError('모든 메뉴 이름을 입력해주세요.'); return }
    setLoading(true); setError('')

    try {
      const inserts = []
      for (const item of items) {
        let photoUrl = null
        if (item.file) {
          const ext = item.file.name.split('.').pop().toLowerCase()
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { data, error: ue } = await supabase.storage.from('recipe-photos').upload(fileName, item.file)
          if (ue) throw ue
          photoUrl = supabase.storage.from('recipe-photos').getPublicUrl(data.path).data.publicUrl
        }
        inserts.push({
          user_id: user.id,
          title: item.title.trim(),
          category,
          photo_url: photoUrl,
          ingredients: [],
          side_dishes: [],
          created_at: new Date(cookedDate).toISOString(),
        })
      }
      const { error: ie } = await supabase.from('recipes').insert(inserts)
      if (ie) throw ie
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('저장 중 오류가 발생했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label>카테고리 (공통)</label>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <button
              key={cat} type="button"
              className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="bulk-date">요리한 날짜 (공통)</label>
        <input
          id="bulk-date" type="date" value={cookedDate}
          onChange={e => setCookedDate(e.target.value)}
          className={styles.dateInput}
        />
      </div>

      <button
        type="button"
        className={styles.bulkAddBtn}
        onClick={() => fileInputRef.current?.click()}
      >
        📷 사진 선택하기 {items.length > 0 && `(현재 ${items.length}장)`}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        style={{ display: 'none' }}
      />

      {items.length > 0 && (
        <div className={styles.bulkList}>
          {items.map(item => (
            <div key={item.id} className={styles.bulkItem}>
              <img src={item.preview} alt="" className={styles.bulkThumb} />
              <input
                type="text"
                value={item.title}
                onChange={e => updateTitle(item.id, e.target.value)}
                placeholder="메뉴 이름"
                className={styles.bulkTitleInput}
              />
              <button
                type="button"
                onClick={() => removeItem(item.id, item.preview)}
                className={styles.bulkRemoveBtn}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="submit"
        disabled={loading || items.length === 0}
        className={styles.submitBtn}
      >
        {loading ? '저장 중...' : `${items.length}개 저장하기`}
      </button>
    </form>
  )
}
