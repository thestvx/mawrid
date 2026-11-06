import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { findStoreById } from '../data/sellers';
import { fetchSellers } from '../lib/supabase';
import './ServiceChat.css';

const CONV_KEY = (sid) => `mawrid_service_${sid}`;
const WALLET_BUYER = 'mawrid_wallet_buyer';
const WALLET_SELLER = 'mawrid_wallet_seller';

function loadConv(sid) {
  try { const r = localStorage.getItem(CONV_KEY(sid)); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveConv(sid, c) { try { localStorage.setItem(CONV_KEY(sid), JSON.stringify(c)); } catch {} }
function getWallet(k) { try { return Number(localStorage.getItem(k) || '0'); } catch { return 0; } }
function setWallet(k, v) { try { localStorage.setItem(k, String(v)); } catch {} }

const emptyConv = () => ({
  messages: [],
  offer: null, // { steps:[], price, duration, status }
  escrow: 0,
  countdownEnd: null,
  status: 'open', // open | paid | completed | cancelled
});

export default function ServiceChat() {
  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';
  const L = (ar, en) => (isRtl ? ar : en);
  const { user } = useAuth();
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [conv, setConv] = useState(() => loadConv(sellerId) || emptyConv());
  const [text, setText] = useState('');
  const [roleOverride, setRoleOverride] = useState(null); // 'buyer' | 'seller' for demo
  const [offerDraft, setOfferDraft] = useState({ steps: '', price: '', duration: '' });
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [buyerWallet, setBuyerWallet] = useState(getWallet(WALLET_BUYER));
  const [sellerWallet, setSellerWallet] = useState(getWallet(WALLET_SELLER));
  const endRef = useRef(null);

  const isSeller = roleOverride ? roleOverride === 'seller' : (user?.role === 'seller');

  useEffect(() => {
    let active = true;
    (async () => {
      const real = await (async () => {
        try {
          const { data } = await (await import('../lib/supabase')).fetchSellers();
          return data || [];
        } catch { return []; }
      })();
      const p = findStoreById(sellerId, real);
      if (active) setProfile(p);
    })();
    return () => { active = false; };
  }, [sellerId]);

  useEffect(() => { saveConv(sellerId, conv); }, [conv, sellerId]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv.messages, conv.offer]);

  const sendMsg = () => {
    const v = text.trim();
    if (!v) return;
    setConv((c) => ({ ...c, messages: [...c.messages, { from: isSeller ? 'seller' : 'buyer', text: v, ts: Date.now() }] }));
    setText('');
  };

  const sendOffer = () => {
    const steps = offerDraft.steps.split('\n').map((s) => s.trim()).filter(Boolean);
    const price = Number(offerDraft.price);
    const duration = Number(offerDraft.duration);
    if (!steps.length || !price || !duration) return;
    const offer = { steps, price, duration, status: 'sent', createdAt: Date.now() };
    setConv((c) => ({
      ...c,
      offer,
      messages: [...c.messages, { from: 'seller', text: L('تم إرسال عرض خدمة', 'Service offer sent'), ts: Date.now() }],
    }));
    setShowOfferForm(false);
    setOfferDraft({ steps: '', price: '', duration: '' });
  };

  const pay = () => {
    const amt = conv.offer.price;
    if (buyerWallet < amt) { alert(L('رصيد غير كافٍ في المحفظة', 'Insufficient wallet balance')); return; }
    setBuyerWallet((w) => { const n = w - amt; setWallet(WALLET_BUYER, n); return n; });
    const end = Date.now() + conv.offer.duration * 60 * 1000;
    setConv((c) => ({
      ...c,
      status: 'paid',
      escrow: amt,
      countdownEnd: end,
      offer: { ...c.offer, status: 'paid' },
      messages: [...c.messages, { from: 'buyer', text: L('تم الدفع — المبلغ محجوز في خزينة مَورد', 'Paid — amount held in Mawrid vault'), ts: Date.now() }],
    }));
    setShowPay(false);
  };

  const cancel = () => {
    if (conv.escrow > 0) {
      setBuyerWallet((w) => { const n = w + conv.escrow; setWallet(WALLET_BUYER, n); return n; });
    }
    setConv((c) => ({
      ...c,
      status: 'cancelled',
      escrow: 0,
      countdownEnd: null,
      offer: c.offer ? { ...c.offer, status: 'cancelled' } : c.offer,
      messages: [...c.messages, { from: 'buyer', text: L('تم إلغاء الطلب — أُعيد المبلغ إلى المحفظة', 'Request cancelled — amount refunded to wallet'), ts: Date.now() }],
    }));
  };

  const complete = () => {
    const amt = conv.escrow;
    const commission = Math.round(amt * 0.05 * 100) / 100;
    setSellerWallet((w) => { const n = w + (amt - commission); setWallet(WALLET_SELLER, n); return n; });
    setConv((c) => ({
      ...c,
      status: 'completed',
      escrow: 0,
      offer: c.offer ? { ...c.offer, status: 'completed' } : c.offer,
      messages: [...c.messages, { from: 'system', text: L(`اكتملت الخدمة — أُفرج عن المبلغ (عمولة مَورد ${commission})`, `Service completed — funds released (Mawrid fee ${commission})`), ts: Date.now() }],
    }));
  };

  const remaining = conv.countdownEnd ? Math.max(0, conv.countdownEnd - now) : 0;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  if (!profile) {
    return <div className="svc-chat" dir={dir}><div className="container" style={{ padding: 40 }}>{L('جارٍ التحميل…', 'Loading…')}</div></div>;
  }

  return (
    <div className="svc-chat" dir={dir}>
      <div className="svc-chat__head">
        <button className="svc-back" onClick={() => navigate(-1)}>←</button>
        <div>
          <h1>{profile.brand || profile.name}</h1>
          <p>{L('شات خدمة', 'Service chat')}</p>
        </div>
        <div className="svc-role">
          <button className={isSeller ? 'active' : ''} onClick={() => setRoleOverride('seller')}>{L('مورّد', 'Seller')}</button>
          <button className={!isSeller ? 'active' : ''} onClick={() => setRoleOverride('buyer')}>{L('زبون', 'Buyer')}</button>
        </div>
      </div>

      <div className="svc-chat__body">
        <div className="svc-messages">
          {conv.messages.length === 0 && <div className="svc-empty">{L('ابدأ المحادثة…', 'Start the conversation…')}</div>}
          {conv.messages.map((m, i) => (
            <div key={i} className={`svc-msg svc-msg--${m.from}`}>
              <div className="svc-msg__bubble">{m.text}</div>
            </div>
          ))}
          {conv.offer && (
            <div className="svc-offer">
              <h3>{L('عرض خدمة', 'Service offer')}</h3>
              <ul>{conv.offer.steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
              <div className="svc-offer__meta">
                <span>{L('السعر', 'Price')}: <b>${conv.offer.price}</b></span>
                <span>{L('المدة', 'Duration')}: <b>{conv.offer.duration} {L('دقيقة', 'min')}</b></span>
                <span>{L('الحالة', 'Status')}: <b>{conv.offer.status}</b></span>
              </div>
              {!isSeller && conv.offer.status === 'sent' && (
                <button className="svc-btn svc-btn--pay" onClick={() => setShowPay(true)}>{L('دفع مبلغ الخدمة', 'Pay service amount')}</button>
              )}
              {!isSeller && (conv.status === 'paid') && (
                <button className="svc-btn svc-btn--cancel" onClick={cancel}>{L('إلغاء طلب الخدمة', 'Cancel service request')}</button>
              )}
              {conv.status === 'paid' && (
                <div className="svc-timer">
                  {remaining > 0
                    ? `${L('العد التنازلي', 'Countdown')}: ${mins}:${String(secs).padStart(2, '0')}`
                    : <button className="svc-btn svc-btn--complete" onClick={complete}>{L('تأكيد الاستلام (إفراغ)', 'Confirm receipt (release)')}</button>}
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="svc-side">
          <div className="svc-wallets">
            <div>{L('محفظة الزبون', 'Buyer wallet')}: <b>${buyerWallet.toFixed(2)}</b></div>
            <div>{L('محفظة المورّد', 'Seller wallet')}: <b>${sellerWallet.toFixed(2)}</b></div>
            <div>{L('خزينة مَورد (Escrow)', 'Mawrid vault (Escrow)')}: <b>${conv.escrow}</b></div>
          </div>

          {isSeller && (
            <div className="svc-seller-tools">
              {!showOfferForm ? (
                <button className="svc-btn svc-btn--offer" onClick={() => setShowOfferForm(true)}>{L('إنشاء عرض (سعر + خطوات)', 'Create offer (price + steps)')}</button>
              ) : (
                <div className="svc-offer-form">
                  <label>{L('الخطوات (سطر لكل خطوة)', 'Steps (one per line)')}</label>
                  <textarea value={offerDraft.steps} onChange={(e) => setOfferDraft({ ...offerDraft, steps: e.target.value })} rows={5} />
                  <label>{L('السعر ($)', 'Price ($)')}</label>
                  <input type="number" value={offerDraft.price} onChange={(e) => setOfferDraft({ ...offerDraft, price: e.target.value })} />
                  <label>{L('المدة (دقائق)', 'Duration (min)')}</label>
                  <input type="number" value={offerDraft.duration} onChange={(e) => setOfferDraft({ ...offerDraft, duration: e.target.value })} />
                  <div className="svc-offer-form__btns">
                    <button className="svc-btn svc-btn--pay" onClick={sendOffer}>{L('إرسال', 'Send')}</button>
                    <button className="svc-btn" onClick={() => setShowOfferForm(false)}>{L('إلغاء', 'Cancel')}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="svc-input">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder={L('اكتب رسالة…', 'Type a message…')} />
            <button onClick={sendMsg}>{L('إرسال', 'Send')}</button>
          </div>
        </div>
      </div>

      {showPay && (
        <div className="svc-modal" onClick={() => setShowPay(false)}>
          <div className="svc-modal__card" onClick={(e) => e.stopPropagation()}>
            <h2>{L('بوابة الدفع (تجريبية)', 'Payment gateway (demo)')}</h2>
            <p>{L(`المبلغ: $${conv.offer.price}`, `Amount: $${conv.offer.price}`)}</p>
            <p className="svc-modal__note">{L('هذه بوابة تجريبية — لا يتم خصم فعلي.', 'This is a demo gateway — no real charge.')}</p>
            <div className="svc-modal__btns">
              <button className="svc-btn svc-btn--pay" onClick={pay}>{L('تأكيد الدفع', 'Confirm payment')}</button>
              <button className="svc-btn" onClick={() => setShowPay(false)}>{L('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
