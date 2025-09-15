
// A function to create the PDF search page content
export function pdfSearchPageContent() {
  return `
    <h1>Sök PDF</h1>
    <p>Vi har börjat med PDF-filer och den senaste importen gjordes 2025-08-27.</p>
    <p>Kontakta din vänliga <b>datachef</b> Hanadi om du känner till fler PDF-filer som ska indexeras. <a href="mailto:hanadi.alsalman.data24sto@edu.tucsweden.se">hanadi.alsalman.data24sto@edu.tucsweden.se</a>.</p>
    <label for="meta-select">
      Sök på:
      <select id="meta-select" name="pdf-meta-field">
          <option value="title">Titel</option>
          <option value="author">Författare</option>
          <option value="creator">Skapare</option>
          <option value="keywords">Nyckelord</option>
          <option value="subject">Ämne</option>
          <option value="description">Beskrivning</option>
          <option value="text">Text</option>
      </select>
    </label>
    <label>
      <input name="pdf-search" type="text" placeholder="Sök bland PDF-filer" />
    </label>
    <button id="pdf-search-btn">Sök</button>
    <section class="pdf-search-result"></section>
  `;
}


// 2. Global event listeners for the pdf search page
document.body.addEventListener('click', event => {
  // Run search when clicking the "Sök" button
  const btn = event.target.closest('#pdf-search-btn');
  if (btn) {
    pdfSearch();
    return;
  }

  // Show all metadata button
  const metaBtn = event.target.closest('.btn-show-all-pdf-metadata');
  if (metaBtn) {
    showAllPdfMetadata(metaBtn);
  }
});

// Also run search when pressing Enter inside the input
document.body.addEventListener('keyup', event => {
  const input = event.target.closest('input[name="pdf-search"]');
  if (input && event.key === 'Enter') {
    pdfSearch();
  }
});

/*

// Listen to key up events in the pdf-search input field
document.body.addEventListener('keyup', event => {
  let inputField = event.target.closest('input[name="pdf-search"]');
  if (!inputField) { return; }
  pdfSearch();
});

*/

/*

// Listen to changes to the select/dropdown pdf meta field
document.body.addEventListener('change', event => {
  let select = event.target.closest('select[name="pdf-meta-field"]');
  if (!select) { return; }
  pdfSearch();
});


// event handler to show all metadata for a pdf file on click
// on the button btn-show-all-pdf-metadata
document.body.addEventListener('click', async event => {
  let button = event.target.closest('.btn-show-all-pdf-metadata');
  if (!button) { return; }
  // if we have clicked a  btn-show-all-pdf-metadata
  let id = button.getAttribute('data-id');
  // fetch detailed metadata
  let res = await fetch('/api/pdf-all-meta/' + id);
  let result = await res.json();
  // create a pre element
  let pre = document.createElement('pre');
  pre.innerHTML = JSON.stringify(result, null, 2);
  // add the newly created pre element after the button
  button.after(pre);
});
*/

// pdf search (called on key up in search field and on changes to the select/dropdown)
async function pdfSearch() {
  const inputField = document.querySelector('input[name="pdf-search"]');
  const value = inputField.value.trim();
  const resultSection = document.querySelector('.pdf-search-result');
  // if empty input field do not search just empty search results
  // if(!inputField.value){
  if (!value) {
    resultSection.innerHTML = '';
    return;
  }
  // get the chosen field to search for in the metadata
  const field = document.querySelector('select[name="pdf-meta-field"]').value;
  // ask the rest-api (correct rest route) for search results
  try {
    const res = await fetch(`/api/pdf-search/${field}/${value}`);
    if (!res.ok) throw new Error('Fel vid hämtning av data');
    const result = await res.json();

    let html = '';
    if (result.length === 0) {
      html = `<p>❌ Inga resultat hittades för "${ value }".</p>`;
    } else {
    for (let { id, fileName, title, author, creator, subject, keywords, description, text } of result) {
      html += `
        <article>
          <h2>${title || 'Okänd titel'}</h2>
              <p><b>Författare:</b> ${author || 'Okänd författare'}</p>
              <p><b>Skapare:</b> ${creator || 'Okänt'}</p>
              <p><b>Ämne:</b> ${subject || 'Saknas'}</p>
              <p><b>Nyckelord:</b> ${keywords || 'Saknas'}</p>
              <p><b>Beskrivning:</b> ${description || 'Ingen beskrivning'}</p>
              <p><b>Text:</b> ${text || 'Ingen text'}</p>
              <p><a href="/dm23-pdfs/${fileName}" download>Ladda ned filen</a></p>
              <p><button class="btn-show-all-pdf-metadata" data-id="${id}">Visa all metadata</button></p>
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
async function showAllPdfMetadata(button) {
  const id = button.getAttribute('data-id');
  const res = await fetch('/api/pdf-all-meta/' + id);
  const result = await res.json();

  const pre = document.createElement('pre');
  pre.innerHTML = JSON.stringify(result, null, 2);
  button.after(pre);
}

