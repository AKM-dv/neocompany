import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiList, FiSliders } from 'react-icons/fi'
import client from '../../api/client'
import CategoryFilter from '../../components/CategoryFilter'
import ServiceCard from '../../components/ServiceCard'
import './Services.css'

const PAGE_SIZE = 9

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('relevance')
  const [page, setPage] = useState(1)

  const categoryId = searchParams.get('category_id')
    ? Number(searchParams.get('category_id'))
    : null

  useEffect(() => {
    client.get('/api/categories').then((r) => setCategories(r.data || []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (categoryId) params.category_id = categoryId
    client
      .get('/api/services', { params })
      .then((r) => {
        setServices(r.data || [])
        setPage(1)
      })
      .finally(() => setLoading(false))
  }, [categoryId])

  const sorted = useMemo(() => {
    const list = [...services]
    if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price))
    if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price))
    return list
  }, [services, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageSlice = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('category_id', String(id))
    else next.delete('category_id')
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  return (
    <>
      <section className="services-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Services</span>
          </nav>
          <h1 className="services-hero-title hero-font">Our Services</h1>
        </div>
      </section>

      <div className="container services-layout">
        <aside className="services-sidebar">
          <CategoryFilter
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategory}
            onClear={clearFilters}
          />
        </aside>

        <div className="services-main">
          <div className="services-toolbar">
            <span className="results-count">
              <FiList aria-hidden />
              Showing {sorted.length} service{sorted.length === 1 ? '' : 's'}
            </span>
            <label className="sort-label">
              <FiSliders aria-hidden />
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="page-loading">Loading…</div>
          ) : (
            <>
              <div className="service-grid-services">
                {pageSlice.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={p === page ? 'active' : ''}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
