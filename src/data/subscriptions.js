export const subscriptionGroups = [
  {
    key: 'ai',
    title_ar: 'قسم اشتراكات الذكاء الاصطناعي',
    title_en: 'AI Subscriptions',
    subtitle_ar: 'اشتراكات أدوات الذكاء الاصطناعي الرائدة لتعزيز إنتاجيتك وتوفير وقتك.',
    subtitle_en: 'Subscriptions for the leading AI tools to boost your productivity.',
    card: '/images/cards/aicard.png',
    line: '/images/lines/ailine.png',
    categorySlug: 'artificial-intelligence',
    subs: [
      { key: 'chatgpt', title_ar: 'اشتراك شات جي بي تي', title_en: 'ChatGPT', icon: '/images/icons/ai/chatgpt.png', categorySlug: 'chatgpt', tag_ar: 'أدوات AI', tag_en: 'AI Tools', plans: ['/sub/chatgpt/chatgpt-1months.png', '/sub/chatgpt/chatgpt-3months.png', '/sub/chatgpt/chatgpt-6months.png', '/sub/chatgpt/chatgpt-1year.png', '/sub/chatgpt/chatgptplus-1months.png', '/sub/chatgpt/chatgptplus-3months.png', '/sub/chatgpt/chatgptplus-6months.png', '/sub/chatgpt/chatgptplus-1year.png'] },
      { key: 'gemini', title_ar: 'اشتراك جيميني', title_en: 'Gemini', icon: '/images/icons/ai/gemini.png', categorySlug: 'google-gemini', tag_ar: 'أدوات AI', tag_en: 'AI Tools', plans: ['/sub/gemini/geminipro-1months.png', '/sub/gemini/geminiultra-1months.png'] },
      { key: 'claude', title_ar: 'اشتراك كلود', title_en: 'Claude', icon: '/images/icons/ai/claude.png', categorySlug: 'claude', tag_ar: 'أدوات AI', tag_en: 'AI Tools' },
      { key: 'perplexity', title_ar: 'اشتراك بربلكسيتي', title_en: 'Perplexity', icon: '/images/icons/ai/preplexity.png', categorySlug: 'perplexity', tag_ar: 'أدوات AI', tag_en: 'AI Tools' },
    ],
  },
  {
    key: 'courses',
    title_ar: 'قسم اشتراكات الدورات والتعليم',
    title_en: 'Courses & Education Subscriptions',
    subtitle_ar: 'منصات تعليمية عالمية تفتح لك آفاق المعرفة والمهارات الجديدة.',
    subtitle_en: 'World-class learning platforms to unlock new knowledge and skills.',
    card: '/images/cards/coursescard.png',
    line: '/images/lines/coursesline.png',
    categorySlug: 'courses',
    subs: [
      { key: 'duolingo', title_ar: 'اشتراك دولينقو', title_en: 'Duolingo', icon: '/images/icons/courses/dolingo.png', categorySlug: 'duolingo', tag_ar: 'تعليم', tag_en: 'Education' },
      { key: 'coursera', title_ar: 'اشتراك كورسيرا', title_en: 'Coursera', icon: '/images/icons/courses/coursera.png', categorySlug: 'coursera', tag_ar: 'تعليم', tag_en: 'Education', plans: ['/sub/coursera/courseraplus-1year.png'] },
    ],
  },
  {
    key: 'design',
    title_ar: 'قسم اشتراكات التصميم',
    title_en: 'Design Subscriptions',
    subtitle_ar: 'اشتراكات أقوى أدوات التصميم والإبداع للمحترفين والمبتدئين.',
    subtitle_en: 'Subscriptions for the most powerful design and creative tools.',
    card: '/images/cards/designcard.png',
    line: '/images/lines/designline.png',
    categorySlug: 'design',
    subs: [
      { key: 'adobe', title_ar: 'اشتراك أدوبي', title_en: 'Adobe', icon: '/images/icons/design/adobe.png', categorySlug: 'adobe', tag_ar: 'تصميم', tag_en: 'Design', plans: ['/sub/adobe/adobe-1months.png', '/sub/adobe/adobe-3months.png', '/sub/adobe/adobe-4months.png', '/sub/adobe/adobe-8months.png', '/sub/adobe/adobe-1year.png'] },
      { key: 'freepik', title_ar: 'اشتراك فري بيك', title_en: 'Freepik', icon: '/images/icons/design/freepik.png', categorySlug: 'freepik', tag_ar: 'تصميم', tag_en: 'Design' },
      { key: 'canva', title_ar: 'اشتراك كانفا', title_en: 'Canva', icon: '/images/icons/design/canva.png', categorySlug: 'canva', tag_ar: 'تصميم', tag_en: 'Design', plans: ['/sub/canva/canva500user-3year.png', '/sub/canva/canvapro-1year.png'] },
    ],
  },
  {
    key: 'office',
    title_ar: 'قسم اشتراكات الأعمال والمحاسبة',
    title_en: 'Business & Accounting Subscriptions',
    subtitle_ar: 'اشتراكات أدوات الأعمال والمحاسبة لإدارة أعمالك بكفاءة واحترافية.',
    subtitle_en: 'Business and accounting tools to run your work efficiently.',
    card: '/images/cards/officecard.png',
    line: '/images/lines/officeline.png',
    categorySlug: 'business',
    subs: [
      { key: 'linkedin', title_ar: 'اشتراك لينكد إن', title_en: 'LinkedIn', icon: '/images/icons/office/linkedin.png', categorySlug: 'linkedin', tag_ar: 'أعمال', tag_en: 'Business', plans: ['/sub/linkedin/linkedinpremium-3months.png', '/sub/linkedin/linkedinpremium-6months.png', '/sub/linkedin/linkedinpremium-1year.png'] },
      { key: 'microsoft', title_ar: 'اشتراك مايكروسوفت', title_en: 'Microsoft', icon: '/images/icons/office/microsoft.png', categorySlug: 'microsoft', tag_ar: 'أعمال', tag_en: 'Business' },
      { key: 'office365', title_ar: 'اشتراك أوفيس 360', title_en: 'Office 365', icon: '/images/icons/office/office360.png', categorySlug: 'office-365', tag_ar: 'أعمال', tag_en: 'Business', plans: ['/sub/office/office365-1year.png', '/sub/office/office365personal-1year.png'] },
    ],
  },
  {
    key: 'gaming',
    title_ar: 'قسم اشتراكات منصات الألعاب',
    title_en: 'Gaming Platform Subscriptions',
    subtitle_ar: 'اشتراكات أشهر منصات الألعاب لاستكشاف عوالم جديدة من المتعة والتنافس.',
    subtitle_en: 'Subscriptions for the most popular gaming platforms.',
    card: '/images/cards/gamingcard.png',
    line: '/images/lines/gamingline.png',
    categorySlug: 'gaming',
    subs: [
      { key: 'xbox', title_ar: 'اشتراك إكس بوكس', title_en: 'Xbox', icon: '/images/icons/gaming/xbox.png', categorySlug: 'xbox', tag_ar: 'ألعاب', tag_en: 'Gaming' },
      { key: 'steam', title_ar: 'اشتراك ستيم', title_en: 'Steam', icon: '/images/icons/gaming/steam.png', categorySlug: 'steam', tag_ar: 'ألعاب', tag_en: 'Gaming' },
      { key: 'playstation', title_ar: 'اشتراك بلايستيشن', title_en: 'PlayStation', icon: '/images/icons/gaming/playstation.png', categorySlug: 'playstation', tag_ar: 'ألعاب', tag_en: 'Gaming' },
      { key: 'epicgames', title_ar: 'اشتراك إيبك جيمز', title_en: 'Epic Games', icon: '/images/icons/gaming/epicgames.png', categorySlug: 'epic-games', tag_ar: 'ألعاب', tag_en: 'Gaming' },
      { key: 'ea', title_ar: 'اشتراك إي إيه', title_en: 'EA Play', icon: '/images/icons/gaming/ea.png', categorySlug: 'ea-play', tag_ar: 'ألعاب', tag_en: 'Gaming' },
      { key: 'pubgmobile', title_ar: 'اشتراك ببجي موبايل', title_en: 'PUBG Mobile', icon: '/images/icons/gaming/pubgmobile.png', categorySlug: 'pubg-mobile', tag_ar: 'ألعاب', tag_en: 'Gaming' },
      { key: 'freefire', title_ar: 'اشتراك فري فاير', title_en: 'Free Fire', icon: '/images/icons/gaming/freefire.png', categorySlug: 'free-fire', tag_ar: 'ألعاب', tag_en: 'Gaming' },
    ],
  },
  {
    key: 'stream',
    title_ar: 'قسم اشتراكات الترفيه',
    title_en: 'Entertainment Subscriptions',
    subtitle_ar: 'اشتراكات منصات البث والترفيه لمتابعة مسلسلاتك وعروضك المفضلة.',
    subtitle_en: 'Streaming and entertainment subscriptions for your favourite shows.',
    card: '/images/cards/streamcard.png',
    line: '/images/lines/streamline.png',
    categorySlug: 'entertainment',
    subs: [
      { key: 'netflix', title_ar: 'اشتراك نتفلكس', title_en: 'Netflix', icon: '/images/icons/stream/netflix.png', categorySlug: 'netflix', tag_ar: 'ترفيه', tag_en: 'Entertainment' },
      { key: 'spotify', title_ar: 'اشتراك سبوتيفاي', title_en: 'Spotify', icon: '/images/icons/stream/spotify.png', categorySlug: 'spotify', tag_ar: 'ترفيه', tag_en: 'Entertainment' },
      { key: 'todtv', title_ar: 'اشتراك تود تي في', title_en: 'TOD TV', icon: '/images/icons/stream/todtv.png', categorySlug: 'tod-tv', tag_ar: 'ترفيه', tag_en: 'Entertainment' },
      { key: 'osn', title_ar: 'اشتراك OSN', title_en: 'OSN', icon: '/images/icons/stream/osn.png', categorySlug: 'osn', tag_ar: 'ترفيه', tag_en: 'Entertainment' },
      { key: 'crunchyroll', title_ar: 'اشتراك كرانشي رول', title_en: 'Crunchyroll', icon: '/images/icons/stream/crunchyroll.png', categorySlug: 'crunchyroll', tag_ar: 'ترفيه', tag_en: 'Entertainment' },
      { key: 'youtube', title_ar: 'اشتراك يوتيوب بريميوم', title_en: 'YouTube Premium', icon: '/images/icons/stream/youtube.png', categorySlug: 'youtube-premium', tag_ar: 'ترفيه', tag_en: 'Entertainment' },
    ],
  },
];

export function findGroup(key) {
  return subscriptionGroups.find((g) => g.key === key);
}

export function findSub(key) {
  for (const group of subscriptionGroups) {
    const sub = group.subs.find((s) => s.key === key);
    if (sub) return { group, sub };
  }
  return null;
}