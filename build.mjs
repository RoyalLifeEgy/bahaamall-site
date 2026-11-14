// Builds the static Bahaa Mall website from config.json into ./docs (served by GitHub Pages).
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
const raw = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'));
// Values still marked TODO are never published: strings become empty, lists drop those entries.
const clean = (v) => Array.isArray(v) ? v.filter((x) => !JSON.stringify(x).includes('TODO')) : typeof v === 'string' && v.includes('TODO') ? '' : v;
const c = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, clean(v)]));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const todo = Object.entries(raw).filter(([, v]) => JSON.stringify(v).includes('TODO')).map(([k]) => k);
if (todo.length) console.warn('Still to fill in config.json:', todo.join(', '));

const year = new Date().getFullYear();
const wa = (text) => `https://wa.me/${esc(c.whatsappIntl)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
const tel = `tel:${esc(c.phoneIntl)}`;
const img = (p, cls = '', extra = '') => `<img${cls ? ` class="${cls}"` : ''} src="img/${esc(p.file)}" alt="${esc(p.alt || c.storeName)}" ${extra}>`;
const gem = '<svg class="gem" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0 7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6Z"/></svg>';
const waIcon = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.2-.5-.2-.7.1l-1 1.2c-.2.2-.4.3-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.3 3.6 5.7 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5 0-.2-.3-.3-.6-.4Z"/></svg>';
const metaTag = c.metaDomainVerification ? `<meta name="facebook-domain-verification" content="${esc(c.metaDomainVerification)}">` : '<!-- Meta domain verification: put the code in config.json "metaDomainVerification" and rebuild -->';

const head = (title, desc, page) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<script>document.documentElement.className+=" js"</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#2b211c">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://${esc(c.domain)}/img/${esc(c.images.sign.file)}">
<meta property="og:url" content="https://${esc(c.domain)}/${page === 'privacy' ? 'privacy.html' : ''}">
${metaTag}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%232b211c'/%3E%3Ctext x='32' y='44' font-size='34' font-style='italic' text-anchor='middle' fill='%23d8c3a0' font-family='Georgia'%3EB%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=IBM+Plex+Sans+Arabic:wght@300;400;500&display=swap">
<link rel="stylesheet" href="style.css">
</head>
<body class="page-${page}">
<div class="bar"><div class="wrap bar__in">
  <span>${esc(c.address)}</span>
  <a href="${tel}" dir="ltr">${esc(c.phoneDisplay)}</a>
</div></div>
<header class="top"><div class="wrap top__in">
  <a class="mark" href="index.html" aria-label="${esc(c.storeName)}"><span class="mark__en">${esc(c.storeName)}</span><span class="mark__ar">${esc(c.storeNameAr)}</span></a>
  <nav class="nav">
    <a href="index.html#collections">التشكيلات</a>
    <a href="index.html#about">من نحن</a>
    <a href="index.html#visit">تواصل معنا</a>
    <a href="privacy.html">سياسة الخصوصية</a>
  </nav>
  <a class="top__wa" href="${wa()}" target="_blank" rel="noopener">${waIcon}<span>واتساب</span></a>
</div></header>`;

