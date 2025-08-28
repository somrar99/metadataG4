document.body.addEventListener('click', event => {
  let navLink = event.target.closest('header a');
  if (!navLink) { return; }
  // don't try to follow the link in the a tag
  event.preventDefault();
  // read the text in the link 
  let linkText = navLink.textContent;
  // read the value of href
  let href = navLink.getAttribute('href');
  // change the content in main
  // here we could have logic that replaces the content
  // by calling other functions that creates content
  // so this is just a small proof of concept
  // that we change content
  document.querySelector('main').innerHTML = `
    <h2>${linkText}</h2>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Labore itaque ipsa blanditiis iure adipisci minima neque
    reiciendis, cum voluptates doloribus suscipit repellendus? Perspiciatis, mollitia et ducimus in fuga similique
    voluptas.</p>
  `;
});