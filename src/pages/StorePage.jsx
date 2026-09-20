import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStorefrontBySlug } from '../lib/storefront';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StoreRenderer from '../components/store/StoreRenderer';
import StoreStudio from '../components/store/StoreStudio';
import './StorePage.css';

function fetchProducts(sellerId) {
  if (!isSupabaseConfigured || !sellerId) return Promise.resolve([]);
  return supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .then(({ data, error }) => {
      if (error || !data) return [];
      return data.filter((p) => !['pending', 'rejected', 'hidden', 'draft'].includes(String(p.status || '').toLowerCase()));
    });
}

function fetchSeller(sellerId) {
  if (!isSupabaseConfigured || !sellerId) return Promise.resolve(null);
  return supabase
    .from('users')
    .select('*')
    .eq('firebase_uid', sellerId)
    .maybeSingle()
    .then(({ data }) => data || null);
}

export default function StorePage() {
  const { slug } = useParams();
  const { dir } = useLanguage();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, store: null, seller: null, products: [] });
  const [editStore, setEditStore] = useState(null);
  const editing = searchParams.get('edit') === '1';

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    (async () => {
      const store = await getStorefrontBySlug(slug);
      if (!alive) return;
      if (!store) { setState({ loading: false, store: null, seller: null, products: [] }); return; }
      const [seller, products] = await Promise.all([
        fetchSeller(store.seller_id),
        fetchProducts(store.seller_id),
      ]);
      if (!alive) return;
      setState({ loading: false, store, seller, products });
    })();
    return () => { alive = false; };
  }, [slug]);

  const { loading, store, seller, products } = state;
  const isOwner = user && store && (user.uid === store.seller_id || user.firebase_uid === store.seller_id);
  const isPublished = store?.status === 'published';
  const pending = !!user?.seller_status && user.seller_status !== 'verified';

  const liveStore = editing && editStore ? editStore : store;

  useEffect(() => {
    if (store) setEditStore(store);
  }, [store]);

  useEffect(() => {
    if (liveStore?.seo?.title || seller?.store_name) {
      document.title = `${liveStore?.seo?.title || seller?.store_name} — مَورد`;
    }
    return () => { document.title = 'مَورد'; };
  }, [liveStore, seller]);

  const startEdit = () => setSearchParams({ edit: '1' });
  const stopEdit = () => setSearchParams({});

  const guardStageClick = (e) => {
    if (!editing) return;
    if (e.defaultPrevented) return;
    const el = e.target.closest && e.target.closest('a[href], button[data-ss-guard]');
    if (el) e.preventDefault();
  };

  if (loading) {
    return (
      <div className="storepage storepage--state">
        <div className="storepage__spinner" />
      </div>
    );
  }

  if (!store || (!isPublished && !isOwner)) {
    return (
      <div className="storepage storepage--state">
        <div className="storepage__empty">
          <span>🛍️</span>
          <h1>{dir === 'rtl' ? 'هذا المتجر غير متاح' : 'This store is unavailable'}</h1>
          <p>
            {dir === 'rtl'
              ? 'قد يكون الرابط غير صحيح أو أن المتجر لم يُنشر بعد.'
              : 'The link may be incorrect or the store has not been published yet.'}
          </p>
          <Link to="/marketplace">{dir === 'rtl' ? 'تصفّح السوق' : 'Browse marketplace'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`storepage${editing ? ' storepage--editing' : ''}`}>
      {editing ? (
        <>
          <div className="storepage__stage" onClickCapture={guardStageClick}>
            <StoreRenderer
              key={`${slug}-${liveStore.slug}`}
              store={liveStore}
              seller={seller}
              products={products}
              dir={dir}
              mode="preview"
            />
          </div>
          <StoreStudio
            uid={isOwner ? (user.uid || store.seller_id) : store.seller_id}
            store={liveStore}
            onChange={setEditStore}
            seller={seller}
            products={products}
            dir={dir}
            isPending={pending}
            onExit={stopEdit}
          />
        </>
      ) : (
        <>
          {!isPublished && isOwner && (
            <div className="storepage__draft">
              {dir === 'rtl' ? 'معاينة — هذا المتجر مسودة غير منشورة' : 'Preview — this store is an unpublished draft'}
              <button type="button" onClick={startEdit}>{dir === 'rtl' ? 'تعديل الآن' : 'Edit now'}</button>
            </div>
          )}
          <StoreRenderer
            store={store}
            seller={seller}
            products={products}
            dir={dir}
            mode={isOwner && !isPublished ? 'preview' : 'public'}
          />
          {isOwner && (
            <button type="button" className="storepage__fab" onClick={startEdit}>✎</button>
          )}
        </>
      )}
    </div>
  );
}