const footer = `<footer class="foot"><div class="wrap">
  <div class="foot__mark"><span class="mark__en">${esc(c.storeName)}</span><span class="foot__tag">جودة ${gem} أناقة ${gem} تنوع ${gem} بأفضل الأسعار</span></div>
  <div class="foot__grid">
    <div><h3>المحل <span>Store</span></h3><p>${esc(c.legalName)}</p><p>${esc(c.address)}</p><p class="en" lang="en" dir="ltr">${esc(c.addressEn)}</p></div>
    <div><h3>بيانات قانونية <span>Legal</span></h3>
      <p>سجل تجاري رقم ${esc(c.commercialRegister)}<br><span class="en" lang="en">Commercial Register No. 44883 – El-Mahalla El-Kubra</span></p>
      <p>رقم التسجيل الضريبي <span dir="ltr">${esc(c.taxNumber)}</span><br><span class="en" lang="en">Tax Registration No. ${esc(c.taxNumber)}</span></p></div>
    <div><h3>تواصل <span>Contact</span></h3>
      <p><a href="${tel}" dir="ltr">${esc(c.phoneDisplay)}</a></p>
      <p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
      <p><a href="${esc(c.facebook)}" target="_blank" rel="noopener">فيسبوك <span class="en">Facebook</span></a></p>
      <p><a href="privacy.html">سياسة الخصوصية <span class="en">Privacy Policy</span></a></p></div>
  </div>
  <div class="foot__copy"><span>© ${year} ${esc(c.storeName)} · ${esc(c.legalName)}</span><span>${esc(c.domain)}</span></div>
</div></footer>
<a class="wa-float" href="${wa()}" target="_blank" rel="noopener" aria-label="WhatsApp">${waIcon}</a>
<script>
(function(){var els=document.querySelectorAll('.rv');if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(function(e){e.classList.add('in')});return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});els.forEach(function(e){io.observe(e)})})();
</script>
</body></html>`;

const hours = c.hoursAr?.length
  ? `<ul class="hours">${c.hoursAr.map((h, i) => `<li>${esc(h)} <span class="en" dir="ltr">${esc(c.hoursEn?.[i] ?? '')}</span></li>`).join('')}</ul>`
  : `<p>راسلنا على واتساب أو اتصل بنا لمعرفة مواعيد العمل.</p><p class="en" lang="en" dir="ltr">Message us on WhatsApp or call for opening hours.</p>`;

