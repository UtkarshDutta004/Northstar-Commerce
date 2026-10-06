import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from '../features/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const dispatch = useDispatch();
  const { items, categories, loading, error, page, pages, total } = useSelector((state) => state.products);
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => {
    dispatch(fetchProducts({ search, category, sort, page: params.get('page') || 1, limit: 12 }));
  }, [dispatch, search, category, sort, params]);

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  }

  return (
    <main className="page-shell listing-page section-space">
      <div className="listing-intro"><p className="eyebrow">Shop Northstar</p><h1>{search ? `Results for “${search}”` : category ? categories.find((item) => item.slug === category)?.name || 'The collection' : 'All the good stuff.'}</h1><p>Useful things, thoughtfully chosen for wherever the day takes you.</p></div>
      <div className="listing-toolbar"><div className="result-count"><SlidersHorizontal size={16} /><span>{total} {total === 1 ? 'piece' : 'pieces'}</span></div>
        <div className="listing-filters"><label><span className="sr-only">Category</span><select value={category} onChange={(event) => updateParam('category', event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item._id} value={item.slug}>{item.name}</option>)}</select></label>
          <label><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => updateParam('sort', event.target.value)}><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option></select></label></div>
      </div>
      {loading ? <Loader label="Loading the collection" /> : error ? <Message>{error}</Message> : items.length ? <div className="product-grid">{items.map((product, index) => <ProductCard key={product._id} product={product} index={index} />)}</div> : <div className="empty-state"><h2>No matches just yet.</h2><p>Try a different search or browse all of our useful goods.</p><button className="button button-dark" onClick={() => setParams({})}>View all pieces</button></div>}
      {pages > 1 && <nav className="pagination" aria-label="Product pages"><button className="icon-button" aria-label="Previous page" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}><ChevronLeft /></button><span>Page {page} of {pages}</span><button className="icon-button" aria-label="Next page" disabled={page >= pages} onClick={() => updateParam('page', String(page + 1))}><ChevronRight /></button></nav>}
    </main>
  );
}
