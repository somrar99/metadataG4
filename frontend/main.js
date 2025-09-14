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


import { startPageContent } from './start-page.js';
import { pdfSearchPageContent } from './pdf-search.js';
import { musicSearchPageContent } from './music-search.js';
import { jpgSearchPageContent } from './jpg-search.js';
import { jpgGeoSearchPageContent } from './jpg-geo-search.js';
//import { pptSearchPageContent } from './ppt-search.js';
import { omOssPageContent } from './om-oss-page.js';

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
    content = startPageContent();
  }
  else if (label === 'Sök PDF') {
    content = pdfSearchPageContent();
  }
  else if (label === 'Sök Musik') {
    content = musicSearchPageContent();
  }
  else if (label === 'Sök Photo') {
    content = jpgSearchPageContent();
  }
  else if (label === 'Sök Geo') {
    content = jpgGeoSearchPageContent();
  }
  else if (label === 'Sök Power point') {
    content = pptSearchPageContent();
  }
  else if (label === 'Om oss') {
    content = omOssPageContent();
  }
  document.querySelector('main').innerHTML = content;
}

// When the page loads
showContent('Start');
