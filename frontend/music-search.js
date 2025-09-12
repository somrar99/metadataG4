// music-search.js

// music-search.js

// 1. Page content with button
export function musicSearchPageContent() {
  return `
    <h1>Sök Musik</h1>
    <p>Här kan ni söka alla typ av musik med olika filterering.</p>
    <p>
      Kontakta din vänliga <b>data manager</b> Anmol om du känner till fler musikfiler som ska indexeras.
      <a href="mailto:anmolwakas33@gmail.com">anmolwakas33@gmail.com</a>.
    </p>
    <label>
      Sök på: 
      <select name="music-meta-field">
        <option value="artist">artist</option>
        <option value="title">titel</option>
        <option value="album">album</option>
        <option value="genre">genre</option>
      </select>
    </label>
    <label>
      <input name="music-search" type="text" placeholder="Sök bland musikfiler">
    </label>
    <button id="music-search-btn">Sök</button>
    <section class="music-search-result"></section>
  `;
}

// 2. Global event listeners for the music search page
document.body.addEventListener('click', event => {
  // Run search when clicking the "Sök" button
  const btn = event.target.closest('#music-search-btn');
  if (btn) {
    musicSearch();
    return;
  }

  // Show all metadata button
  const metaBtn = event.target.closest('.btn-show-all-music-metadata');
  if (metaBtn) {
    showAllMusicMetadata(metaBtn);
  }
});

// Also run search when pressing Enter inside the input
document.body.addEventListener('keyup', event => {
  const input = event.target.closest('input[name="music-search"]');
  if (input && event.key === 'Enter') {
    musicSearch();
  }
});

// 3. Search function
async function musicSearch() {
  const inputField = document.querySelector('input[name="music-search"]');
  const value = inputField?.value.trim();
  const resultSection = document.querySelector('.music-search-result');

  if (!value) {
    resultSection.innerHTML = '';
    return;
  }

  const field = document.querySelector('select[name="music-meta-field"]').value;

  try {
    const res = await fetch(`/api/music-search/${ field }/${ value }`);
    if (!res.ok) throw new Error('Fel vid hämtning av musikdata');
    const result = await res.json();

    let html = '';
    if (result.length === 0) {
      html = `<p>❌ Inga resultat hittades för "${ value }".</p>`;
    } else {
      for (let { id, fileName, title, artist, album, genre } of result) {
        html += `
          <article>
            <h3>${ artist || 'Okänd artist' }</h3>
            <h2>${ title || 'Okänd titel' }</h2>
            <p><b>Album:</b> ${ album || 'Okänt album' }</p>
            <p><b>Genre:</b> ${ genre || 'Okänd genre' }</p>
            <audio controls src="/music/${ fileName }"></audio>
            <p><a href="/music/${ fileName }" download>Ladda ned filen</a></p>
            <p><button class="btn-show-all-music-metadata" data-id="${ id }">Visa all metadata</button></p>
          </article>
        `;
      }
    }

    resultSection.innerHTML = html;
  } catch (err) {
    resultSection.innerHTML = `<p class="error">⚠️ ${ err.message }</p>`;
  }
}

// 4. Show all metadata function
async function showAllMusicMetadata(button) {
  const id = button.getAttribute('data-id');
  const res = await fetch('/api/music-all-meta/' + id);
  const result = await res.json();

  const pre = document.createElement('pre');
  pre.innerHTML = JSON.stringify(result, null, 2);
  button.after(pre);
}
