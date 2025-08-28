/*
// Grab the input field firstName
let inputField = document.querySelector('input[name="firstName"]');
// Listen to when the user types a character in the field
inputField.addEventListener('keyup', async () => {
  // Read the value of the input field
  let searchValue = inputField.value;
  // Grab the main element
  let main = document.querySelector('main');
  // If the value is empty do not try to search
  // but empty the main element
  if (searchValue === '') {
    main.innerHTML = '';
    return;
  }
  // Ask the database to search for users via a REST-api route
  let rawData = await fetch('/api/search-by-firstname/' + searchValue);
  // Convert rawData from json to a js data structure
  let data = await rawData.json();

  // Convert the data to html
  let html = '';
  for (let { id, firstName, lastName, email } of data) {
    html += `
      <article>
        <h2>${firstName} ${lastName}</h2>
        <p><b>Email:</b> ${email}</p>
        <p><b>Id:</b> ${id}</p>
      </article>
    `;
  }
  // Replace the content of the main element with
  // our new html (the data converted from json)
  main.innerHTML = html;
});
*/

// Click on menu link
document.body.addEventListener('click', event => {
  let navLink = event.target.closest('header nav a');
  if (!navLink) { return; }
  // don't try to follow the link in the a tag
  event.preventDefault();
  // read the text in the link
  let linkText = navLink.textContent;
  // show correct content depending on menu choice
  showContent(linkText);
});

// Function to show page content
function showContent(label) {
  let content;
  if (label === 'Start') {
    content = `
      <h1>Start</h1>
      <p>Välkommen till våra sökmotor för metadata.</p>
      <p>Vi hjälper dig att hitta exakt det du letar efter genom att söka i metadata från foton, PDF-dokument, PowerPoint-presentationer och MP3-musik.
      Börja din sökning idag och upptäck kraften i att navigera i metadata..</p>
      <p>Vi har börjat med pdfs-filer och nuvarande import gjorde 2025-08-27.</p>
      <p>Kontakta din vänliga <b>data manager</b> Hanadi om du känner till fler pdfs-filer som ska indexeras. <a href="mailto:hanadi.alsalman.data24sto@edu.tucsweden.se">hanadi.alsalman.data24sto@edu.tucsweden.se</a>.</p>
    `;
  }
  else if (label === 'Sök pdf') {
    content = `
      <h1>Sök pdf</h1>
      <label>
        Sök på: <select name="pdf-meta-field">
          <option value="author">Författare</option>
          <option value="title">Titel</option>
          <option value="creator">Skapare</option>
          <option value="keywords">Nyckelord</option>
          <option value="description">Beskrivning</option>
        </select>
      </label>
      <label>
        <input name="pdf-search" type="text" placeholder="Sök bland pdf-filer">
      </label>
      <section class="pdf-search-result"></section>
    `;
  }
  document.querySelector('main').innerHTML = content;
}

// When the page loads
showContent('Start');

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
  let rawResponse = await fetch('/api/pdf-all-meta/' + id);
  let result = await rawResponse.json();
  // create a pre element
  let pre = document.createElement('pre');
  pre.innerHTML = JSON.stringify(result, null, '  ');
  // add the newly created pre element after the button
  button.after(pre);
});


// pdf search (called on key up in search field and on changes to the select/dropdown)
async function pdfSearch() {
  let inputField = document.querySelector('input[name="pdf-search"]');
  // if empty input field do not search just empty search results
  // if(!inputField.value){
  if (inputField.value === '') {
    document.querySelector('.pdf-search-result').innerHTML = '';
    return;
  }
  // get the chosen field to search for in the meta data
  let field = document.querySelector(
    'select[name="pdf-meta-field"]'
  ).value;
  // ask the rest-api (correct rest route) for search results
  let rawResponse = await fetch(
    `/api/music-search/${field}/${inputField.value}`
  );
  // unpack search results from json
  let result = await rawResponse.json();
  let resultAsHtml = '';
  for (let { id, fileName, title, author, creator, keywords,description  } of result) {
    resultAsHtml += `
      <article>
        <h3>${author || 'Okänd författare'}</h3>
        <h2>${title || 'Okänd titel'}</h2>
        <p><b>Från skapare:</b> ${creator || 'Okänt skapare'}</p>
        <p><b>keywords:</b> ${keywords || 'Okänd nyckelord'}</p>
        <p><b>beskrivning:</b> ${description || 'Okänd beskrivning'}</p>
        <audio controls src="/pdfs/${fileName}"></audio>
        <p><a href="/pdfs/${fileName}" download>Ladda ned filen</a></p>
        <p><button class="btn-show-all-pdf-metadata" data-id="${id}">Visa all metadata</button></p>
      </article>
    `;
  }
  // replace content in the .pdf-search-result element (a section tag)
  document.querySelector('.pdf-search-result').innerHTML = resultAsHtml;
}

