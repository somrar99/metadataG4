// Import the file system module
import fs from 'fs';
// Import pdf-parse-fork to handle metadata extraction from PDFs
import pdfParse from 'pdf-parse-fork';
// Import express - that will help us create a web server
import express from 'express';

// Path to pdf folder
let pathToPdfs = './frontend/dm23-pdfs';

// Create a web server, store in the variable app
let app = express();

// Create a REST route for getting the metadata
app.get('/api/metadata', async (_request, response) => {

  // Read all files in dm23-pdfs
  let files = fs
    // Read all files in the folder dm3-pdfs
    .readdirSync(pathToPdfs)
    // Only keep files that ends with .pdf in our list
    .filter(x => x.toLowerCase().endsWith('.pdf'));

  // Create a new array for metadata
  let metadataList = [];


  // Loop through the files
  for (let file of files) {
    // Get the metadata
    let metadata = await pdfParse(fs.readFileSync(pathToPdfs + '/' + file));
    // Simplify the structure of metadataList[0].metadata._metadata.['xmp:someProperty']
    // to metadataList.xmp.someProperty.

    // Rename the metadata._metadata property to xmp
    metadata.xmp = metadata.metadata._metadata;
    delete metadata.metadata;
    // Simplify the names of properties remove xmp: and xmpnn: prefixes
    for (let key in metadata.xmp) {
      let simplifiedKey = key.split(':')[1];
      metadata.xmp[simplifiedKey] = metadata.xmp[key]; // En av en array
      delete metadata.xmp[key];
    }
    // Shorten extracted text (but keep it since the metadata varying quality)
   // .trim() Tar bort mellanslag, radbrytningar eller tabbar i början och slutet av en sträng.
    metadata.text = metadata.text.trim().slice(0, 500);

    // Add the filename and the metadata to our metadata list
    metadataList.push({ file, ...metadata });
  }

  // Serialize the data to JSON
  let json = JSON.stringify(metadataList, null, '  ');

  // Log the list of metadata
  // console.log(json);

  // Save the json as a file
  // (write json to the file metadata.json
  // using character encoding utf-8)
  fs.writeFileSync('./pdf-metadata.json', json, 'utf-8');


  // Send the metadata as a response to the request (to our web browser)
  response.json(metadataList);

});

// Serve all files in the frontend folder
app.use(express.static('frontend'));

// Start the webserver on port 3000
app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000/api/metadata');
});
