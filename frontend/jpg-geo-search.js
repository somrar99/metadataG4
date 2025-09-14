// frontend/jpg-geo-search.js
// --------------------------------------------------------
// Sida + logik för att söka bland bilder via GEO (lat, lon, radie)
// Använder backend-rutten: GET /api/images/near?lat=..&lon=..&radiusKm=..
// Vi rör inte den befintliga jpg-search-sidan.
// --------------------------------------------------------

// 1) Sidans HTML-innehåll
export function jpgGeoSearchPageContent() {
  return `
    <h1>Sök Photo (GEO)</h1>
    <p>Här kan du söka bland importerade bilder som har GPS-koordinater (JPEG/EXIF).</p>

    <div class="geo-form" style="display:grid;grid-template-columns:repeat(4, minmax(140px, 1fr));gap:.75rem;max-width:880px;align-items:end;">
      <label>
        <span>Latitud</span>
        <input id="geo-lat" type="number" step="0.000001" placeholder="t.ex. 59.334" />
      </label>
      <label>
        <span>Longitud</span>
        <input id="geo-lon" type="number" step="0.000001" placeholder="t.ex. 18.063" />
      </label>
      <label>
        <span>Radie (km)</span>
        <input id="geo-radius" type="number" step="1" min="1" value="50" />
      </label>
      <button id="geo-search-btn">Sök</button>
    </div>

    <div id="geo-status" style="margin-top:.75rem;"></div>
    <section class="jpg-geo-search-result" style="margin-top:1rem;display:grid;grid-template-columns:repeat(auto-fill, minmax(240px,1fr));gap:1rem;"></section>
  `;
}

// 2) Globala händelser – klick på Sök-knappen
document.body.addEventListener('click', async (event) => {
  const btn = event.target.closest('#geo-search-btn');
  if (!btn) return;
  await runGeoSearch();
});

// 3) Sökfunktion – anropar /api/images/near
async function runGeoSearch() {
  const latEl = document.getElementById('geo-lat');
  const lonEl = document.getElementById('geo-lon');
  const radEl = document.getElementById('geo-radius');
  const resultSection = document.querySelector('.jpg-geo-search-result');
  const statusEl = document.getElementById('geo-status');

  const lat = parseFloat(latEl?.value ?? '');
  const lon = parseFloat(lonEl?.value ?? '');
  const radiusKm = parseFloat(radEl?.value ?? '50');

  if ([lat, lon, radiusKm].some(Number.isNaN)) {
    statusEl.textContent = '⚠️ Ange lat, lon och radie som tal.';
    resultSection.innerHTML = '';
    return;
  }

  statusEl.textContent = 'Söker...';
  resultSection.innerHTML = '';

  try {
    const url = `/api/images/near?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radiusKm=${encodeURIComponent(radiusKm)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fel vid hämtning av bilddata');
    const result = await res.json();

    if (!Array.isArray(result) || result.length === 0) {
      statusEl.textContent = `❌ Inga resultat inom ${radiusKm} km.`;
      resultSection.innerHTML = '';
      return;
    }

    statusEl.textContent = `Hittade ${result.length} bild(er).`;

    // Anta att era bilder serveras som /photos/<filnamn> (samma som i jpg-search.js)
    let html = '';
    for (const row of result) {
      const fileName = row.fileName ?? '(okänt filnamn)';
      const src = `/photos/${fileName}`;
      const dist = row.distance != null ? `${Number(row.distance).toFixed(1)} km` : '';
      const latText = row.latitude != null ? Number(row.latitude).toFixed(6) : '—';
      const lonText = row.longitude != null ? Number(row.longitude).toFixed(6) : '—';

      html += `
        <article class="jpg-card" style="border:1px solid #eee;border-radius:10px;overflow:hidden;">
          <h3 style="padding:.5rem .6rem;margin:0;">${fileName}</h3>
          <img src="${src}" alt="${fileName}" style="width:100%;height:180px;object-fit:cover;display:block;">
          <div style="padding:.5rem .6rem;font-size:.9rem;">
            <div><small>lat: ${latText}, lon: ${lonText}${dist ? `, ≈ ${dist}` : ''}</small></div>
            <div style="margin-top:.4rem;"><a href="${src}" download>Ladda ned</a></div>
          </div>
        </article>
      `;
    }
    resultSection.innerHTML = html;
  } catch (err) {
    console.error(err);
    statusEl.textContent = `⚠️ ${err.message}`;
    resultSection.innerHTML = '';
  }
}
