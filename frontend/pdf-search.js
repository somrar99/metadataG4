// A function to create the pdf search page content
export function pdfSearchPageContent() {
  return `
      <h1>Sök PDF</h1>
          <p>Vi har börjat med pdfs-filer och nuvarande import gjorde 2025-08-27.</p>
          <p>Kontakta din vänliga <b>data manager</b> Hanadi om du känner till fler pdfs-filer som ska indexeras. <a href="mailto:hanadi.alsalman.data24sto@edu.tucsweden.se">hanadi.alsalman.data24sto@edu.tucsweden.se</a>.</p>
          <label for="meta-select">Sök på:</label>
          <select id="meta-select" name="pdf-meta-field">
            <option value="title">Titel</option>
            <option value="author">Författare</option>
            <option value="creator">Skapare</option>
            <option value="keywords">Nyckelord</option>
            <option value="subject">Ämne</option>
            <option value="description">Beskrivning</option>
            <option value="text">Text</option>
          </select>
          <input name="pdf-search" type="text" placeholder="Sök bland PDF-filer" />
          <section class="pdf-search-result"></section>
        `;
}


// Listen to key up events in the pdf-search input field
document.body.addEventListener('keyup', event => {
  let inputField = event.target.closest('input[name="pdf-search"]');
  if (!inputField) { return; }
  pdfSearch();
});

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


// pdf search (called on key up in search field and on changes to the select/dropdown)
async function pdfSearch() {
  let inputField = document.querySelector('input[name="pdf-search"]');
  let value = inputField.value.trim();
  // if empty input field do not search just empty search results
  // if(!inputField.value){
  if (value === '') {
    document.querySelector('.pdf-search-result').innerHTML = '';
    return;
  }
  // get the chosen field to search for in the metadata
  let field = document.querySelector(
    'select[name="pdf-meta-field"]'
  ).value;
  // ask the rest-api (correct rest route) for search results
  try {
        let res = await fetch(`/api/pdf-search/${field}/${value}`);
        if (!res.ok) throw new Error('Fel vid hämtning av data');
        let result = await res.json();

  let html = '';
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

        document.querySelector('.pdf-search-result').innerHTML = html;
      } catch (err) {
        document.querySelector('.pdf-search-result').innerHTML = `<p class="error">${err.message}</p>`;
      }
    }

