// State
let currentLang = 'ar';
let isDarkMode = false;
let isLoggedIn = false;
let currentPage = 'loginPage';
let selectedCourse = null;
let currentCourseFilter = 'all';

const STORAGE_KEYS = {
    bookings: 'clinicBookings_v1',
    tipsFavorites: 'clinicTipsFavorites_v1',
    tipsScore: 'clinicTipsScore_v1',
    tipsStreak: 'clinicTipsStreak_v1'
};

const departmentMap = {
    general: { ar: 'طب عام', en: 'General Medicine' },
    cardiology: { ar: 'أمراض القلب', en: 'Cardiology' },
    dermatology: { ar: 'الجلدية', en: 'Dermatology' },
    orthopedics: { ar: 'جراحة العظام', en: 'Orthopedics' },
    neurology: { ar: 'الأعصاب', en: 'Neurology' },
    pediatrics: { ar: 'طب الأطفال', en: 'Pediatrics' },
    gynecology: { ar: 'نساء وتوليد', en: 'Gynecology' },
    psychiatry: { ar: 'الطب النفسي', en: 'Psychiatry' }
};

function departmentLabel(code) {
    return (departmentMap[code]?.[currentLang]) || code;
}

function tValue(v) {
    return (v && typeof v === 'object') ? v[currentLang] : v;
}

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Courses Data Generation (160 courses)
const courseTitles = [
    { ar: "أساسيات", en: "Basics of" },
    { ar: "متقدم في", en: "Advanced" },
    { ar: "دليل", en: "Guide to" },
    { ar: "تشخيص", en: "Diagnosis of" },
    { ar: "علاجات", en: "Treatments for" },
    { ar: "جراحة", en: "Surgery in" }
];
const depts = Object.keys(departmentMap);
const courses = [];

for (let i = 1; i <= 160; i++) {
    const dept = depts[i % depts.length];
    const titlePrefix = courseTitles[i % courseTitles.length];
    const deptName = departmentMap[dept];
    courses.push({
        id: i,
        title: {
            ar: `${titlePrefix.ar} ${deptName.ar} - مستوى ${Math.ceil(i / depts.length)}`,
            en: `${titlePrefix.en} ${deptName.en} - Level ${Math.ceil(i / depts.length)}`
        },
        description: {
            ar: `كورس شامل يغطي أهم جوانب ${deptName.ar} بالتفصيل مع أمثلة وتدريب عملي.`,
            en: `A comprehensive course covering the most important aspects of ${deptName.en} with practical examples.`
        },
        department: dept,
        duration: { ar: `${(i % 20) + 5} ساعة`, en: `${(i % 20) + 5} hours` },
        lessons: (i % 30) + 10,
        instructor: { ar: `د. باسم ${i}`, en: `Dr. Basem ${i}` },
        price: 100 + (i * 5),
        rating: (4 + Math.random()).toFixed(1),
        students: Math.floor(Math.random() * 5000),
        image: ['🩺', '🧬', '🧠', '🫀', '👶', '🦴', '🧪', '🏥'][i % 8]
    });
}

// Tips Arcade (100,000 generated tips)
const TIPS_TOTAL = 100000;
const tipCategories = [
    { key: 'hydration', label: { ar: 'الترطيب', en: 'Hydration' }, color: 'blue', icon: 'fa-droplet', emoji: '💧' },
    { key: 'sleep', label: { ar: 'النوم', en: 'Sleep' }, color: 'indigo', icon: 'fa-moon', emoji: '🌙' },
    { key: 'nutrition', label: { ar: 'التغذية', en: 'Nutrition' }, color: 'emerald', icon: 'fa-apple-whole', emoji: '🍎' },
    { key: 'activity', label: { ar: 'النشاط', en: 'Activity' }, color: 'orange', icon: 'fa-person-walking', emoji: '🏃' },
    { key: 'hygiene', label: { ar: 'النظافة', en: 'Hygiene' }, color: 'cyan', icon: 'fa-hands-wash', emoji: '🧼' },
    { key: 'mental', label: { ar: 'الصحة النفسية', en: 'Mental health' }, color: 'fuchsia', icon: 'fa-brain', emoji: '🧠' },
    { key: 'medsafety', label: { ar: 'أمان الدواء', en: 'Medication safety' }, color: 'rose', icon: 'fa-pills', emoji: '💊' },
    { key: 'prevention', label: { ar: 'الوقاية', en: 'Prevention' }, color: 'teal', icon: 'fa-shield-heart', emoji: '🛡️' }
];

const tipLex = {
    amountsAr: ['كمية كافية', 'رشفات منتظمة', 'كوبًا إضافيًا', 'قدرًا مناسبًا'],
    amountsEn: ['a sufficient amount', 'regular sips', 'an extra cup', 'a reasonable amount'],
    foodsAr: ['الخضار', 'الفاكهة', 'الحبوب الكاملة', 'البقوليات', 'البروتينات قليلة الدهون'],
    foodsEn: ['vegetables', 'fruits', 'whole grains', 'legumes', 'lean proteins'],
    habitsAr: ['قبل النوم', 'بعد الاستيقاظ', 'أثناء العمل', 'بعد الأكل'],
    habitsEn: ['before bed', 'after waking up', 'during work', 'after meals'],
    minutesAr: ['10', '15', '20', '30'],
    minutesEn: ['10', '15', '20', '30'],
    remindersAr: ['منبّه', 'ملاحظة على الهاتف', 'روتين ثابت', 'تطبيق متابعة'],
    remindersEn: ['a timer', 'a phone note', 'a consistent routine', 'a tracking app']
};

const tipTemplates = {
    hydration: [
        {
            ar: 'اشرب {amount} من الماء خلال اليوم، خاصة في الجو الحار أو عند الحركة.',
            en: 'Drink {amount} of water throughout the day, especially in hot weather or when active.'
        },
        {
            ar: 'لو بولك غامق باستمرار، قد تحتاج لزيادة السوائل (حسب حالتك الصحية).',
            en: 'If your urine is consistently dark, you may need more fluids (depending on your health condition).'
        },
        {
            ar: 'قلّل المشروبات المُحلاة واستبدلها بالماء أو مشروبات بدون سكر قدر الإمكان.',
            en: 'Limit sugary drinks and replace them with water or unsweetened beverages when possible.'
        }
    ],
    sleep: [
        {
            ar: 'حاول الحفاظ على 7–9 ساعات نوم للكبار إن أمكن، مع وقت نوم واستيقاظ ثابت.',
            en: 'Aim for 7–9 hours of sleep for adults when possible, with consistent sleep/wake times.'
        },
        {
            ar: 'تجنب الشاشات قبل النوم بـ 30–60 دقيقة لتحسين جودة النوم.',
            en: 'Avoid screens 30–60 minutes before bed to improve sleep quality.'
        },
        {
            ar: 'قلّل الكافيين بعد العصر إذا كنت تعاني من صعوبة في النوم.',
            en: 'Reduce caffeine after mid-afternoon if you have trouble sleeping.'
        }
    ],
    nutrition: [
        {
            ar: 'اجعل جزءًا كبيرًا من وجبتك من {food} لتقليل السعرات وزيادة الألياف.',
            en: 'Make a large part of your meal {food} to add fiber and help manage calories.'
        },
        {
            ar: 'اقرأ الملصق الغذائي: انتبه للسكر المضاف والملح والدهون المشبعة.',
            en: 'Read nutrition labels: watch added sugar, salt, and saturated fat.'
        },
        {
            ar: 'قسّم الأكل على وجبات منتظمة بدلًا من وجبة كبيرة جدًا متأخرة.',
            en: 'Spread food into regular meals instead of a very large late meal.'
        }
    ],
    activity: [
        {
            ar: 'حركة {minutes} دقائق {habit} أفضل من لا شيء—ابدأ تدريجيًا.',
            en: '{minutes} minutes of movement {habit} is better than none—start gradually.'
        },
        {
            ar: 'استهدف نشاطًا بدنيًا منتظمًا حسب قدرتك (مثل المشي السريع).',
            en: 'Aim for regular physical activity within your ability (such as brisk walking).'
        },
        {
            ar: 'لو تقعد كتير، قوم اتحرك كل ساعة حتى لو دقيقة أو دقيقتين.',
            en: 'If you sit for long periods, stand and move every hour even for 1–2 minutes.'
        }
    ],
    hygiene: [
        {
            ar: 'اغسل يديك لمدة 20 ثانية بالماء والصابون، خصوصًا قبل الأكل وبعد الحمام.',
            en: 'Wash hands for 20 seconds with soap and water, especially before eating and after using the restroom.'
        },
        {
            ar: 'غطِّ فمك وأنفك عند السعال/العطس بمنديل أو ثنية الكوع.',
            en: 'Cover your mouth/nose when coughing/sneezing with a tissue or your elbow.'
        },
        {
            ar: 'نظّف الأسطح كثيرة اللمس بشكل دوري خصوصًا وقت العدوى.',
            en: 'Clean high-touch surfaces regularly, especially during outbreaks.'
        }
    ],
    mental: [
        {
            ar: 'جرّب تمرين تنفّس بطيء لمدة دقيقة عندما تشعر بالتوتر.',
            en: 'Try one minute of slow breathing when you feel stressed.'
        },
        {
            ar: 'تواصل مع شخص تثق به إذا شعرت بضيق مستمر—الدعم مهم.',
            en: 'Reach out to someone you trust if distress persists—support matters.'
        },
        {
            ar: 'لو الأعراض النفسية تؤثر على حياتك اليومية، استشارة مختص خطوة مفيدة.',
            en: 'If mental symptoms affect daily life, consulting a professional can help.'
        }
    ],
    medsafety: [
        {
            ar: 'لا تتناول مضادًا حيويًا دون وصفة—سوء الاستخدام يزيد مقاومة البكتيريا.',
            en: 'Avoid antibiotics without a prescription—misuse contributes to resistance.'
        },
        {
            ar: 'اقرأ تعليمات الدواء ولا تجمع أدوية متعددة دون سؤال طبيب/صيدلي.',
            en: 'Read medication instructions and avoid combining drugs without asking a doctor/pharmacist.'
        },
        {
            ar: 'احفظ الأدوية بعيدًا عن الأطفال، وتأكد من تاريخ الصلاحية.',
            en: 'Keep medicines away from children and check expiration dates.'
        }
    ],
    prevention: [
        {
            ar: 'اتبع التطعيمات الموصى بها حسب عمرك وحالتك الصحية (استشر الطبيب).',
            en: 'Follow recommended vaccines based on your age and health status (consult your clinician).'
        },
        {
            ar: 'الفحوصات الدورية تساعد على اكتشاف بعض الأمراض مبكرًا.',
            en: 'Regular checkups can help detect some conditions early.'
        },
        {
            ar: 'إذا كان لديك مرض مزمن، الالتزام بالخطة العلاجية والمتابعة يقلل المضاعفات.',
            en: 'If you have a chronic condition, following your care plan and checkups can reduce complications.'
        }
    ]
};

function getTipCategory(key) {
    return tipCategories.find(c => c.key === key) || tipCategories[0];
}

