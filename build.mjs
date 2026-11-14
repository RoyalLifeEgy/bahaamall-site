// Builds the static Bahaa Mall website from config.json into ./dist (index.html, privacy.html, style.css, images).
// Run: node build.mjs   — then upload the dist folder (Hostinger public_html, or GitHub Pages).
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'node:fs';
const raw = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'));
// Values still marked TODO are never published: strings become empty, lists drop those entries.
const clean = (v) => Array.isArray(v) ? v.filter((x) => !JSON.stringify(x).includes('TODO')) : typeof v === 'string' && v.includes('TODO') ? '' : v;
const c = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, clean(v)]));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const todo = Object.entries(raw).filter(([, v]) => JSON.stringify(v).includes('TODO')).map(([k]) => k);
if (todo.length) console.warn('Still to fill in config.json:', todo.join(', '));

const year = new Date().getFullYear();
const metaTag = c.metaDomainVerification ? `<meta name="facebook-domain-verification" content="${esc(c.metaDomainVerification)}">` : '<!-- Meta domain verification: put the code in config.json "metaDomainVerification" and rebuild -->';
const head = (title, desc) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${metaTag}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f3d3e'/%3E%3Ctext x='32' y='43' font-size='30' text-anchor='middle' fill='%23e8c37d' font-family='Georgia'%3EB%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="top"><div class="wrap top__in">
  <a class="brand" href="index.html"><span class="brand__mark">B</span><span class="brand__name">${esc(c.storeName)}</span></a>
  <nav class="nav"><a href="index.html#contact">تواصل معنا</a><a href="index.html#hours">المواعيد</a><a href="privacy.html">سياسة الخصوصية</a></nav>
</div></header>`;

const footer = `<footer class="foot"><div class="wrap foot__grid">
  <div><h3>${esc(c.storeName)}</h3><p>${esc(c.legalName)}</p><p>${esc(c.address)}</p></div>
  <div><h3>بيانات قانونية <span class="en">Legal details</span></h3>
    <p>سجل تجاري رقم <b>${esc(c.commercialRegister)}</b><br><span class="en">Commercial Register No. ${esc(c.commercialRegister)}</span></p>
    <p>رقم التسجيل الضريبي <b dir="ltr">${esc(c.taxNumber)}</b><br><span class="en">Tax Registration No. ${esc(c.taxNumber)}</span></p></div>
  <div><h3>اتصل بنا <span class="en">Contact</span></h3>
    <p><a href="tel:${esc(c.phoneIntl)}" dir="ltr">${esc(c.phoneDisplay)}</a></p>
    <p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
    <p><a href="privacy.html">سياسة الخصوصية <span class="en">Privacy Policy</span></a></p></div>
</div><div class="wrap foot__copy">© ${year} ${esc(c.storeName)} · ${esc(c.legalName)}</div></footer>
<a class="wa-float" href="https://wa.me/${esc(c.whatsappIntl)}" target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path fill="#fff" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.2-.5-.2-.7.1l-1 1.2c-.2.2-.4.3-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.3 3.6 5.7 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5 0-.2-.3-.3-.6-.4Z"/></svg>
</a>
</body></html>`;

const photos = c.photos.length
  ? c.photos.map((p) => `<figure><img src="img/${esc(p.file)}" alt="${esc(p.alt || c.storeName)}" loading="lazy" width="600" height="800"></figure>`).join('')
  : `<figure class="ph"><span>صورة المحل</span></figure><figure class="ph"><span>ملابس رجالي</span></figure><figure class="ph"><span>ملابس حريمي</span></figure><figure class="ph"><span>ملابس أطفال</span></figure>`;

const index = `${head(`${c.storeName} – ملابس جاهزة للرجال والسيدات والأطفال`, `${c.storeName}: ${c.descriptionEn}. ${c.address}`)}
<main>
<section class="hero"><div class="wrap hero__in">
  ${c.heroImage ? `<img class="hero__img" src="img/${esc(c.heroImage.file)}" alt="${esc(c.heroImage.alt)}" width="1024" height="1024">` : ''}
  <div class="hero__txt">
  <p class="hero__kicker">المحلة الكبرى · Mahalla El Kubra</p>
  <h1>${esc(c.storeName)}</h1>
  <p class="hero__ar">${esc(c.descriptionAr)}</p>
  <p class="hero__en" lang="en" dir="ltr">${esc(c.descriptionEn)}</p>
  <div class="hero__cta">
    <a class="btn btn--wa" href="https://wa.me/${esc(c.whatsappIntl)}" target="_blank" rel="noopener">تواصل عبر واتساب</a>
    <a class="btn btn--call" href="tel:${esc(c.phoneIntl)}">اتصل بنا <span dir="ltr">${esc(c.phoneDisplay)}</span></a>
  </div>
  </div>
</div></section>

