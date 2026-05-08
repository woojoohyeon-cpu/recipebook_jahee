import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Upload.module.css'

const CATEGORIES = ['국·찌개', '메인반찬', '소반찬', '밥·면', '쌈·샐러드', '한상차림', '기타']

function TagInput({ label, optional, items, inputVal, onInputChange, onAdd, onRemove, onKeyDown, placeholder }) {
  return (
    <div className={styles.field}>
      <label>
        {label}
        {optional && <span className={styles.optional}> (선택)</span>}
      </label>
      <div className={styles.tagInputRow}>
        <input
          type="text"
          value={inputVal}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={styles.tagInput}
        />
        <button type="button" onClick={onAdd} className={styles.addTagBtn}>추가</button>
      </div>
      {items.length > 0 && (
        <div className={styles.tags}>
          {items.map((item, i) => (
            <span key={i} className={styles.tag}>
              {item}
              <button type="button" onClick={() => onRemove(item)} className={styles.tagRemove}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function EditRecipe({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('국·찌개')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [sideDishes, setSideDishes] = useState([])
  const [sideDishInput, setSideDishInput] = useState('')
  const [cookedDate, setCookedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('recipes').select('*').eq('id', id).single()
      if (data) {
        setTitle(data.title)
        setCategory(data.category)
        setPreview(data.photo_url)
        setCurrentPhotoUrl(data.photo_url)
        setIngredients(data.ingredients ?? [])
        setSideDishes(data.side_dishes ?? [])
        setCookedDate(data.created_at?.split('T')[0] ?? new Date().toISOString().split('T')[0])
      }
      setFetchLoading(false)
    }
    load()
    return () => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current) }
  }, [id])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const url = URL.createObjectURL(f)
    previewUrlRef.current = url
    setFile(f)
    setPreview(url)
  }

  const addTag = (list, setList, input, setInput) => {
    const t = input.trim()
    if (t && !list.includes(t)) { setList(p => [...p, t]); setInput('') }
  }
  const removeTag = (list, setList, item) => setList(list.filter(i => i !== item))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    try {
      let photoUrl = currentPhotoUrl
      if (file) {
        const ext = file.name.split('.').pop().toLowerCase()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { data: up, error: ue } = await supabase.storage
          .from('recipe-photos').upload(fileName, file)
        if (ue) throw ue
        photoUrl = supabase.storage.from('recipe-photos').getPublicUrl(up.path).data.publicUrl
      }

      const { error: updateError } = await supabase.from('recipes').update({
        title: title.trim(),
        category,
        photo_url: photoUrl,
        ingredients,
        side_dishes: category === '한상차림' ? sideDishes : [],
        created_at: new Date(cookedDate).toISOString(),
      }).eq('id', id)

      if (updateError) throw updateError
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className={styles.container}>
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>← 돌아가기</button>
        <h2 className={styles.headerTitle}>레시피 수정</h2>
        <div className={styles.headerSpacer} />
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <button
          type="button"
          className={styles.photoArea}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview
            ? <img src={preview} alt="미리보기" className={styles.preview} />
            : (
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoIcon}>📷</span>
                <p>사진 변경</p>
                <p className={styles.photoHint}>탭하면 카메라/갤러리가 열려요</p>
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
                key={cat}
                type="button"
                className={`${styles.catBtn} ${category === cat ? styles.catActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="edit-title">메뉴 이름</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="메뉴 이름 입력"
            required
          />
        </div>

        <TagInput
          label="재료"
          optional
          items={ingredients}
          inputVal={ingredientInput}
          onInputChange={setIngredientInput}
          onAdd={() => addTag(ingredients, setIngredients, ingredientInput, setIngredientInput)}
          onRemove={item => removeTag(ingredients, setIngredients, item)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(ingredients, setIngredients, ingredientInput, setIngredientInput) } }}
          placeholder="재료 입력 후 Enter 또는 추가"
        />

        {category === '한상차림' && (
          <TagInput
            label="반찬 목록"
            optional
            items={sideDishes}
            inputVal={sideDishInput}
            onInputChange={setSideDishInput}
            onAdd={() => addTag(sideDishes, setSideDishes, sideDishInput, setSideDishInput)}
            onRemove={item => removeTag(sideDishes, setSideDishes, item)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(sideDishes, setSideDishes, sideDishInput, setSideDishInput) } }}
            placeholder="반찬 이름 입력 후 Enter 또는 추가"
          />
        )}

        <div className={styles.field}>
          <label htmlFor="edit-date">요리한 날짜</label>
          <input
            id="edit-date"
            type="date"
            value={cookedDate}
            onChange={e => setCookedDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={loading || !title.trim()} className={styles.submitBtn}>
          {loading ? '저장 중...' : '수정 완료'}
        </button>
      </form>
    </div>
  )
}