function formatTemplate(str, vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

function getTipByIndex(idx) {
    const i = ((idx % TIPS_TOTAL) + TIPS_TOTAL) % TIPS_TOTAL;
    const cat = tipCategories[i % tipCategories.length];
    const templates = tipTemplates[cat.key] || tipTemplates.hydration;
    const t = templates[Math.floor(i / tipCategories.length) % templates.length];

    const vars = {
        amount: currentLang === 'ar'
            ? tipLex.amountsAr[Math.floor(i / 13) % tipLex.amountsAr.length]
            : tipLex.amountsEn[Math.floor(i / 13) % tipLex.amountsEn.length],
        food: currentLang === 'ar'
            ? tipLex.foodsAr[Math.floor(i / 17) % tipLex.foodsAr.length]
            : tipLex.foodsEn[Math.floor(i / 17) % tipLex.foodsEn.length],
        habit: currentLang === 'ar'
            ? tipLex.habitsAr[Math.floor(i / 19) % tipLex.habitsAr.length]
            : tipLex.habitsEn[Math.floor(i / 19) % tipLex.habitsEn.length],
        minutes: currentLang === 'ar'
            ? tipLex.minutesAr[Math.floor(i / 23) % tipLex.minutesAr.length]
            : tipLex.minutesEn[Math.floor(i / 23) % tipLex.minutesEn.length],
        reminder: currentLang === 'ar'
            ? tipLex.remindersAr[Math.floor(i / 29) % tipLex.remindersAr.length]
            : tipLex.remindersEn[Math.floor(i / 29) % tipLex.remindersEn.length]
    };

    return {
        id: i + 1,
        index: i,
        category: cat.key,
        text: formatTemplate(currentLang === 'ar' ? t.ar : t.en, vars),
        emoji: cat.emoji
    };
}

const tipsState = {
    tab: 'cards',
    selectedCategories: new Set(tipCategories.map(c => c.key)),
    cardsIndex: randInt(0, TIPS_TOTAL - 1),
    quiz: {
        tipIndex: randInt(0, TIPS_TOTAL - 1),
        correctCategory: null,
        options: []
    },
    challenge: {
        active: false,
        timeLeft: 30,
        points: 0,
        tipIndex: randInt(0, TIPS_TOTAL - 1),
        correctCategory: null,
        options: []
    },
    favoritesMode: false,
    favoritesList: []
};

let challengeTimer = null;

function loadTipsStats() {
    const score = parseInt(localStorage.getItem(STORAGE_KEYS.tipsScore) || '0', 10);
    const streak = parseInt(localStorage.getItem(STORAGE_KEYS.tipsStreak) || '0', 10);
    document.getElementById('tipsScore').textContent = String(isFinite(score) ? score : 0);
    document.getElementById('tipsStreak').textContent = String(isFinite(streak) ? streak : 0);
}

function saveTipsStats(score, streak) {
    localStorage.setItem(STORAGE_KEYS.tipsScore, String(score));
    localStorage.setItem(STORAGE_KEYS.tipsStreak, String(streak));
    loadTipsStats();
}

function getTipsFavorites() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.tipsFavorites);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(n => Number.isInteger(n) && n >= 1 && n <= TIPS_TOTAL) : [];
    } catch {
        return [];
    }
}

function saveTipsFavorites(list) {
    localStorage.setItem(STORAGE_KEYS.tipsFavorites, JSON.stringify(list));
    document.getElementById('tipsFavCount').textContent = String(list.length);
}

function isFavoriteTipId(id) {
    const fav = new Set(getTipsFavorites());
    return fav.has(id);
}

function renderTipsCategories() {
    const wrap = document.getElementById('tipsCategories');
    if (!wrap) return;

    wrap.innerHTML = tipCategories.map(cat => {
        const active = tipsState.selectedCategories.has(cat.key);
        return `
                    <button type="button" onclick="tipsToggleCategory('${cat.key}')" class="px-3 py-2 rounded-xl border text-sm flex items-center justify-between gap-2 ${active ? 'bg-' + cat.color + '-100 text-' + cat.color + '-800 border-' + cat.color + '-200' : 'bg-white hover:bg-gray-50 text-gray-700'}">
                        <span class="flex items-center gap-2"><span>${cat.emoji}</span><span>${tValue(cat.label)}</span></span>
                        <i class="fas ${active ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                `;
    }).join('');

    // quiz filter
    const qWrap = document.getElementById('quizCategoryFilter');
    if (qWrap) {
        qWrap.innerHTML = tipCategories.map(cat => {
            const active = tipsState.selectedCategories.has(cat.key);
            return `
                        <button type="button" onclick="tipsToggleCategory('${cat.key}', true)" class="px-3 py-2 rounded-xl border text-sm flex items-center justify-between gap-2 ${active ? 'bg-' + cat.color + '-100 text-' + cat.color + '-800 border-' + cat.color + '-200' : 'bg-white hover:bg-gray-50 text-gray-700'}">
                            <span class="flex items-center gap-2"><span>${cat.emoji}</span><span>${tValue(cat.label)}</span></span>
                            <i class="fas ${active ? 'fa-check' : 'fa-plus'}"></i>
                        </button>
                    `;
        }).join('');
    }
}

function tipsSetAllCategories() {
    tipsState.selectedCategories = new Set(tipCategories.map(c => c.key));
    renderTipsCategories();
    tipsRenderCards();
    tipsNewQuiz();
}

function tipsToggleCategory(key, keepTab) {
    if (tipsState.selectedCategories.has(key)) {
        if (tipsState.selectedCategories.size <= 2) {
            showToast(currentLang === 'ar' ? 'لا يمكن إلغاء كل الفئات.' : 'You cannot disable all categories.');
            return;
        }
        tipsState.selectedCategories.delete(key);
    } else {
        tipsState.selectedCategories.add(key);
    }

    renderTipsCategories();
    if (!keepTab) tipsRenderCards();
    tipsNewQuiz();
}

function tipsSwitchTab(tab) {
    tipsState.tab = tab;
    document.getElementById('tipsTabCards').classList.toggle('hidden', tab !== 'cards');
    document.getElementById('tipsTabQuiz').classList.toggle('hidden', tab !== 'quiz');
    document.getElementById('tipsTabChallenge').classList.toggle('hidden', tab !== 'challenge');

    document.querySelectorAll('.tips-tab').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        if (isActive) {
            btn.className = 'tips-tab px-4 py-2 rounded-full bg-gray-900 text-white';
        } else {
            btn.className = 'tips-tab px-4 py-2 rounded-full bg-white/50 hover:bg-white/70 transition border border-white/40';
        }
    });

    if (tab === 'quiz') tipsNewQuiz();
    if (tab === 'challenge') tipsResetChallengeUI();
}

function tipsPickIndexFromSelected() {
    // Try a few times to find a tip in selected categories
    for (let tries = 0; tries < 30; tries++) {
        const idx = randInt(0, TIPS_TOTAL - 1);
        const cat = tipCategories[idx % tipCategories.length].key;
        if (tipsState.selectedCategories.has(cat)) return idx;
    }
    return randInt(0, TIPS_TOTAL - 1);
}

function tipsGetCurrentCardTip() {
    if (tipsState.favoritesMode) {
        const fav = getTipsFavorites();
        tipsState.favoritesList = fav;
        if (fav.length === 0) return null;
        const safeIdx = clamp(tipsState.cardsIndex, 0, fav.length - 1);
        const tipId = fav[safeIdx];
        return getTipByIndex(tipId - 1);
    }
    return getTipByIndex(tipsState.cardsIndex);
}

function tipsRenderCards() {
    const tip = tipsGetCurrentCardTip();
    const pill = document.getElementById('tipCategoryPill');
    const txt = document.getElementById('tipText');
    const idx = document.getElementById('tipIndex');
    const emoji = document.getElementById('tipEmoji');
    const favPill = document.getElementById('tipModePill');

    if (!pill || !txt || !idx || !emoji || !favPill) return;

    if (!tip) {
        pill.textContent = currentLang === 'ar' ? 'لا توجد مفضلة' : 'No favorites';
        pill.className = 'px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700';
        txt.textContent = currentLang === 'ar'
            ? 'لم تقم بحفظ أي نصيحة بعد. اضغط "حفظ" على أي بطاقة لإضافتها للمفضلة.'
            : 'You have not saved any tips yet. Click "Save" on any card to add it to favorites.';
        idx.textContent = '#—';
        emoji.textContent = '⭐';
        favPill.classList.remove('hidden');
        tipsUpdateFavButton(null);
        return;
    }

    const cat = getTipCategory(tip.category);
    pill.textContent = tValue(cat.label);
    pill.className = `px-3 py-1 rounded-full text-sm font-semibold bg-${cat.color}-100 text-${cat.color}-800`;
    txt.textContent = tip.text;
    idx.textContent = tipsState.favoritesMode ? `#${tip.id} • ${currentLang === 'ar' ? 'مفضلة' : 'Favorite'}` : `#${tip.id} / ${TIPS_TOTAL}`;
    emoji.textContent = tip.emoji;

    favPill.classList.toggle('hidden', !tipsState.favoritesMode);
    tipsUpdateFavButton(tip.id);
}

function tipsUpdateFavButton(tipId) {
    const icon = document.getElementById('tipFavIcon');
    if (!icon) return;
    if (!tipId) {
        icon.className = 'fas fa-heart ml-2 text-gray-400';
        return;
    }
    const fav = isFavoriteTipId(tipId);
    icon.className = `fas fa-heart ml-2 ${fav ? 'text-pink-600' : 'text-gray-400'}`;
}

function tipsNext() {
    if (tipsState.favoritesMode) {
        const fav = getTipsFavorites();
        if (fav.length === 0) return;
        tipsState.cardsIndex = (tipsState.cardsIndex + 1) % fav.length;
        tipsRenderCards();
        return;
    }
    // find next within selected categories
    let next = tipsState.cardsIndex;
    for (let step = 0; step < 1000; step++) {
        next = (next + 1) % TIPS_TOTAL;
        const catKey = tipCategories[next % tipCategories.length].key;
        if (tipsState.selectedCategories.has(catKey)) {
            tipsState.cardsIndex = next;
            break;
        }
    }
    tipsRenderCards();
}

function tipsPrev() {
    if (tipsState.favoritesMode) {
        const fav = getTipsFavorites();
        if (fav.length === 0) return;
        tipsState.cardsIndex = (tipsState.cardsIndex - 1 + fav.length) % fav.length;
        tipsRenderCards();
        return;
    }
    let prev = tipsState.cardsIndex;
    for (let step = 0; step < 1000; step++) {
        prev = (prev - 1 + TIPS_TOTAL) % TIPS_TOTAL;
        const catKey = tipCategories[prev % tipCategories.length].key;
        if (tipsState.selectedCategories.has(catKey)) {
            tipsState.cardsIndex = prev;
            break;
        }
    }
    tipsRenderCards();
}

