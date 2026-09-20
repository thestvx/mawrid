import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStorefrontBySlug, saveStorefront } from '../lib/storefront';
import { makeSection } from '../components/store/sectionSchema';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StoreRenderer from '../components/store/StoreRenderer';
import StoreStudio from '../components/store/StoreStudio';
import MediaPicker from '../components/store/MediaPicker';
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
  const [selectedId, setSelectedId] = useState(null);
  const [panel, setPanel] = useState(null);
  const [addIndex, setAddIndex] = useState(0);
  const [picker, setPicker] = useState(null);
  const [savedHint, setSavedHint] = useState('');
  const savedTimer = useRef(null);
  const firstRender = useRef(true);
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

  // Auto-save (debounced) once editing begins
  useEffect(() => {
    if (!editing || !editStore) return;
    if (firstRender.current) { firstRender.current = false; return; }
    const t = setTimeout(() => {
      if (editStore.seller_id) {
        saveStorefront(editStore).then((res) => {
          setSavedHint(res?.localOnly ? (dir === 'rtl' ? 'حُفظ محلياً ✓' : 'Saved locally ✓') : (dir === 'rtl' ? 'حُفظ تلقائياً ✓' : 'Auto-saved ✓'));
          clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setSavedHint(''), 2200);
        }).catch(() => {});
      }
    }, 700);
    return () => clearTimeout(t);
  }, [editStore, editing, dir]);

  const patch = (fn) => setEditStore((s) => (s ? fn(s) : s));

  const patchSection = (id, p) => patch((s) => ({ ...s, sections: s.sections.map((sec) => (sec.id === id ? { ...sec, props: { ...(sec.props || {}), ...p } } : sec)) }));

  const sectionOp = (id, op) => {
    if (op === 'toggle') patch((s) => ({ ...s, sections: s.sections.map((sec) => (sec.id === id ? { ...sec, visible: sec.visible !== false ? false : true } : sec)) }));
    if (op === 'remove') {
      patch((s) => ({ ...s, sections: s.sections.filter((sec) => sec.id !== id) }));
      if (selectedId === id) setSelectedId(null);
    }
    if (op === 'up' || op === 'down') {
      const d = op === 'up' ? -1 : 1;
      patch((s) => {
        const idx = s.sections.findIndex((sec) => sec.id === id);
        const to = idx + d;
        if (idx < 0 || to < 0 || to >= s.sections.length) return s;
        const arr = [...s.sections];
        const [item] = arr.splice(idx, 1);
        arr.splice(to, 0, item);
        return { ...s, sections: arr };
      });
    }
  };

  const insertSectionAt = (type, visIndex) => {
    const idx = visIndex == null ? addIndex : visIndex;
    const sec = makeSection(type, dir);
    if (!sec) return;
    patch((s) => {
      const all = s.sections;
      const visible = all.filter((x) => x.visible !== false);
      let next;
      if (idx == null || idx >= visible.length) {
        next = [...all, sec];
      } else {
        const anchor = visible[idx];
        const aIdx = all.findIndex((x) => x.id === anchor.id);
        next = [...all.slice(0, aIdx), sec, ...all.slice(aIdx)];
      }
      return { ...s, sections: next };
    });
    setSelectedId(sec.id);
    setPanel(null);
  };

  const pickImage = (sectionId, key) => setPicker({ sectionId, key });

  const startEdit = () => setSearchParams({ edit: '1' });
  const stopEdit = () => {
    setSearchParams({});
    setSelectedId(null);
    setPanel(null);
  };

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

  const gallery = (products || []).map((p) => ({ id: p.id, thumbnail: p.thumbnail || (Array.isArray(p.images) && p.images[0]) }));

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
              editing
              selectedId={selectedId}
              onSelectSection={setSelectedId}
              onSectionOp={sectionOp}
              onAddSection={(i) => { setAddIndex(i); setPanel('add'); setSelectedId(null); }}
              onPickImage={pickImage}
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
            selectedId={selectedId}
            onSelectSection={setSelectedId}
            onPickImage={pickImage}
            savedHint={savedHint}
            panel={panel}
            setPanel={setPanel}
            addIndex={addIndex}
            onAddAt={insertSectionAt}
          />
          <MediaPicker
            open={!!picker}
            value={picker ? liveStore.sections.find((s) => s.id === picker.sectionId)?.props?.[picker.key] : ''}
            gallery={gallery}
            onSelect={(url) => { if (picker) patchSection(picker.sectionId, { [picker.key]: url }); }}
            onClose={() => setPicker(null)}
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