const index = `${head(`${c.storeName} | ${c.storeNameAr} – ملابس جاهزة للرجال والسيدات والأطفال، المحلة الكبرى`, `${c.storeName} (${c.storeNameAr}): ${c.descriptionAr}. ${c.address}`, 'home')}
<main>

<section class="hero"><div class="wrap hero__in">
  <div class="hero__txt">
    <p class="eyebrow eyebrow--ar">ملابس جاهزة ${gem} رجالي ${gem} حريمي ${gem} أطفال</p>
    <h1>كل ما تحتاجه…<br><em>في مكان واحد</em></h1>
    <p class="hero__latin" lang="en" dir="ltr">Everything you need, in one place.</p>
    <p class="hero__lead">${esc(c.storeNameAr)} – ${esc(c.descriptionAr)} في قلب المحلة الكبرى.</p>
    <p class="hero__lead en" lang="en" dir="ltr">${esc(c.storeName)} – ${esc(c.descriptionEn)}, in El-Mahalla El-Kubra.</p>
    <div class="cta">
      <a class="btn btn--dark" href="${wa('مرحباً، أريد الاستفسار عن المنتجات المتاحة')}" target="_blank" rel="noopener">${waIcon}<span>تواصل عبر واتساب</span></a>
      <a class="btn btn--line" href="${tel}"><span>اتصل بنا</span><span dir="ltr">${esc(c.phoneDisplay)}</span></a>
    </div>
  </div>
  <div class="hero__art">
    <div class="arch arch--hero">${img(c.images.hero, '', 'width="710" height="1600" fetchpriority="high"')}</div>
    <div class="hero__sign">${img(c.images.sign, '', 'width="1024" height="1024"')}</div>
  </div>
</div></section>

<section class="values" aria-label="قيمنا"><div class="wrap values__in">
  <div><b>جودة</b><span lang="en">Quality</span></div>${gem}
  <div><b>أناقة</b><span lang="en">Elegance</span></div>${gem}
  <div><b>تنوع</b><span lang="en">Variety</span></div>${gem}
  <div><b>بأفضل الأسعار</b><span lang="en">Fair prices</span></div>
</div></section>

<section class="sec wrap" id="collections">
  <header class="sec__head rv"><p class="eyebrow">Collections</p><h2>تشكيلاتنا</h2><p class="sec__sub">ملابس للعيلة كلها – اسألنا على واتساب عن الموديلات والمقاسات المتاحة.</p></header>
  <div class="cols">
    ${c.collections.map((k, i) => `<a class="col rv" style="--d:${i * 120}ms" href="${wa(k.ask)}" target="_blank" rel="noopener">
      <div class="arch">${img(k, '', 'loading="lazy" width="600" height="800"')}</div>
      <div class="col__cap"><h3>${esc(k.ar)}</h3><span class="latin" lang="en">${esc(k.en)}</span></div>
      <span class="col__ask">اسأل عن الموديلات المتاحة <i aria-hidden="true">←</i></span>
    </a>`).join('')}
  </div>
</section>

<section class="look"><div class="wrap">
  <header class="sec__head sec__head--row rv"><div><p class="eyebrow">From the store</p><h2>من المحل</h2></div><a class="link" href="${esc(c.facebook)}" target="_blank" rel="noopener">شاهد المزيد على فيسبوك <i aria-hidden="true">←</i></a></header>
  <div class="look__grid">
    ${c.lookbook.map((p, i) => `<figure class="rv${p.tone ? ' tone' : ''}" style="--d:${i * 90}ms">${img(p, '', 'loading="lazy" width="600" height="900"')}</figure>`).join('')}
  </div>
</div></section>

<section class="about wrap" id="about">
  <div class="about__img rv">${img(c.images.sign, '', 'loading="lazy" width="1024" height="1024"')}</div>
  <div class="about__txt rv" style="--d:120ms">
    <p class="eyebrow">About us</p>
    <h2>${esc(c.storeNameAr)} <span class="latin" lang="en">${esc(c.storeName)}</span></h2>
    <p>${esc(c.storeNameAr)} محل ${esc(c.descriptionAr.replace(/^بيع/, 'لبيع'))}، في سوق اللبن بالعمرية – المحلة الكبرى. نختار تشكيلاتنا بعناية لتجمع بين الجودة والأناقة والتنوع بأسعار مناسبة.</p>
    <p class="en" lang="en" dir="ltr">${esc(c.storeName)} is a store for the ${esc(c.descriptionEn)}, located in Souq El-Laban, El-Omareya, El-Mahalla El-Kubra.</p>
    <dl class="facts">
      <div><dt>الاسم القانوني</dt><dd>${esc(c.legalName)}</dd></div>
      <div><dt>سجل تجاري</dt><dd>${esc(c.commercialRegister)}</dd></div>
      <div><dt>رقم التسجيل الضريبي</dt><dd dir="ltr">${esc(c.taxNumber)}</dd></div>
    </dl>
  </div>
</section>

<section class="visit" id="visit"><div class="visit__in">
  <div class="visit__img">${img(c.images.visit, '', 'loading="lazy" width="900" height="976"')}</div>
  <div class="visit__txt rv">
    <p class="eyebrow">Visit &amp; contact</p>
    <h2>زورونا أو كلمونا</h2>
    <p class="visit__addr">${esc(c.address)}</p>
    <p class="en" lang="en" dir="ltr">${esc(c.addressEn)}</p>
    <ul class="rows">
      <li><span>التليفون <i lang="en">Phone</i></span><a href="${tel}" dir="ltr">${esc(c.phoneDisplay)}</a></li>
      <li><span>واتساب <i lang="en">WhatsApp</i></span><a href="${wa()}" target="_blank" rel="noopener" dir="ltr">${esc(c.phoneDisplay)}</a></li>
      <li><span>البريد <i lang="en">Email</i></span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
      <li><span>فيسبوك <i lang="en">Facebook</i></span><a href="${esc(c.facebook)}" target="_blank" rel="noopener">صفحة المحل</a></li>
    </ul>
    <div class="visit__hours" id="hours"><h3>مواعيد العمل <i lang="en">Opening hours</i></h3>${hours}</div>
    <div class="cta"><a class="btn btn--gold" href="${wa()}" target="_blank" rel="noopener">${waIcon}<span>راسلنا على واتساب</span></a></div>
  </div>
</div></section>

</main>
${footer}`;

