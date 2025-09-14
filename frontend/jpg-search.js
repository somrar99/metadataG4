// frontend/jpg-search.js
// Sida + logik för att söka bland bilder via REST-API:t för /api/images

// 1) Sidans HTML-innehåll
export function jpgSearchPageContent() {
  return `
    <h1>Sök Photo</h1>
    <p>Här kan du söka bland importerade bilder (JPEG/EXIF).</p>
    <p>Exempel på filnamn: DSC00042.JPG</p>
    <p>Exempel på kameramärke: SONY</p>
    <p>Exempel på kameramodell: DSC-HX5V</p>
    <p>Exempel på ISO: 125</p>
    <p>Exempel på fotodatum: 2010-07-10T09:49:25.000Z</p>

    <label for="jpg-meta-select">Sök på:</label>
    <select id="jpg-meta-select" name="jpg-meta-field">
      <option value="fileName">filnamn</option>
      <option value="make">kameramärke</option>
      <option value="model">kameramodell</option>
      <option value="iso">ISO</option>
      <option value="dateTimeOriginal">fotodatum</option>
    </select>

    <input name="jpg-search" type="text" placeholder="Sök bland foton (t.ex. DSC)" />
    <section class="jpg-search-result"></section>
  `;
}

// 2) Globala händelser – trigga sök vid tangent/släpp och byten i select
document.body.addEventListener('keyup', (event) => {
  const input = event.target.closest('input[name="jpg-search"]');
  if (!input) return;
  jpgSearch();
});

document.body.addEventListener('change', (event) => {
  const sel = event.target.closest('select[name="jpg-meta-field"]');
  if (!sel) return;
  jpgSearch();
});

// 3) Visa all metadata för en bild (knapp i resultatlistan)
document.body.addEventListener('click', async (event) => {
  const btn = event.target.closest('.btn-show-all-jpg-metadata');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  const res = await fetch('/api/images/' + id);
  const json = await res.json();

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(json, null, 2);
  btn.after(pre);
});

// 4) Sökfunktion – anropar /api/images/search
async function jpgSearch() {
  const input = document.querySelector('input[name="jpg-search"]');
  const value = input?.value.trim() || '';
  const resultSection = document.querySelector('.jpg-search-result');

  if (value === '') {
    resultSection.innerHTML = '';
    return;
  }

  const field = document.querySelector('select[name="jpg-meta-field"]').value;

  try {
    // Query-varianten funkar med våra rutter
    const res = await fetch(`/api/images/search?field=${encodeURIComponent(field)}&value=${encodeURIComponent(value)}`);
    if (!res.ok) throw new Error('Fel vid hämtning av bilddata');
    const result = await res.json();

    let html = '';
    if (result.length === 0) {
      html = `<p>❌ Inga resultat hittades för "${value}".</p>`;
    } else {
      for (const { id, fileName } of result) {
        // Bilderna ligger under /frontend/photos/, men serveras statiskt som /photos/<fil>
        const src = `/photos/${fileName}`;
        html += `
          <article class="jpg-card">
            <h3>${fileName}</h3>
            <img src="${src}" alt="${fileName}" style="max-width:240px;display:block;margin-bottom:8px;">
            <p><a href="${src}" download>Ladda ned</a></p>
            <p><button class="btn-show-all-jpg-metadata" data-id="${id}">Visa all metadata</button></p>
          </article>
        `;
      }
    }

    resultSection.innerHTML = html;
  } catch (err) {
    resultSection.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
  }
}
