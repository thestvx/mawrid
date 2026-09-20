import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStorefrontBySeller, defaultStorefront, saveStorefront, hasStorefrontTable, slugify } from '../../lib/storefront';
import { useLanguage } from '../../contexts/LanguageContext';
import './StoreLaunchPad.css';

export default function StoreLaunchPad({ uid, seller }) {
  const { dir } = useLanguage();
  const [launch, setLaunch] = useState({ loading: true, slug: null, published: false });

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    (async () => {
      let store = await getStorefrontBySeller(uid);
      if (store?.slug && alive) {
        setLaunch({ loading: false, slug: store.slug, published: store.status === 'published' });
        return;
      }
      const seeded = defaultStorefront(seller, []);
      seeded.slug = slugify(seeded.slug || '');
      seeded.seller_id = uid;
      if (alive) setLaunch({ loading: false, slug: seeded.slug, published: false });
      try {
        if (await hasStorefrontTable()) {
          await saveStorefront(seeded);
        } else {
          try { localStorage.setItem(`mawrid_storefront_${uid}`, JSON.stringify(seeded)); } catch {}
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [uid, seller]);

  const openLink = launch.slug ? `/store/${launch.slug}?edit=1` : null;

  return (
    <div className="slp">
      <div className="slp__hero">
        <div className="slp__badge">
          <span className="slp__icon">🛍️</span>
          <span>
            <b>{dir === 'rtl' ? 'استوديو المتجر' : 'Store Studio'}</b>
            <em>{dir === 'rtl' ? 'صمّم متجرك وشكله وأنت تشاهده مباشرة' : 'Design your storefront with a live preview'}</em>
          </span>
        </div>
        {launch.loading ? (
          <div className="slp__spinner" />
        ) : (
          <span className={`slp__status${launch.published ? ' is-live' : ''}`}>
            {launch.published
              ? (dir === 'rtl' ? 'متجرك منشور' : 'Your store is live')
              : (dir === 'rtl' ? 'مسودة — لم يُنشر بعد' : 'Draft — not published yet')}
          </span>
        )}
      </div>

      <div className="slp__body">
        <h3>{dir === 'rtl' ? 'عدّل متجرك من صفحته الحقيقية' : 'Edit your store from its real page'}</h3>
        <p>
          {dir === 'rtl'
            ? 'نفتح صفحة متجرك كما يراها عملاؤك بالضبط، ويظهر على الجانب شريط أدوات التعديل الكامل — أقسام، تصاميم، ألوان، خطوط، إعدادات — تماماً مثل Wix و Shopify.'
            : 'We open your store page exactly as customers see it, with a full editing toolbar on the side — sections, design, colours, fonts, settings — just like Wix and Shopify.'}
        </p>

        {openLink && (
          <Link to={openLink} className="slp__cta">
            <span>{dir === 'rtl' ? 'افتح المحرّر' : 'Open editor'}</span>
            <i>✎</i>
          </Link>
        )}
        {!launch.loading && launch.slug && (
          <a className="slp__view" href={`/store/${launch.slug}`} onClick={(e) => e.preventDefault()}>
            /store/{launch.slug}
          </a>
        )}
      </div>

      <div className="slp__features">
        {[
          ['🧩', dir === 'rtl' ? 'أضف ورتّب الأقسام بسحب وإفلات' : 'Add & rearrange sections'],
          ['🎨', dir === 'rtl' ? 'قوالب وألوان وخطوط جاهزة' : 'Ready templates, palettes & fonts'],
          ['⚙️', dir === 'rtl' ? 'تحكم بالرابط والإعدادات' : 'Manage link & settings'],
        ].map(([icon, txt]) => (
          <div key={icon} className="slp__feature"><span>{icon}</span>{txt}</div>
        ))}
      </div>
    </div>
  );
}