const privacy = `${head(`سياسة الخصوصية – ${c.storeName}`, `Privacy Policy – ${c.storeName}`, 'privacy')}
<main class="doc wrap">
<header class="doc__head"><p class="eyebrow">Privacy Policy</p><h1>سياسة الخصوصية</h1><p class="muted">آخر تحديث: ${new Date().toISOString().slice(0, 10)}</p></header>
<div class="doc__cols">
<article class="doc__ar">
<p>توضح هذه السياسة كيف يتعامل <b>${esc(c.storeName)}</b> (${esc(c.legalName)}) مع بيانات العملاء.</p>
<h2>البيانات التي نجمعها</h2>
<ul><li>اسم العميل.</li><li>رقم الهاتف.</li></ul>
<h2>لماذا نجمع هذه البيانات</h2>
<ul><li>تنفيذ الطلبات ومتابعتها.</li><li>إصدار الفواتير والإيصالات.</li><li>إرسال العروض والخصومات عبر الرسائل القصيرة (SMS) أو واتساب.</li></ul>
<p>لا نبيع بياناتك ولا نشاركها مع أي جهة لأغراض تسويقية خاصة بها.</p>
<h2>كيف تلغي استلام الرسائل</h2>
<ul><li>رُد على أي رسالة واتساب أو SMS منا بكلمة <b>«إلغاء»</b> أو <b>STOP</b>.</li><li>أو أرسل طلبك عبر واتساب أو البريد الإلكتروني أدناه، أو اطلب ذلك في المحل.</li></ul>
<p>سنتوقف عن إرسال الرسائل التسويقية خلال 7 أيام على الأكثر من استلام طلبك.</p>
<h2>طلبات الخصوصية والتواصل</h2>
<p>لطلب الاطلاع على بياناتك أو تصحيحها أو حذفها، تواصل معنا:</p>
<ul><li>البريد الإلكتروني: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li><li>التليفون / واتساب: <a href="${tel}" dir="ltr">${esc(c.phoneDisplay)}</a></li><li>العنوان: ${esc(c.address)}</li></ul>
</article>
<article class="doc__en" lang="en" dir="ltr">
<p>This policy explains how <b>${esc(c.storeName)}</b> (${esc(c.legalName)}) handles customer data.</p>
<h2>Data we collect</h2><ul><li>Customer name.</li><li>Phone number.</li></ul>
<h2>Why we collect it</h2><ul><li>To process and follow up orders.</li><li>To issue invoices and receipts.</li><li>To send offers and discounts by SMS or WhatsApp.</li></ul>
<p>We do not sell your data or share it with others for their own marketing.</p>
<h2>How to opt out of messages</h2><ul><li>Reply <b>STOP</b> to any SMS or WhatsApp message from us.</li><li>Or send your request by WhatsApp or email (below), or ask in the store.</li></ul>
<p>We stop sending marketing messages within 7 days of receiving your request.</p>
<h2>Privacy requests and contact</h2><p>To access, correct or delete your data, contact us:</p>
<ul><li>Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li><li>Phone / WhatsApp: <a href="${tel}">${esc(c.phoneDisplay)}</a></li><li>Address: ${esc(c.addressEn)}</li></ul>
</article>
</div>
</main>
${footer}`;

const out = new URL('./docs/', import.meta.url);   // GitHub Pages serves this folder
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
writeFileSync(new URL('index.html', out), index);
writeFileSync(new URL('privacy.html', out), privacy);
cpSync(new URL('./src/style.css', import.meta.url), new URL('style.css', out));
cpSync(new URL('./src/img/', import.meta.url), new URL('img/', out), { recursive: true });
writeFileSync(new URL('CNAME', out), c.domain + '\n');           // GitHub Pages custom domain
writeFileSync(new URL('robots.txt', out), 'User-agent: *\nAllow: /\n');
console.log('Built docs/ (index.html, privacy.html, style.css, img/)');
