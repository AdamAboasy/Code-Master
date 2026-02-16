(function () {
    // غيّر المسار إذا وضعت الصور في مجلد آخر، مثلاً: 'designs/' داخل projects
    var ASSETS = '../images/';
    var PREFIX = '';
    var designImages = [
        '1.png',
        '12454.png',
        '19914.png',
        '497906358_122132606960750369_6703128372534279243_n.jpg',
        '600.png',
        'Adam Sherif.png',
        'Big sale.png',
        'Code m.png',
        'code master logo.jpg.jpeg',
        'Code mTYUI.png',
        'Content Writing.png',
        'COOMING SOON.png',
        'dewedwedewf.png',
        'Egypt.png',
        'Egyptfsf.png',
        'EVENT.png',
        'fcdvcdvv.png',
        'fdh.png',
        'FORIX.png',
        'FORIXcscsac.png',
        'FORIXo[pol[pl.png',
        'FORIXؤيسؤسيؤ.png',
        'full-time.png',
        'Ivory Coast.png',
        'Learn HTML.png',
        'M.El Shenawy (GK) Alfredo Torres Bailey Dupont Benjamin Shah Chad Gibbons Connor Hamilton Dani Martinez Kim Chun Hei (C) Matt Zhang Murad Naser Neil Tran.png',
        'M.El Shenawy (GK) Y.Ibrahim R.Rabie A.Fatouh M.Hany M.Atea A.Zizo H.Fathy M.Salah (C) O.Marmosh M.Mohammed.png',
        'Montage.png',
        'new ONE.png',
        'New89 (1).png',
        'New89.png',
        'op.png',
        'PR.png',
        'Quality.png',
        'Starting.png',
        'Untitled designh.png',
        'We Come.png',
        'Web Development RoadMap.png',
        'WhatsApp Image 2026-02-04 at 8.16.15 PM.jpeg',
        'You have the power to protect your peace..png',
        'أسماك الشيخ.png',
        'بقثلقثلقث.png',
        'سحة.png',
        'WhatsApp Image 2025-03-01 at 20.55.30_76865bcf.jpg',
        'WhatsApp Image 2025-03-01 at 20.55.31_94e29289.jpg',
        'WhatsApp Image 2025-03-01 at 20.55.31_a6629ea3.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.48_077ff01e.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.48_8732af3c.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.49_973e5bda.jpg', 'WhatsApp Image 2025-03-03 at 20.52.49_1088ee47.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.49_a95911b7.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.49_d026916f.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.50_0bbf2c6b.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.50_38b2c3aa.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.50_a9a2e9f9.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.50_a93ef7a8.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.50_b249dd04.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.51_6e11a99c.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.51_0357f010.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.51_04533bf3.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.51_5625ed9c.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.51_fdf93d81.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.52_03a3bea0.jpg',
        'WhatsApp Image 2025-03-03 at 20.52.52_9866e938.jpg',
        'Mercedes-Benz.png',
        '66.jpg',
        '67.jpg',
        '68.jpg',
        '69.jpg',
        '70.jpg'
    ];
    var grid = document.getElementById('designs-grid');
    if (!grid) return;

    function translateCaption(el) {
        var enText = el.getAttribute('data-en');
        var arText = el.getAttribute('data-ar');
        if (!enText || !arText) return;
        // Always show English for design captions
        el.textContent = enText;
    }

    function translateAllCaptions() {
        document.querySelectorAll('[data-en][data-ar]').forEach(function (el) {
            if (el.classList && el.classList.contains('caption')) {
                translateCaption(el);
            }
        });
    }

    designImages.forEach(function (name, i) {
        var src = ASSETS + encodeURIComponent(name);
        var card = document.createElement('div');
        card.className = 'design-card';
        card.setAttribute('data-index', i);

        var imgWrap = document.createElement('div');
        imgWrap.className = 'img-wrap';
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Design ' + (i + 1);
        img.loading = 'lazy';
        imgWrap.appendChild(img);

        var caption = document.createElement('div');
        caption.className = 'caption';
        caption.setAttribute('data-en', 'Design ' + (i + 1));
        caption.setAttribute('data-ar', 'تصميم ' + (i + 1));
        caption.textContent = 'Design ' + (i + 1);

        card.appendChild(imgWrap);
        card.appendChild(caption);
        grid.appendChild(card);
    });

    // تطبيق الترجمة الأولية
    translateAllCaptions();

    // مراقبة تغيرات اللغة التي قد تحدث من script.js
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
                translateAllCaptions();
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbClose = document.getElementById('lb-close');
    function openLightbox(src) {
        if (!lbImg || !lightbox) return;
        lbImg.src = src;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lbImg) lbImg.src = '';
    }
    grid.addEventListener('click', function (e) {
        var card = e.target.closest('.design-card');
        if (!card) return;
        var img = card.querySelector('.img-wrap img');
        if (img && img.src) openLightbox(img.src);
    });
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
})();