function tipsShuffle() {
    tipsState.favoritesMode = false;
    document.getElementById('tipModePill')?.classList.add('hidden');
    tipsState.cardsIndex = tipsPickIndexFromSelected();
    tipsRenderCards();
    if (tipsState.tab === 'quiz') tipsNewQuiz();
}

function tipsToggleFavoritesView() {
    tipsState.favoritesMode = !tipsState.favoritesMode;
    tipsState.cardsIndex = 0;
    tipsRenderCards();
}

function tipsToggleFavorite() {
    const tip = tipsGetCurrentCardTip();
    if (!tip) return;

    const fav = getTipsFavorites();
    const set = new Set(fav);
    if (set.has(tip.id)) {
        set.delete(tip.id);
        showToast(currentLang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites');
    } else {
        set.add(tip.id);
        showToast(currentLang === 'ar' ? 'تم الحفظ في المفضلة' : 'Saved to favorites');
    }
    const nextList = Array.from(set).sort((a, b) => a - b);
    saveTipsFavorites(nextList);
    tipsUpdateFavButton(tip.id);

    if (tipsState.favoritesMode) {
        // re-sync
        tipsState.cardsIndex = clamp(tipsState.cardsIndex, 0, Math.max(0, nextList.length - 1));
        tipsRenderCards();
    }
}

async function tipsCopy() {
    const tip = tipsGetCurrentCardTip();
    if (!tip) return;
    const cat = getTipCategory(tip.category);
    const text = `${tValue(cat.label)} — #${tip.id}/${TIPS_TOTAL}\n${tip.text}`;
    try {
        await navigator.clipboard.writeText(text);
        showToast(currentLang === 'ar' ? 'تم النسخ' : 'Copied');
    } catch {
        showToast(currentLang === 'ar' ? 'تعذر النسخ — انسخ يدويًا' : 'Copy failed — please copy manually');
    }
}

function tipsBuildOptions(correctKey, count) {
    const allowed = tipCategories.filter(c => tipsState.selectedCategories.has(c.key)).map(c => c.key);
    const base = allowed.length >= 2 ? allowed : tipCategories.map(c => c.key);
    const others = base.filter(k => k !== correctKey);
    const pick = shuffle(others).slice(0, Math.max(0, count - 1));
    const options = shuffle([correctKey, ...pick]);
    return options;
}

function tipsNewQuiz() {
    tipsState.quiz.tipIndex = tipsPickIndexFromSelected();
    const tip = getTipByIndex(tipsState.quiz.tipIndex);
    tipsState.quiz.correctCategory = tip.category;

    const countSel = document.getElementById('quizChoicesCount');
    const count = parseInt(countSel?.value || '4', 10);
    tipsState.quiz.options = tipsBuildOptions(tip.category, clamp(isFinite(count) ? count : 4, 2, 4));

    const tEl = document.getElementById('quizTipText');
    const optionsEl = document.getElementById('quizOptions');
    const fb = document.getElementById('quizFeedback');

    if (tEl) tEl.textContent = tip.text;
    if (fb) fb.classList.add('hidden');

    if (optionsEl) {
        optionsEl.innerHTML = tipsState.quiz.options.map(k => {
            const cat = getTipCategory(k);
            return `
                        <button type="button" onclick="tipsAnswerQuiz('${k}')" class="px-4 py-4 rounded-xl border bg-white hover:bg-gray-50 transition flex items-center justify-between">
                            <span class="flex items-center gap-2"><span>${cat.emoji}</span><span class="font-bold text-gray-900">${tValue(cat.label)}</span></span>
                            <i class="fas fa-circle-question text-gray-400"></i>
                        </button>
                    `;
        }).join('');
    }
}

function tipsAnswerQuiz(chosenKey) {
    const fb = document.getElementById('quizFeedback');
    const correct = chosenKey === tipsState.quiz.correctCategory;

    let score = parseInt(localStorage.getItem(STORAGE_KEYS.tipsScore) || '0', 10);
    let streak = parseInt(localStorage.getItem(STORAGE_KEYS.tipsStreak) || '0', 10);
    score = isFinite(score) ? score : 0;
    streak = isFinite(streak) ? streak : 0;

    if (correct) {
        score += 10;
        streak += 1;
    } else {
        streak = 0;
        score = Math.max(0, score - 2);
    }

    saveTipsStats(score, streak);

    if (!fb) return;
    const correctCat = getTipCategory(tipsState.quiz.correctCategory);
    const chosenCat = getTipCategory(chosenKey);

    fb.classList.remove('hidden');
    fb.className = `mt-4 rounded-xl p-4 border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;
    fb.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center ${correct ? 'bg-green-600' : 'bg-red-600'} text-white">
                        <i class="fas ${correct ? 'fa-check' : 'fa-xmark'}"></i>
                    </div>
                    <div>
                        <div class="font-extrabold text-gray-900">${correct ? (currentLang === 'ar' ? 'صح!' : 'Correct!') : (currentLang === 'ar' ? 'غلط' : 'Wrong')}</div>
                        <div class="text-gray-700 mt-1">
                            ${correct
            ? (currentLang === 'ar' ? `الفئة: ${tValue(correctCat.label)} ${correctCat.emoji}` : `Category: ${tValue(correctCat.label)} ${correctCat.emoji}`)
            : (currentLang === 'ar'
                ? `اختيارك: ${tValue(chosenCat.label)} — الصحيح: ${tValue(correctCat.label)} ${correctCat.emoji}`
                : `Your choice: ${tValue(chosenCat.label)} — Correct: ${tValue(correctCat.label)} ${correctCat.emoji}`)
        }
                        </div>
                        <button type="button" onclick="tipsNewQuiz()" class="mt-3 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90 transition">
                            <i class="fas fa-arrow-left ml-2"></i>${currentLang === 'ar' ? 'التالي' : 'Next'}
                        </button>
                    </div>
                </div>
            `;
}

function tipsResetChallengeUI() {
    const t = document.getElementById('challengeTime');
    const p = document.getElementById('challengePoints');
    const tipEl = document.getElementById('challengeTipText');
    const opts = document.getElementById('challengeOptions');
    const fb = document.getElementById('challengeFeedback');

    if (t) t.textContent = '30';
    if (p) p.textContent = '0';
    if (tipEl) tipEl.textContent = currentLang === 'ar' ? 'اضغط ابدأ' : 'Press Start';
    if (opts) opts.innerHTML = '';
    if (fb) fb.classList.add('hidden');

    tipsState.challenge.active = false;
    tipsState.challenge.timeLeft = 30;
    tipsState.challenge.points = 0;

    if (challengeTimer) {
        clearInterval(challengeTimer);
        challengeTimer = null;
    }
}

function tipsStartChallenge() {
    tipsResetChallengeUI();
    tipsState.challenge.active = true;
    tipsState.challenge.timeLeft = 30;
    tipsState.challenge.points = 0;
    document.getElementById('challengePoints').textContent = '0';
    document.getElementById('challengeTime').textContent = '30';

    tipsNextChallengeQuestion();

    challengeTimer = setInterval(() => {
        tipsState.challenge.timeLeft -= 1;
        document.getElementById('challengeTime').textContent = String(Math.max(0, tipsState.challenge.timeLeft));
        if (tipsState.challenge.timeLeft <= 0) {
            clearInterval(challengeTimer);
            challengeTimer = null;
            tipsState.challenge.active = false;
            tipsEndChallenge();
        }
    }, 1000);
}

function tipsNextChallengeQuestion() {
    if (!tipsState.challenge.active) return;
    tipsState.challenge.tipIndex = tipsPickIndexFromSelected();
    const tip = getTipByIndex(tipsState.challenge.tipIndex);
    tipsState.challenge.correctCategory = tip.category;
    tipsState.challenge.options = tipsBuildOptions(tip.category, 4);

    document.getElementById('challengeTipText').textContent = tip.text;
    const optionsEl = document.getElementById('challengeOptions');
    const fb = document.getElementById('challengeFeedback');
    if (fb) fb.classList.add('hidden');

    if (optionsEl) {
        optionsEl.innerHTML = tipsState.challenge.options.map(k => {
            const cat = getTipCategory(k);
            return `
                        <button type="button" onclick="tipsAnswerChallenge('${k}')" class="px-4 py-4 rounded-xl border bg-white hover:bg-gray-50 transition flex items-center justify-center gap-2 font-bold">
                            <span>${cat.emoji}</span><span>${tValue(cat.label)}</span>
                        </button>
                    `;
        }).join('');
    }
}

function tipsAnswerChallenge(chosenKey) {
    if (!tipsState.challenge.active) return;

    const fb = document.getElementById('challengeFeedback');
    const correct = chosenKey === tipsState.challenge.correctCategory;

    if (correct) {
        tipsState.challenge.points += 1;
        document.getElementById('challengePoints').textContent = String(tipsState.challenge.points);
    }

    if (fb) {
        const correctCat = getTipCategory(tipsState.challenge.correctCategory);
        fb.classList.remove('hidden');
        fb.className = `mt-4 rounded-xl p-4 border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`;
        fb.innerHTML = `
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                        <div class="font-extrabold text-gray-900">${correct ? (currentLang === 'ar' ? 'صح!' : 'Correct!') : (currentLang === 'ar' ? 'غلط' : 'Wrong')}</div>
                        <div class="text-gray-700">${currentLang === 'ar' ? `الصحيح: ${tValue(correctCat.label)} ${correctCat.emoji}` : `Correct: ${tValue(correctCat.label)} ${correctCat.emoji}`}</div>
                    </div>
                `;
    }

    // Next fast
    setTimeout(() => {
        if (tipsState.challenge.active) tipsNextChallengeQuestion();
    }, 350);
}

function tipsEndChallenge() {
    const points = tipsState.challenge.points;
    const fb = document.getElementById('challengeFeedback');
    if (fb) {
        fb.classList.remove('hidden');
        fb.className = 'mt-4 rounded-xl p-4 border bg-indigo-50 border-indigo-200';
        fb.innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div>
                            <div class="font-extrabold text-gray-900">${currentLang === 'ar' ? 'انتهى التحدي!' : 'Challenge finished!'}</div>
                            <div class="text-gray-700 mt-1">${currentLang === 'ar' ? `أحرزت ${points} نقطة.` : `You scored ${points} points.`}</div>
                            <button type="button" onclick="tipsStartChallenge()" class="mt-3 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90 transition">
                                <i class="fas fa-rotate ml-2"></i>${currentLang === 'ar' ? 'إعادة' : 'Retry'}
                            </button>
                        </div>
                    </div>
                `;
    }
}

function tipsInit() {
    document.getElementById('tipsTotal').textContent = (new Intl.NumberFormat(currentLang === 'ar' ? 'ar-EG' : 'en-US')).format(TIPS_TOTAL);
    saveTipsFavorites(getTipsFavorites());
    loadTipsStats();
    renderTipsCategories();
    tipsRenderCards();
    tipsNewQuiz();
    tipsResetChallengeUI();
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    updateLanguage();
    renderCourses('all');
    updatePainSlider();
    setMinBookingDate();
    updateStats();
    renderRecentBookings();
    tipsInit();

    // Keyboard shortcuts for tips
    document.addEventListener('keydown', (e) => {
        // avoid interfering with typing
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        const typing = tag === 'input' || tag === 'textarea' || tag === 'select';
        if (typing) return;

        if (currentPage === 'tipsArcadePage') {
            const k = e.key.toLowerCase();
            if (k === 'n') {
                if (tipsState.tab === 'cards') tipsNext();
                if (tipsState.tab === 'quiz') tipsNewQuiz();
            }
            if (k === 'p') {
                if (tipsState.tab === 'cards') tipsPrev();
            }
        }
    });
});

// Language Toggle
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    updateLanguage();
}

function updateLanguage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // Update all text content with data attributes
    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            // Update placeholder
            if (el.dataset['placeholder' + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)]) {
                el.placeholder = el.dataset['placeholder' + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)];
            } else if (el.placeholder) {
                el.placeholder = el.dataset[currentLang] || el.placeholder;
            }
        } else {
            el.textContent = el.dataset[currentLang];
        }
    });

    // Update all placeholders with data-placeholder attributes
    document.querySelectorAll('[data-placeholder-ar][data-placeholder-en]').forEach(el => {
        el.placeholder = el.dataset['placeholder' + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)];
    });

    // Re-render dynamic parts
    renderCourses(currentCourseFilter);
    renderRecentBookings();
    updateStats();
    tipsInit();

    // Update modal if open
    const modal = document.getElementById('courseModal');
    if (selectedCourse && modal && !modal.classList.contains('hidden')) {
        openCourseModal(selectedCourse.id);
    }
}

// Dark Mode Toggle
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    document.getElementById('darkIcon').className = isDarkMode ? 'fas fa-sun text-yellow-400 text-xl' : 'fas fa-moon text-gray-600 text-xl';
    localStorage.setItem('darkMode', isDarkMode);
}

// Check saved dark mode
const savedDark = localStorage.getItem('darkMode');
if (!savedDark || savedDark === 'true') {
    document.body.classList.add('dark');
    isDarkMode = true;
    document.getElementById('darkIcon').className = 'fas fa-sun text-yellow-400 text-xl';
    localStorage.setItem('darkMode', 'true');
}

// Page Navigation
function showPage(pageId) {
    const page = document.getElementById(pageId);
    if (!page) {
        console.warn('Page not found:', pageId);
        showToast(currentLang === 'ar' ? 'صفحة غير موجودة!' : 'Page not found!');
        return;
    }

    // Guard: dashboard requires login
    if (pageId === 'dashboardPage' && !isLoggedIn) {
        showToast(currentLang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
        showPage('loginPage');
        return;
    }

    document.querySelectorAll('main > div').forEach(div => div.classList.add('hidden'));
    page.classList.remove('hidden');
    currentPage = pageId;

    if (pageId === 'bookingPage') setMinBookingDate();
    if (pageId === 'tipsArcadePage') tipsInit();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    if (isLoggedIn) {
        showPage('dashboardPage');
    } else {
        showPage('loginPage');
    }
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        isLoggedIn = true;
        showToast(currentLang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
        showPage('dashboardPage');
        renderRecentBookings();
        updateStats();
    }
}

// Logout
function logout() {
    isLoggedIn = false;
    showToast(currentLang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
    showPage('loginPage');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// Booking storage
function getBookings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.bookings);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
}

function addBooking(booking) {
    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);
}

function clearAllBookings() {
    if (!confirm(currentLang === 'ar' ? 'هل تريد مسح كل الحجوزات؟' : 'Do you want to clear all bookings?')) return;
    saveBookings([]);
    renderRecentBookings();
    updateStats();
    showToast(currentLang === 'ar' ? 'تم مسح الحجوزات' : 'Bookings cleared');
}

// Booking Handler
function handleBooking(e) {
    e.preventDefault();

    const booking = {
        id: String(Date.now()),
        createdAt: Date.now(),
        status: 'pending',
        name: document.getElementById('patientName').value.trim(),
        phone: document.getElementById('patientPhone').value.trim(),
        email: document.getElementById('patientEmail').value.trim(),
        age: document.getElementById('patientAge').value,
        department: document.getElementById('department').value,
        date: document.getElementById('appointmentDate').value,
        symptoms: document.getElementById('symptoms').value.trim()
    };

    addBooking(booking);
    updateStats();
    renderRecentBookings();

    // Open email draft
    sendBookingEmail(booking);

    showToast(currentLang === 'ar' ? 'تم تسجيل الحجز وفتح رسالة البريد لإرسال التفاصيل.' : 'Booking saved and email draft opened.');

    e.target.reset();

    if (isLoggedIn) {
        showPage('dashboardPage');
    } else {
        showPage('loginPage');
    }
}

// Send Email (mailto)
function sendBookingEmail(booking) {
    const to = 'adam.sherif.aboasy@gmail.com';
    const subject = currentLang === 'ar'
        ? `حجز جديد - ${booking.name} - ${booking.date}`
        : `New Booking - ${booking.name} - ${booking.date}`;

    const bodyLines = [
        currentLang === 'ar' ? 'تم استلام حجز جديد:' : 'New booking received:',
        '',
        `${currentLang === 'ar' ? 'الاسم' : 'Name'}: ${booking.name}`,
        `${currentLang === 'ar' ? 'الموبايل' : 'Phone'}: ${booking.phone}`,
        `${currentLang === 'ar' ? 'الإيميل' : 'Email'}: ${booking.email}`,
        `${currentLang === 'ar' ? 'العمر' : 'Age'}: ${booking.age}`,
        `${currentLang === 'ar' ? 'القسم' : 'Department'}: ${departmentLabel(booking.department)}`,
        `${currentLang === 'ar' ? 'التاريخ' : 'Date'}: ${booking.date}`,
        `${currentLang === 'ar' ? 'وصف الحالة' : 'Symptoms'}: ${booking.symptoms || '—'}`,
        '',
        currentLang === 'ar' ? 'ملحوظة: تم إنشاء هذه الرسالة تلقائياً من النظام.' : 'Note: This email was generated by the system.'
    ];

    const body = bodyLines.join('\n');
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
        window.open(url, '_blank');
    } catch (e) {
        console.warn('Could not open mail client', e);
    }

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(body).catch(() => { });
    }
}

function updateStats() {
    const bookings = getBookings();
    const uniquePatients = new Set(bookings.map(b => (b.email || b.phone || '').toLowerCase()).filter(Boolean));

    const statPatients = document.getElementById('statPatients');
    const statAppointments = document.getElementById('statAppointments');
    const statCourses = document.getElementById('statCourses');
    const statRating = document.getElementById('statRating');

    if (statPatients) statPatients.textContent = String(uniquePatients.size);
    if (statAppointments) statAppointments.textContent = String(bookings.length);
    if (statCourses) statCourses.textContent = String(courses.length);

    if (statRating) statRating.textContent = bookings.length === 0 ? "0" : "4.9";
}


// AI Doctor System - Advanced with 10-32 Questions
let aiChatState = {
    step: 0,
    questionIndex: 0,
    data: {
        age: null,
        gender: null,
        symptoms: '',
        duration: null,
        painLevel: null,
        painLocation: null,
        painType: null,
        frequency: null,
        triggers: null,
        relievers: null,
        associatedSymptoms: [],
        chronicDiseases: [],
        currentMedications: [],
        allergies: [],
        familyHistory: [],
        lifestyle: {},
        recentTravel: null,
        recentExposure: null,
        weight: null,
        height: null,
        sleepQuality: null,
        stressLevel: null,
        appetite: null,
        answers: []
    },
    context: null,
    questionsAsked: 0,
    maxQuestions: 15 // Will ask 10-15 questions based on context
};

// Dynamic Question Bank
const aiQuestions = {
    general: [
        { key: 'duration', ar: 'منذ متى بدأت هذه الأعراض؟ (بالأيام أو الأسابيع)', en: 'How long have you had these symptoms? (in days or weeks)' },
        { key: 'painLevel', ar: 'على مقياس من 1 إلى 10، ما شدة الألم أو الانزعاج؟', en: 'On a scale of 1 to 10, how severe is your pain or discomfort?' },
        { key: 'frequency', ar: 'هل الأعراض مستمرة طوال اليوم أم تأتي وتذهب؟', en: 'Are the symptoms constant throughout the day or do they come and go?' },
        { key: 'triggers', ar: 'هل لاحظت أي شيء يزيد الأعراض سوءاً؟ (طعام معين، حركة، وقت معين)', en: 'Have you noticed anything that makes symptoms worse? (certain food, movement, time of day)' },
        { key: 'relievers', ar: 'هل هناك شيء يخفف الأعراض؟ (راحة، دواء، وضعية معينة)', en: 'Is there anything that relieves the symptoms? (rest, medication, certain position)' },
        { key: 'chronicDiseases', ar: 'هل تعاني من أي أمراض مزمنة؟ (سكر، ضغط، قلب، غدة درقية، إلخ)', en: 'Do you have any chronic diseases? (diabetes, hypertension, heart disease, thyroid, etc.)' },
        { key: 'currentMedications', ar: 'هل تتناول أي أدوية حالياً؟ إذا نعم، اذكرها.', en: 'Are you currently taking any medications? If yes, please list them.' },
        { key: 'allergies', ar: 'هل لديك حساسية من أي أدوية أو أطعمة؟', en: 'Do you have any allergies to medications or foods?' },
        { key: 'familyHistory', ar: 'هل يوجد في عائلتك تاريخ مرضي لأمراض معينة؟ (سكر، ضغط، سرطان، قلب)', en: 'Is there a family history of certain diseases? (diabetes, hypertension, cancer, heart disease)' },
        { key: 'smoking', ar: 'هل تدخن أو تتعرض للتدخين السلبي؟', en: 'Do you smoke or are you exposed to secondhand smoke?' },
        { key: 'alcohol', ar: 'هل تتناول الكحول؟ إذا نعم، كم مرة في الأسبوع؟', en: 'Do you consume alcohol? If yes, how often per week?' },
        { key: 'exercise', ar: 'هل تمارس الرياضة بانتظام؟ وما نوعها؟', en: 'Do you exercise regularly? What type?' },
        { key: 'sleep', ar: 'كيف هي جودة نومك؟ وكم ساعة تنام يومياً؟', en: 'How is your sleep quality? How many hours do you sleep daily?' },
        { key: 'stress', ar: 'هل تشعر بالتوتر أو القلق مؤخراً؟ ما مستواه من 1-10؟', en: 'Have you been feeling stressed or anxious lately? Rate it 1-10.' },
        { key: 'appetite', ar: 'كيف هي شهيتك للطعام مؤخراً؟ (طبيعية، زائدة، قليلة)', en: 'How is your appetite lately? (normal, increased, decreased)' },
        { key: 'weight', ar: 'هل لاحظت أي تغير في وزنك مؤخراً؟ (زيادة أو نقصان)', en: 'Have you noticed any recent weight changes? (gain or loss)' },
        { key: 'travel', ar: 'هل سافرت مؤخراً خارج المدينة أو البلد؟', en: 'Have you traveled recently outside your city or country?' },
        { key: 'exposure', ar: 'هل تعرضت لشخص مريض مؤخراً؟', en: 'Have you been exposed to anyone sick recently?' }
    ],
    stomach: [
        { key: 'painLocation', ar: 'أين بالضبط موقع الألم في البطن؟ (أعلى، أسفل، يمين، يسار، حول السرة)', en: 'Where exactly is the pain in your abdomen? (upper, lower, right, left, around navel)' },
        { key: 'painTiming', ar: 'هل الألم يزداد قبل الأكل أم بعده؟ أم لا علاقة له بالأكل؟', en: 'Does the pain increase before or after eating? Or is it unrelated to food?' },
        { key: 'nausea', ar: 'هل تشعر بالغثيان أو القيء؟', en: 'Do you feel nauseous or have vomiting?' },
        { key: 'bowel', ar: 'كيف هي حركة الأمعاء؟ (إمساك، إسهال، طبيعية)', en: 'How are your bowel movements? (constipation, diarrhea, normal)' },
        { key: 'stoolColor', ar: 'هل لاحظت أي تغير في لون البراز؟ (أسود، دموي، طبيعي)', en: 'Have you noticed any change in stool color? (black, bloody, normal)' },
        { key: 'bloating', ar: 'هل تعاني من انتفاخ أو غازات؟', en: 'Do you suffer from bloating or gas?' },
        { key: 'heartburn', ar: 'هل تشعر بحرقة في المعدة أو ارتجاع؟', en: 'Do you feel heartburn or acid reflux?' },
        { key: 'recentFood', ar: 'هل أكلت شيئاً غير معتاد مؤخراً؟ أو طعام من الخارج؟', en: 'Did you eat anything unusual recently? Or food from outside?' }
    ],
    head: [
        { key: 'headacheLocation', ar: 'أين بالضبط موقع الصداع؟ (جانب واحد، الجبهة، خلف الرأس، كل الرأس)', en: 'Where exactly is the headache? (one side, forehead, back of head, whole head)' },
        { key: 'headacheType', ar: 'ما نوع الألم؟ (نابض، ضاغط، طاعن، حارق)', en: 'What type of pain? (throbbing, pressing, stabbing, burning)' },
        { key: 'lightSensitivity', ar: 'هل يزداد الألم مع الضوء القوي؟', en: 'Does the pain worsen with bright light?' },
        { key: 'soundSensitivity', ar: 'هل يزداد الألم مع الأصوات العالية؟', en: 'Does the pain worsen with loud sounds?' },
        { key: 'aura', ar: 'هل ترى ومضات ضوئية أو خطوط متعرجة قبل الصداع؟', en: 'Do you see light flashes or zigzag lines before the headache?' },
        { key: 'neckPain', ar: 'هل تعاني من ألم أو تيبس في الرقبة؟', en: 'Do you have neck pain or stiffness?' },
        { key: 'visionChanges', ar: 'هل لاحظت أي تغير في الرؤية؟', en: 'Have you noticed any vision changes?' },
        { key: 'screenTime', ar: 'كم ساعة تقضي أمام الشاشات يومياً؟', en: 'How many hours do you spend in front of screens daily?' }
    ],
    fever: [
        { key: 'temperature', ar: 'كم درجة حرارتك بالضبط؟', en: 'What is your exact temperature?' },
        { key: 'chills', ar: 'هل تشعر برعشة أو قشعريرة؟', en: 'Do you feel chills or shivering?' },
        { key: 'bodyAches', ar: 'هل تشعر بتكسير أو آلام في الجسم؟', en: 'Do you feel body aches or fatigue?' },
        { key: 'cough', ar: 'هل لديك كحة؟ جافة أم مع بلغم؟', en: 'Do you have a cough? Dry or with phlegm?' },
        { key: 'soreThroat', ar: 'هل تعاني من التهاب أو ألم في الحلق؟', en: 'Do you have a sore throat?' },
        { key: 'runnyNose', ar: 'هل لديك رشح أو انسداد في الأنف؟', en: 'Do you have a runny or stuffy nose?' },
        { key: 'breathing', ar: 'هل تعاني من صعوبة في التنفس؟', en: 'Do you have difficulty breathing?' },
        { key: 'rash', ar: 'هل ظهر أي طفح جلدي على جسمك؟', en: 'Has any skin rash appeared on your body?' }
    ]
};

function resetAIChat() {
    aiChatState = {
        step: 0,
        questionIndex: 0,
        data: {
            age: null, gender: null, symptoms: '', duration: null, painLevel: null,
            painLocation: null, painType: null, frequency: null, triggers: null,
            relievers: null, associatedSymptoms: [], chronicDiseases: [], currentMedications: [],
            allergies: [], familyHistory: [], lifestyle: {}, recentTravel: null,
            recentExposure: null, weight: null, height: null, sleepQuality: null,
            stressLevel: null, appetite: null, answers: []
        },
        context: null,
        questionsAsked: 0,
        maxQuestions: 15
    };
    const chatBox = document.getElementById('aiChatBox');
    chatBox.innerHTML = `
                <div class="flex items-start fade-in">
                    <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ml-3 border border-green-200 shadow-sm flex-shrink-0">
                        <i class="fas fa-user-doctor text-green-600 text-lg"></i>
                    </div>
                    <div class="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-gray-200 max-w-[85%]">
                        <p class="text-gray-800 leading-relaxed font-medium">${currentLang === 'ar' ? 'أهلاً بك. أنا طبيبك الافتراضي الذكي.' : 'Welcome. I am your intelligent virtual doctor.'}</p>
                        <p class="text-gray-700 mt-2 leading-relaxed">${currentLang === 'ar' ? 'سأقوم بطرح عدة أسئلة تفصيلية عليك (10-15 سؤال) للوصول لتشخيص دقيق 100% مع طلب التحاليل اللازمة والعلاج المناسب.' : 'I will ask you several detailed questions (10-15 questions) to reach a 100% accurate diagnosis with required tests and appropriate treatment.'}</p>
                        <p class="text-gray-800 mt-3 font-bold border-t pt-2">${currentLang === 'ar' ? 'السؤال الأول: كم عمرك؟' : 'First question: How old are you?'}</p>
                    </div>
                </div>
            `;
    document.getElementById('aiChatInput').value = '';
    document.getElementById('aiChatInput').focus();
}

function addMessage(text, isUser = false) {
    const chatBox = document.getElementById('aiChatBox');
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start fade-in ${isUser ? 'justify-end' : ''}`;

    if (isUser) {
        msgDiv.innerHTML = `
                    <div class="bg-blue-600 text-white p-4 rounded-2xl rounded-tl-none shadow-md max-w-[85%]">
                        <p>${text}</p>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 border border-blue-200 shadow-sm flex-shrink-0">
                        <i class="fas fa-user text-blue-600"></i>
                    </div>
                `;
    } else {
        msgDiv.innerHTML = `
                    <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center ml-3 border border-green-200 shadow-sm flex-shrink-0">
                        <i class="fas fa-user-doctor text-green-600 text-lg"></i>
                    </div>
                    <div class="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm border border-gray-200 max-w-[85%]">
                        <div class="text-gray-800 leading-relaxed">${text}</div>
                    </div>
                `;
    }
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function handleAIChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('aiChatInput');
    const val = input.value.trim();
    if (!val) return;

    addMessage(val, true);
    input.value = '';

    const chatBox = document.getElementById('aiChatBox');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiTyping';
    typingDiv.className = 'flex items-start fade-in mt-2';
    typingDiv.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-3 flex-shrink-0">
                    <i class="fas fa-ellipsis h-4 w-4 text-gray-400 animate-pulse"></i>
                </div>
                <div class="text-xs text-gray-400 mt-2">${currentLang === 'ar' ? 'يحلل إجابتك...' : 'Analyzing your answer...'}</div>
            `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        document.getElementById('aiTyping')?.remove();
        processAIResponse(val);
    }, 800 + Math.random() * 700);
}

function getContextQuestions() {
    const context = aiChatState.context || 'general';
    const contextQs = aiQuestions[context] || [];
    const generalQs = aiQuestions.general;

    // Combine context-specific + general questions
    let combined = [...contextQs, ...generalQs];
    // Remove duplicates by key
    const seen = new Set();
    combined = combined.filter(q => {
        if (seen.has(q.key)) return false;
        seen.add(q.key);
        return true;
    });
    return combined;
}

function processAIResponse(answer) {
    const { step } = aiChatState;
    aiChatState.data.answers.push(answer);

    // Step 0: Age
    if (step === 0) {
        const age = parseInt(answer);
        if (isNaN(age) || age < 0 || age > 120) {
            addMessage(currentLang === 'ar' ? 'يرجى كتابة رقم صحيح للعمر (مثال: 25).' : 'Please enter a valid age number (e.g., 25).');
            aiChatState.data.answers.pop();
            return;
        }
        aiChatState.data.age = age;
        aiChatState.step = 1;
        aiChatState.questionsAsked = 1;

        const ageNote = age < 18
            ? (currentLang === 'ar' ? ' (أنت في فئة الأطفال/المراهقين، سآخذ ذلك في الاعتبار)' : ' (You are in the child/teen category, I will take that into account)')
            : age > 60
                ? (currentLang === 'ar' ? ' (أنت في فئة كبار السن، سأهتم بالفحوصات الإضافية)' : ' (You are a senior, I will pay attention to additional tests)')
                : '';

        addMessage((currentLang === 'ar' ? `تمام، عمرك ${age} سنة${ageNote}. الآن اشرح لي بالتفصيل: بماذا تشعر؟ ما هي أعراضك الرئيسية؟` : `Okay, you are ${age} years old${ageNote}. Now describe in detail: How do you feel? What are your main symptoms?`));
        return;
    }

    // Step 1: Initial Symptoms
    if (step === 1) {
        aiChatState.data.symptoms = answer;
        aiChatState.step = 2;
        aiChatState.questionsAsked = 2;

        // Determine context
        const lower = answer.toLowerCase();
        if (lower.includes('بطن') || lower.includes('معد') || lower.includes('stomach') || lower.includes('abdom') || lower.includes('مغص') || lower.includes('قولون') || lower.includes('إسهال') || lower.includes('إمساك')) {
            aiChatState.context = 'stomach';
        } else if (lower.includes('صداع') || lower.includes('رأس') || lower.includes('headache') || lower.includes('head') || lower.includes('migrain')) {
            aiChatState.context = 'head';
        } else if (lower.includes('حرارة') || lower.includes('سخون') || lower.includes('fever') || lower.includes('حم') || lower.includes('برد') || lower.includes('انفلونزا')) {
            aiChatState.context = 'fever';
        } else {
            aiChatState.context = 'general';
        }

        // Set max questions based on complexity
        aiChatState.maxQuestions = 12 + Math.floor(Math.random() * 4); // 12-15 questions

        addMessage(currentLang === 'ar'
            ? `فهمت. سأطرح عليك الآن أسئلة تفصيلية لفهم حالتك بشكل أفضل. (سؤال ${aiChatState.questionsAsked + 1} من ~${aiChatState.maxQuestions})`
            : `I understand. I will now ask you detailed questions to better understand your condition. (Question ${aiChatState.questionsAsked + 1} of ~${aiChatState.maxQuestions})`);

        setTimeout(() => askNextQuestion(), 500);
        return;
    }

    // Step 2+: Dynamic Questions
    if (step >= 2 && aiChatState.questionsAsked < aiChatState.maxQuestions) {
        aiChatState.questionsAsked++;

        // Store the answer with context
        const questions = getContextQuestions();
        const prevQ = questions[aiChatState.questionIndex - 1];
        if (prevQ) {
            aiChatState.data[prevQ.key] = answer;
        }

        askNextQuestion();
        return;
    }

    // Final Step: Generate Diagnosis
    if (aiChatState.questionsAsked >= aiChatState.maxQuestions || step >= 20) {
        generateFinalDiagnosis();
        return;
    }

    // Open conversation after diagnosis
    if (step >= 100) {
        handleOpenConversation(answer);
        return;
    }
}

function askNextQuestion() {
    const questions = getContextQuestions();

    if (aiChatState.questionIndex >= questions.length || aiChatState.questionsAsked >= aiChatState.maxQuestions) {
        generateFinalDiagnosis();
        return;
    }

    const q = questions[aiChatState.questionIndex];
    aiChatState.questionIndex++;
    aiChatState.step++;

    const questionNum = aiChatState.questionsAsked + 1;
    const questionText = currentLang === 'ar' ? q.ar : q.en;

    addMessage(`<strong>${currentLang === 'ar' ? `السؤال ${questionNum}:` : `Question ${questionNum}:`}</strong> ${questionText}`);
}

function handleOpenConversation(question) {
    const lower = question.toLowerCase();
    let response = '';

    if (lower.includes('خطير') || lower.includes('dangerous') || lower.includes('serious')) {
        response = currentLang === 'ar'
            ? `بناءً على عمرك (${aiChatState.data.age} سنة) والأعراض التي وصفتها، الحالة ليست خطيرة في الغالب. لكن إذا استمرت الأعراض أكثر من أسبوع أو زادت حدتها أو ظهرت أعراض جديدة (حرارة عالية، صعوبة تنفس، ألم شديد)، يجب زيارة الطبيب فوراً.`
            : `Based on your age (${aiChatState.data.age} years) and the symptoms you described, the condition is usually not serious. However, if symptoms persist for more than a week, worsen, or new symptoms appear (high fever, difficulty breathing, severe pain), you should see a doctor immediately.`;
    } else if (lower.includes('اكل') || lower.includes('طعام') || lower.includes('eat') || lower.includes('food') || lower.includes('diet')) {
        response = currentLang === 'ar'
            ? 'أنصحك بتناول وجبات خفيفة ومتكررة (5-6 وجبات صغيرة). تجنب الأطعمة الدهنية والحارة والمقلية. أكثر من الخضروات والفواكه والبروتين الخفيف. اشرب 2-3 لتر ماء يومياً. تجنب الكافيين والمشروبات الغازية. لا تأكل قبل النوم بـ 3 ساعات.'
            : 'I recommend eating light, frequent meals (5-6 small meals). Avoid fatty, spicy, and fried foods. Increase vegetables, fruits, and lean protein. Drink 2-3 liters of water daily. Avoid caffeine and carbonated drinks. Don\'t eat 3 hours before bed.';
    } else if (lower.includes('دواء') || lower.includes('علاج') || lower.includes('medicine') || lower.includes('treatment') || lower.includes('medication')) {
        response = currentLang === 'ar'
            ? 'الأدوية التي ذكرتها في التقرير هي الأنسب لحالتك بناءً على عمرك وأعراضك. تناولها حسب الجرعات المحددة بالضبط. إذا لم تتحسن خلال 3-5 أيام، راجع الطبيب. لا تزد الجرعة أو توقف الدواء من تلقاء نفسك. إذا ظهرت أي آثار جانبية غريبة، توقف واستشر طبيب.'
            : 'The medications I mentioned in the report are most suitable for your condition based on your age and symptoms. Take them exactly as prescribed. If you don\'t improve within 3-5 days, see a doctor. Don\'t increase the dose or stop medication on your own. If any unusual side effects appear, stop and consult a doctor.';
    } else if (lower.includes('تحليل') || lower.includes('فحص') || lower.includes('test') || lower.includes('lab')) {
        response = currentLang === 'ar'
            ? 'التحاليل المطلوبة مهمة جداً للتأكد من التشخيص بنسبة 100%. يمكنك إجراؤها في أي معمل تحاليل معتمد. أحضر النتائج معك عند زيارة الطبيب. بعض التحاليل تحتاج صيام 8-12 ساعة، اسأل المعمل. النتائج عادة تظهر خلال 24-48 ساعة.'
            : 'The required tests are very important to confirm the diagnosis 100%. You can do them at any certified lab. Bring the results when visiting the doctor. Some tests require 8-12 hours fasting, ask the lab. Results usually appear within 24-48 hours.';
    } else if (lower.includes('شكر') || lower.includes('thank')) {
        response = currentLang === 'ar'
            ? 'العفو! أتمنى لك الشفاء العاجل إن شاء الله. 🌟 لا تتردد في العودة إذا كان لديك أي استفسار آخر. صحتك تهمنا!'
            : 'You\'re welcome! I wish you a speedy recovery! 🌟 Don\'t hesitate to come back if you have any other questions. Your health matters to us!';
    } else if (lower.includes('متى') || lower.includes('when') || lower.includes('كم يوم') || lower.includes('how long')) {
        response = currentLang === 'ar'
            ? 'عادةً تتحسن الأعراض خلال 3-7 أيام مع العلاج المناسب والراحة الكافية. إذا لم يحدث تحسن ملحوظ بعد أسبوع أو زادت الأعراض سوءاً، يجب مراجعة الطبيب فوراً لإجراء فحوصات إضافية.'
            : 'Symptoms usually improve within 3-7 days with proper treatment and adequate rest. If there\'s no noticeable improvement after a week or symptoms worsen, you should see a doctor immediately for additional tests.';
    } else if (lower.includes('راحة') || lower.includes('rest') || lower.includes('نوم') || lower.includes('sleep')) {
        response = currentLang === 'ar'
            ? 'الراحة مهمة جداً للشفاء. حاول النوم 7-8 ساعات يومياً في غرفة مظلمة وهادئة. تجنب الشاشات قبل النوم بساعة. تجنب الإجهاد البدني والنفسي. الاسترخاء والتنفس العميق يساعد جهازك المناعي على مقاومة المرض.'
            : 'Rest is very important for recovery. Try to sleep 7-8 hours daily in a dark, quiet room. Avoid screens an hour before bed. Avoid physical and mental stress. Relaxation and deep breathing help your immune system fight the illness.';
    } else {
        response = currentLang === 'ar'
            ? 'سؤال جيد! بناءً على حالتك وعمرك والأعراض التي ذكرتها، أنصحك بالالتزام بالعلاج المقترح ومتابعة الأعراض يومياً. إذا كان لديك سؤال محدد عن الأدوية أو التحاليل أو النظام الغذائي أو متى تزور الطبيب، اسألني مباشرة.'
            : 'Good question! Based on your condition, age, and symptoms you mentioned, I advise you to follow the suggested treatment and monitor symptoms daily. If you have a specific question about medications, tests, diet, or when to see a doctor, ask me directly.';
    }

    addMessage(response);
}

function generateFinalDiagnosis() {
    const { age, symptoms, chronicDiseases, currentMedications, allergies } = aiChatState.data;
    const context = aiChatState.context;

    let diagnosisTitle = '';
    let diagnosisDesc = '';
    let labs = [];
    let meds = [];
    let warnings = [];
    let lifestyle = [];
    let confidence = 95;

    // Age-based adjustments
    const isChild = age < 18;
    const isSenior = age > 60;
    const isAdult = !isChild && !isSenior;

    // Context-based diagnosis
    if (context === 'stomach') {
        diagnosisTitle = currentLang === 'ar' ? 'التهاب المعدة / القولون العصبي (IBS)' : 'Gastritis / Irritable Bowel Syndrome (IBS)';
        diagnosisDesc = currentLang === 'ar'
            ? `بناءً على عمرك (${age} سنة) والأعراض وإجاباتك على ${aiChatState.questionsAsked} سؤال، الاحتمال الأكبر هو تهيج في جدار المعدة أو القولون العصبي. العمر والنظام الغذائي والتوتر عوامل مؤثرة.`
            : `Based on your age (${age} years), symptoms, and answers to ${aiChatState.questionsAsked} questions, most likely gastric wall irritation or IBS. Age, diet, and stress are contributing factors.`;

        labs = [
            currentLang === 'ar' ? 'تحليل براز كامل (Stool Analysis) - للكشف عن العدوى أو الطفيليات' : 'Complete Stool Analysis - to detect infection or parasites',
            currentLang === 'ar' ? 'جرثومة المعدة (H. Pylori Ag) - مهم جداً' : 'H. Pylori Antigen test - very important',
            currentLang === 'ar' ? 'وظائف الكبد (Liver Function) - للاطمئنان' : 'Liver Function Tests - for reassurance'
        ];

        if (isSenior) {
            labs.push(currentLang === 'ar' ? 'منظار معدة (Endoscopy) - موصى به لكبار السن' : 'Endoscopy - recommended for seniors');
        }

        meds = [
            currentLang === 'ar' ? 'أوميبرازول 40mg - حبة قبل الفطار بنصف ساعة' : 'Omeprazole 40mg - one tablet 30 min before breakfast',
            currentLang === 'ar' ? 'موتيليوم 10mg - حبة قبل كل وجبة' : 'Motilium 10mg - one tablet before each meal',
            currentLang === 'ar' ? 'كولوفيرين د - حبة 3 مرات يومياً (للقولون)' : 'Coloverin D - one tablet 3 times daily (for IBS)'
        ];

        if (isChild) {
            meds = [
                currentLang === 'ar' ? 'شراب مضاد للحموضة - ملعقة بعد الأكل (استشر الصيدلي للجرعة المناسبة للعمر)' : 'Antacid syrup - one spoon after meals (consult pharmacist for age-appropriate dose)'
            ];
        }

        lifestyle = [
            currentLang === 'ar' ? 'تجنب الأطعمة الحارة والدهنية والمقلية' : 'Avoid spicy, fatty, and fried foods',
            currentLang === 'ar' ? 'قسّم وجباتك إلى 5-6 وجبات صغيرة' : 'Divide meals into 5-6 small portions',
            currentLang === 'ar' ? 'لا تأكل قبل النوم بـ 3 ساعات' : 'Don\'t eat 3 hours before bed',
            currentLang === 'ar' ? 'قلل التوتر ومارس تمارين الاسترخاء' : 'Reduce stress and practice relaxation exercises'
        ];

    } else if (context === 'head') {
        diagnosisTitle = currentLang === 'ar' ? 'الصداع النصفي (الشقيقة) / صداع التوتر' : 'Migraine / Tension Headache';
        diagnosisDesc = currentLang === 'ar'
            ? `بناءً على عمرك (${age} سنة) ونوع الألم وموقعه والمحفزات، الاحتمال الأكبر هو الصداع النصفي أو صداع التوتر. ${isSenior ? 'يُنصح بفحص الضغط والنظر.' : ''}`
            : `Based on your age (${age} years), pain type, location, and triggers, most likely migraine or tension headache. ${isSenior ? 'Blood pressure and vision check recommended.' : ''}`;

        labs = [
            currentLang === 'ar' ? 'قياس ضغط الدم - مهم جداً' : 'Blood Pressure Check - very important',
            currentLang === 'ar' ? 'فحص نظر شامل' : 'Comprehensive Eye Exam',
            currentLang === 'ar' ? 'صورة دم كاملة (CBC)' : 'Complete Blood Count (CBC)'
        ];

        if (isSenior) {
            labs.push(currentLang === 'ar' ? 'أشعة مقطعية على المخ (CT) - للاطمئنان' : 'Brain CT Scan - for reassurance');
        }

        meds = [
            currentLang === 'ar' ? 'بانادول مايجرين - عند الحاجة (لا يزيد عن 2 يومياً)' : 'Panadol Migraine - as needed (max 2 daily)',
            currentLang === 'ar' ? 'إيبوبروفين 400mg - حبة عند الألم مع الأكل' : 'Ibuprofen 400mg - one tablet with food when in pain'
        ];

        if (isChild) {
            meds = [
                currentLang === 'ar' ? 'بانادول شراب - حسب الوزن (استشر الصيدلي)' : 'Panadol syrup - according to weight (consult pharmacist)'
            ];
        }

        lifestyle = [
            currentLang === 'ar' ? 'قلل وقت الشاشات قدر الإمكان' : 'Reduce screen time as much as possible',
            currentLang === 'ar' ? 'نم 7-8 ساعات في غرفة مظلمة' : 'Sleep 7-8 hours in a dark room',
            currentLang === 'ar' ? 'اشرب 2-3 لتر ماء يومياً' : 'Drink 2-3 liters of water daily',
            currentLang === 'ar' ? 'تجنب التوتر وخذ فترات راحة منتظمة' : 'Avoid stress and take regular breaks'
        ];

    } else if (context === 'fever') {
        diagnosisTitle = currentLang === 'ar' ? 'عدوى فيروسية / نزلة برد أو إنفلونزا' : 'Viral Infection / Cold or Flu';
        diagnosisDesc = currentLang === 'ar'
            ? `بناءً على عمرك (${age} سنة) والأعراض المصاحبة للحرارة، الاحتمال الأكبر هو عدوى فيروسية (برد أو إنفلونزا). ${isChild || isSenior ? 'يجب المتابعة بدقة نظراً للفئة العمرية.' : ''}`
            : `Based on your age (${age} years) and symptoms accompanying the fever, most likely viral infection (cold or flu). ${isChild || isSenior ? 'Close monitoring needed due to age group.' : ''}`;

        labs = [
            currentLang === 'ar' ? 'صورة دم كاملة (CBC) - لمعرفة نوع العدوى' : 'Complete Blood Count (CBC) - to identify infection type',
            currentLang === 'ar' ? 'CRP (بروتين الالتهاب) - لقياس شدة الالتهاب' : 'CRP (C-Reactive Protein) - to measure inflammation severity'
        ];

        meds = [
            currentLang === 'ar' ? 'باراسيتامول 500mg - حبة كل 6 ساعات عند الحرارة' : 'Paracetamol 500mg - one tablet every 6 hours for fever',
            currentLang === 'ar' ? 'فيتامين C 1000mg - حبة يومياً' : 'Vitamin C 1000mg - one tablet daily',
            currentLang === 'ar' ? 'زنك 50mg - حبة يومياً لمدة أسبوع' : 'Zinc 50mg - one tablet daily for a week'
        ];

        if (isChild) {
            meds = [
                currentLang === 'ar' ? 'باراسيتامول شراب - حسب الوزن كل 6 ساعات' : 'Paracetamol syrup - according to weight every 6 hours',
                currentLang === 'ar' ? 'فيتامين C شراب - ملعقة يومياً' : 'Vitamin C syrup - one spoon daily'
            ];
        }

        warnings = [
            currentLang === 'ar' ? '⚠️ إذا وصلت الحرارة 39.5 أو أكثر، اذهب للطوارئ فوراً' : '⚠️ If temperature reaches 39.5°C or higher, go to ER immediately',
            currentLang === 'ar' ? '⚠️ إذا استمرت الحرارة أكثر من 3 أيام، راجع الطبيب' : '⚠️ If fever persists more than 3 days, see a doctor'
        ];

        lifestyle = [
            currentLang === 'ar' ? 'راحة تامة في السرير' : 'Complete bed rest',
            currentLang === 'ar' ? 'اشرب سوائل دافئة بكثرة (شوربة، ليمون، زنجبيل)' : 'Drink plenty of warm fluids (soup, lemon, ginger)',
            currentLang === 'ar' ? 'كمادات ماء فاتر على الجبهة' : 'Lukewarm water compresses on forehead',
            currentLang === 'ar' ? 'تهوية الغرفة جيداً' : 'Ventilate the room well'
        ];

    } else {
        diagnosisTitle = currentLang === 'ar' ? 'إجهاد عام / توتر وقلق' : 'General Fatigue / Stress and Anxiety';
        diagnosisDesc = currentLang === 'ar'
            ? `بناءً على عمرك (${age} سنة) والأعراض العامة التي وصفتها، الاحتمال الأكبر هو إجهاد بدني أو نفسي. قد يكون مرتبطاً بنمط الحياة.`
            : `Based on your age (${age} years) and general symptoms you described, most likely physical or mental fatigue. May be related to lifestyle.`;

        labs = [
            currentLang === 'ar' ? 'صورة دم كاملة (CBC)' : 'Complete Blood Count (CBC)',
            currentLang === 'ar' ? 'وظائف الغدة الدرقية (TSH, T3, T4)' : 'Thyroid Function (TSH, T3, T4)',
            currentLang === 'ar' ? 'فيتامين D و B12' : 'Vitamin D and B12'
        ];

        meds = [
            currentLang === 'ar' ? 'فيتامين B Complex - حبة يومياً بعد الفطار' : 'Vitamin B Complex - one tablet daily after breakfast',
            currentLang === 'ar' ? 'مغنيسيوم 400mg - حبة قبل النوم' : 'Magnesium 400mg - one tablet before bed',
            currentLang === 'ar' ? 'أوميجا 3 - حبة يومياً' : 'Omega 3 - one capsule daily'
        ];

        lifestyle = [
            currentLang === 'ar' ? 'نم 7-8 ساعات يومياً بانتظام' : 'Sleep 7-8 hours daily regularly',
            currentLang === 'ar' ? 'مارس رياضة خفيفة 30 دقيقة يومياً (مشي)' : 'Exercise lightly 30 minutes daily (walking)',
            currentLang === 'ar' ? 'قلل الكافيين والسكريات' : 'Reduce caffeine and sugars',
            currentLang === 'ar' ? 'مارس تمارين التنفس والاسترخاء' : 'Practice breathing and relaxation exercises'
        ];
    }

    // Build HTML Report
    const html = `
                <div class="mt-4 border-t-2 border-green-100 pt-4">
                    <div class="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-xl border border-green-200 mb-4">
                        <h3 class="font-bold text-green-800 text-xl flex items-center mb-3">
                            <i class="fas fa-clipboard-check ml-2 text-2xl"></i> ${currentLang === 'ar' ? 'تقرير التشخيص النهائي' : 'Final Diagnosis Report'}
                        </h3>
                        <div class="space-y-2 text-gray-800">
                            <p><strong>${currentLang === 'ar' ? 'العمر:' : 'Age:'}</strong> ${age} ${currentLang === 'ar' ? 'سنة' : 'years'}</p>
                            <p><strong>${currentLang === 'ar' ? 'التشخيص المرجح:' : 'Likely Diagnosis:'}</strong> ${diagnosisTitle}</p>
                            <p><strong>${currentLang === 'ar' ? 'التفسير:' : 'Explanation:'}</strong> ${diagnosisDesc}</p>
                            <p><strong>${currentLang === 'ar' ? 'نسبة التأكد:' : 'Confidence:'}</strong> <span class="bg-green-200 px-2 py-1 rounded font-bold">${confidence}%</span></p>
                            <p class="text-sm text-gray-600">${currentLang === 'ar' ? `(بناءً على ${aiChatState.questionsAsked} سؤال تم تحليلها)` : `(Based on ${aiChatState.questionsAsked} questions analyzed)`}</p>
                        </div>
                    </div>

                    <div class="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                        <h4 class="font-bold text-blue-800 mb-3 flex items-center text-lg"><i class="fas fa-flask ml-2"></i> ${currentLang === 'ar' ? 'التحاليل المطلوبة للتأكد 100%:' : 'Required Tests for 100% Confirmation:'}</h4>
                        <ul class="space-y-2 text-gray-700">
                            ${labs.map(l => `<li class="flex items-start"><i class="fas fa-check-circle text-blue-500 mt-1 ml-2"></i>${l}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="bg-purple-50 p-4 rounded-xl border border-purple-200 mb-4">
                        <h4 class="font-bold text-purple-800 mb-3 flex items-center text-lg"><i class="fas fa-pills ml-2"></i> ${currentLang === 'ar' ? 'الخطة العلاجية المقترحة:' : 'Suggested Treatment Plan:'}</h4>
                        <ul class="space-y-2 text-gray-700">
                            ${meds.map(m => `<li class="flex items-start"><i class="fas fa-prescription ml-2 text-purple-500 mt-1"></i>${m}</li>`).join('')}
                        </ul>
                        <div class="mt-3 text-xs text-purple-700 bg-purple-100 p-2 rounded">
                            <i class="fas fa-info-circle ml-1"></i> ${currentLang === 'ar' ? 'ملحوظة: الجرعات استرشادية وتختلف حسب الوزن والتاريخ المرضي. يرجى مراجعة الصيدلي أو الطبيب.' : 'Note: Doses are indicative and vary by weight and history. Please consult pharmacist or doctor.'}
                        </div>
                    </div>

                    ${warnings.length > 0 ? `
                    <div class="bg-red-50 p-4 rounded-xl border border-red-200 mb-4">
                        <h4 class="font-bold text-red-800 mb-2 flex items-center"><i class="fas fa-exclamation-triangle ml-2"></i> ${currentLang === 'ar' ? 'تحذيرات مهمة:' : 'Important Warnings:'}</h4>
                        <ul class="space-y-1 text-red-700">
                            ${warnings.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4">
                        <h4 class="font-bold text-yellow-800 mb-3 flex items-center text-lg"><i class="fas fa-heart ml-2"></i> ${currentLang === 'ar' ? 'نصائح لنمط الحياة:' : 'Lifestyle Recommendations:'}</h4>
                        <ul class="space-y-2 text-gray-700">
                            ${lifestyle.map(l => `<li class="flex items-start"><i class="fas fa-leaf text-yellow-600 mt-1 ml-2"></i>${l}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="text-center mt-6 space-y-3">
                        <p class="text-gray-600 text-sm">${currentLang === 'ar' ? 'هل لديك أي استفسار آخر؟ اسألني عن الأدوية، التحاليل، الأكل، أو أي شيء!' : 'Any other questions? Ask me about medications, tests, food, or anything!'}</p>
                        <button onclick="showPage('bookingPage')" class="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:opacity-90 transition shadow-lg text-lg font-bold">
                            <i class="fas fa-calendar-check ml-2"></i> ${currentLang === 'ar' ? 'حجز موعد للمتابعة مع الطبيب' : 'Book Follow-up Appointment with Doctor'}
                        </button>
                    </div>
                </div>
            `;

    addMessage(html, false);
    aiChatState.step = 100; // Open conversation mode
}

// Pain Slider Update
function updatePainSlider() {
    const slider = document.getElementById('painLevel');
    const display = document.getElementById('painValue');
    if (slider && display) {
        slider.addEventListener('input', function () {
            display.textContent = this.value;
        });
    }
}

// Render Courses
function renderCourses(filter) {
    currentCourseFilter = filter;

    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    const filtered = filter === 'all' ? courses : courses.filter(c => c.department === filter);

    if (filtered.length === 0) {
        grid.innerHTML = `
                    <div class="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-lg p-8 text-center">
                        <p class="text-gray-600">${currentLang === 'ar' ? 'لا توجد كورسات في هذا القسم حالياً' : 'No courses in this department yet'}</p>
                    </div>
                `;
    } else {
        grid.innerHTML = filtered.map(course => `
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover cursor-pointer" onclick="openCourseModal(${course.id})">
                        <div class="h-40 gradient-bg flex items-center justify-center text-6xl">
                            ${course.image}
                        </div>
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm">
                                    ${departmentLabel(course.department)}
                                </span>
                                <div class="flex items-center">
                                    <i class="fas fa-star text-yellow-400"></i>
                                    <span class="text-sm text-gray-600 mr-1">${course.rating}</span>
                                </div>
                            </div>
                            <h3 class="text-lg font-bold text-gray-800 mb-6">${course.title[currentLang]}</h3>
                            <div class="flex items-center justify-center mt-6">
                                <button class="w-full px-4 py-3 gradient-bg text-white rounded-lg hover:opacity-90 transition font-semibold" type="button">
                                    <i class="fas fa-user-plus ml-2"></i>
                                    <span data-ar="سجل الآن" data-en="Enroll Now">سجل الآن</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
    }

    // Update filter buttons
    document.querySelectorAll('.course-filter').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.remove('bg-gray-200', 'text-gray-700');
            btn.classList.add('bg-blue-500', 'text-white');
        } else {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        }
    });

    // Apply translations inside injected HTML
    document.querySelectorAll('#coursesGrid [data-ar][data-en]').forEach(el => {
        el.textContent = el.dataset[currentLang];
    });
}

// Filter Courses
function filterCourses(category) {
    renderCourses(category);
}

// Course Modal
function openCourseModal(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    selectedCourse = course;
    document.getElementById('modalCourseTitle').textContent = course.title[currentLang];
    document.getElementById('modalCourseContent').innerHTML = `
                <div class="text-center text-8xl mb-6">${course.image}</div>
                <h4 class="font-bold text-gray-800 text-center mb-4" data-ar="سجل في الكورس" data-en="Enroll in Course">سجل في الكورس</h4>
                <form id="courseEnrollForm" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 mb-2" data-ar="الاسم الكامل" data-en="Full Name">الاسم الكامل</label>
                        <input type="text" id="enrollName" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2" data-ar="رقم الهاتف" data-en="Phone Number">رقم الهاتف</label>
                        <input type="tel" id="enrollPhone" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" data-placeholder-ar="01xxxxxxxxx" data-placeholder-en="01xxxxxxxxx" placeholder="01xxxxxxxxx">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-2" data-ar="السن" data-en="Age">السن</label>
                        <input type="number" id="enrollAge" required min="0" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                </form>
            `;

    // Apply translations inside modal
    document.querySelectorAll('#courseModal [data-ar][data-en]').forEach(el => {
        if (el.tagName === 'INPUT') {
            if (el.dataset['placeholder' + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)]) {
                el.placeholder = el.dataset['placeholder' + currentLang.charAt(0).toUpperCase() + currentLang.slice(1)];
            }
        } else {
            el.textContent = el.dataset[currentLang];
        }
    });

    document.getElementById('courseModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('courseModal').classList.add('hidden');
}

function enrollCourse() {
    if (!selectedCourse) return;

    const form = document.getElementById('courseEnrollForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const enrollment = {
        courseName: selectedCourse.title[currentLang],
        courseId: selectedCourse.id,
        department: departmentLabel(selectedCourse.department),
        name: document.getElementById('enrollName').value.trim(),
        phone: document.getElementById('enrollPhone').value.trim(),
        age: document.getElementById('enrollAge').value
    };

    // Send enrollment email
    sendCourseEnrollmentEmail(enrollment);

    showToast(currentLang === 'ar' ? `تم التسجيل في كورس ${selectedCourse.title.ar}!` : `Enrolled in ${selectedCourse.title.en}!`);
    closeModal();
}

// Send Course Enrollment Email (mailto)
function sendCourseEnrollmentEmail(enrollment) {
    const to = 'adam.sherif.aboasy@gmail.com';
    const subject = currentLang === 'ar'
        ? `تسجيل جديد في كورس - ${enrollment.courseName}`
        : `New Course Enrollment - ${enrollment.courseName}`;

    const bodyLines = [
        currentLang === 'ar' ? 'تم استلام تسجيل جديد في كورس:' : 'New course enrollment received:',
        '',
        `${currentLang === 'ar' ? 'اسم الكورس' : 'Course Name'}: ${enrollment.courseName}`,
        `${currentLang === 'ar' ? 'القسم' : 'Department'}: ${enrollment.department}`,
        '',
        `${currentLang === 'ar' ? 'بيانات المتدرب' : 'Trainee Information'}:`,
        `${currentLang === 'ar' ? 'الاسم' : 'Name'}: ${enrollment.name}`,
        `${currentLang === 'ar' ? 'رقم الهاتف' : 'Phone'}: ${enrollment.phone}`,
        `${currentLang === 'ar' ? 'السن' : 'Age'}: ${enrollment.age}`,
        '',
        currentLang === 'ar' ? 'ملحوظة: تم إنشاء هذه الرسالة تلقائياً من النظام.' : 'Note: This email was generated by the system.'
    ];

    const body = bodyLines.join('\n');
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
        window.open(url, '_blank');
    } catch (e) {
        console.warn('Could not open mail client', e);
    }

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(body).catch(() => { });
    }
}

// Render Recent Bookings
function renderRecentBookings() {
    const tbody = document.getElementById('recentBookings');
    if (!tbody) return;

    const bookings = getBookings()
        .slice()
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 8);

    if (bookings.length === 0) {
        tbody.innerHTML = `
                    <tr class="border-b">
                        <td colspan="4" class="py-6 text-center text-gray-600">
                            ${currentLang === 'ar' ? 'لا توجد حجوزات حتى الآن' : 'No bookings yet'}
                        </td>
                    </tr>
                `;
        return;
    }

    tbody.innerHTML = bookings.map(b => {
        const statusLabel = b.status === 'confirmed'
            ? (currentLang === 'ar' ? 'مؤكد' : 'Confirmed')
            : (currentLang === 'ar' ? 'قيد الانتظار' : 'Pending');

        const statusClass = b.status === 'confirmed'
            ? 'bg-green-100 text-green-600'
            : 'bg-yellow-100 text-yellow-600';

        return `
                    <tr class="border-b">
                        <td class="py-3 text-gray-800">${b.name || '-'}</td>
                        <td class="py-3 text-gray-700">${departmentLabel(b.department)}</td>
                        <td class="py-3 text-gray-700">${b.date || '-'}</td>
                        <td class="py-3">
                            <span class="px-2 py-1 rounded-full text-sm ${statusClass}">${statusLabel}</span>
                        </td>
                    </tr>
                `;
    }).join('');
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3200);
}

// Ratings (store all ratings and show average)
const RATINGS_KEY = 'clinicRatings_v1';

function getRatings() {
    try {
        const raw = localStorage.getItem(RATINGS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map(n => Number(n))
            .filter(n => Number.isFinite(n) && n >= 1 && n <= 5);
    } catch {
        return [];
    }
}

function saveRatings(list) {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(list));
}

function getAverageRating() {
    const list = getRatings();
    if (list.length === 0) return null;
    const sum = list.reduce((a, b) => a + b, 0);
    return sum / list.length;
}

// Rating Prompt
function rateClinicPrompt() {
    const ratingRaw = prompt(currentLang === 'ar' ? 'من فضلك أدخل تقييمك من 1 إلى 5:' : 'Please enter your rating from 1 to 5:');
    if (ratingRaw === null) return;

    const rating = Number(String(ratingRaw).trim());
    if (Number.isFinite(rating) && rating >= 1 && rating <= 5) {
        const list = getRatings();
        list.push(rating);
        saveRatings(list);
        updateStats();

        const avg = getAverageRating();
        const msg = currentLang === 'ar'
            ? `شكراً لتقييمك! متوسط التقييم الآن: ${avg.toFixed(1)} (${list.length} مقيم)`
            : `Thanks! Current average: ${avg.toFixed(1)} (${list.length} ratings)`;
        showToast(msg);
    } else {
        showToast(currentLang === 'ar' ? 'يرجى إدخال رقم صحيح بين 1 و 5' : 'Please enter a valid number between 1 and 5');
    }
}

// Booking date minimum
function setMinBookingDate() {
    const dateInput = document.getElementById('appointmentDate');
    if (!dateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
}

// Updated updateStats to show average rating (all ratings)
const originalUpdateStats = updateStats;
updateStats = function () {
    const bookings = getBookings();
    const uniquePatients = new Set(bookings.map(b => (b.email || b.phone || '').toLowerCase()).filter(Boolean));

    const statPatients = document.getElementById('statPatients');
    const statAppointments = document.getElementById('statAppointments');
    const statCourses = document.getElementById('statCourses');
    const statRating = document.getElementById('statRating');

    if (statPatients) statPatients.textContent = String(uniquePatients.size);
    if (statAppointments) statAppointments.textContent = String(bookings.length);
    if (statCourses) statCourses.textContent = String(courses.length);

    const ratings = getRatings();
    const avg = getAverageRating();
    if (statRating) {
        statRating.textContent = avg === null ? '0' : avg.toFixed(1);
        statRating.title = avg === null
            ? (currentLang === 'ar' ? 'لا يوجد تقييمات بعد' : 'No ratings yet')
            : (currentLang === 'ar' ? `عدد المقيمين: ${ratings.length}` : `Ratings count: ${ratings.length}`);
    }
};

// Close modal on outside click
document.getElementById('courseModal')?.addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});