<section class="wrap cards">
  <article class="card"><h2>من نحن <span class="en">About</span></h2>
    <p><b>${esc(c.storeName)}</b> – ${esc(c.descriptionAr)}.</p>
    <p lang="en" dir="ltr" class="en-block">${esc(c.storeName)} – ${esc(c.descriptionEn)}.</p>
    <p>الاسم القانوني: <b>${esc(c.legalName)}</b></p></article>
  <article class="card" id="hours"><h2>مواعيد العمل <span class="en">Opening hours</span></h2>
    ${c.hoursAr?.length
      ? `<ul class="hours">${c.hoursAr.map((h, i) => `<li>${esc(h)}<br><span class="en" dir="ltr">${esc(c.hoursEn?.[i] ?? '')}</span></li>`).join('')}</ul>`
      : `<p>للاستعلام عن مواعيد العمل تواصل معنا على واتساب أو بالتليفون.</p>
    <p lang="en" dir="ltr" class="en-block">For opening hours, message us on WhatsApp or call us.</p>
    <p><a class="btn btn--wa btn--sm" href="https://wa.me/${esc(c.whatsappIntl)}" target="_blank" rel="noopener">واتساب <span dir="ltr">${esc(c.phoneDisplay)}</span></a></p>`}</article>
</section>

<section class="wrap"><h2 class="sec">من داخل المحل <span class="en">Our store</span></h2><div class="gallery">${photos}</div></section>

<section class="wrap contact" id="contact">
  <div class="contact__info"><h2 class="sec">تواصل معنا <span class="en">Contact us</span></h2>
    <p class="row"><b>العنوان:</b> ${esc(c.address)}</p>
    <p class="row"><b>التليفون:</b> <a href="tel:${esc(c.phoneIntl)}" dir="ltr">${esc(c.phoneDisplay)}</a></p>
    <p class="row"><b>واتساب:</b> <a href="https://wa.me/${esc(c.whatsappIntl)}" target="_blank" rel="noopener">راسلنا على واتساب</a></p>
    <p class="row"><b>البريد الإلكتروني:</b> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
    <p class="row"><b>فيسبوك:</b> <a href="${esc(c.facebook)}" target="_blank" rel="noopener">صفحتنا على فيسبوك</a></p></div>
  <div class="contact__en" lang="en" dir="ltr"><h2 class="sec">Contact us</h2>
    <p class="row"><b>Address:</b> Souq El-Laban, El-Omareya, El-Mahalla El-Kubra, Gharbia, Egypt</p>
    <p class="row"><b>Phone:</b> <a href="tel:${esc(c.phoneIntl)}">${esc(c.phoneDisplay)}</a></p>
    <p class="row"><b>WhatsApp:</b> <a href="https://wa.me/${esc(c.whatsappIntl)}" target="_blank" rel="noopener">Message us on WhatsApp</a></p>
    <p class="row"><b>Email:</b> <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
    <p class="row"><b>Facebook:</b> <a href="${esc(c.facebook)}" target="_blank" rel="noopener">Our Facebook page</a></p></div>
</section>
</main>
${footer}`;

const privacy = `${head(`سياسة الخصوصية – ${c.storeName}`, `Privacy Policy of ${c.storeName}`)}
<main class="wrap doc">
<h1>سياسة الخصوصية</h1>
<p class="muted">آخر تحديث: ${new Date().toISOString().slice(0, 10)}</p>
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
<ul><li>البريد الإلكتروني: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li><li>التليفون / واتساب: <a href="tel:${esc(c.phoneIntl)}" dir="ltr">${esc(c.phoneDisplay)}</a></li><li>العنوان: ${esc(c.address)}</li></ul>

<hr>
<section lang="en" dir="ltr" class="en-doc">
<h1>Privacy Policy</h1>
<p>This policy explains how <b>${esc(c.storeName)}</b> (${esc(c.legalName)}) handles customer data.</p>
<h2>Data we collect</h2><ul><li>Customer name.</li><li>Phone number.</li></ul>
<h2>Why we collect it</h2><ul><li>To process and follow up orders.</li><li>To issue invoices and receipts.</li><li>To send offers and discounts by SMS or WhatsApp.</li></ul>
<p>We do not sell your data or share it with others for their own marketing.</p>
<h2>How to opt out of messages</h2><ul><li>Reply <b>STOP</b> to any SMS or WhatsApp message from us.</li><li>Or send your request by WhatsApp or email (below), or ask in the store.</li></ul>
<p>We stop sending marketing messages within 7 days of receiving your request.</p>
<h2>Privacy requests and contact</h2><p>To access, correct or delete your data, contact us:</p>
<ul><li>Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li><li>Phone / WhatsApp: <a href="tel:${esc(c.phoneIntl)}">${esc(c.phoneDisplay)}</a></li><li>Address: <span dir="rtl">${esc(c.address)}</span></li></ul>
</section>
</main>
${footer}`;

const out = new URL('./docs/', import.meta.url);   // GitHub Pages serves this folder
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
writeFileSync(new URL('index.html', out), index);
writeFileSync(new URL('privacy.html', out), privacy);
cpSync(new URL('./src/style.css', import.meta.url), new URL('style.css', out));
cpSync(new URL('./src/img/', import.meta.url), new URL('img/', out), { recursive: true });
writeFileSync(new URL('CNAME', out), c.domain + '\n');           // GitHub Pages custom domain (ignored by Hostinger)
writeFileSync(new URL('robots.txt', out), 'User-agent: *\nAllow: /\n');
console.log('Built docs/ (index.html, privacy.html, style.css, img/)');
