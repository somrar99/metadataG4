// Import the file system module
import fs from 'fs';
// Import exifr to handle metadata extraction from JPG
import exifr from 'exifr';
// Import express - that will help us create a web server
import express from 'express';

// Path to jpg folder
let pathToJpgs = './frontend/photos';

// Create a web server, store in the variable app
let app = express();

// Create a REST route for getting the metadata
app.get('/api/metadata', async (_request, response) => {

  // Read all files in photos
  let files = fs
    .readdirSync(pathToJpgs)
    // Only keep files that ends with .jpg or .jpeg
    .filter(x => x.toLowerCase().endsWith('.jpg') || x.toLowerCase().endsWith('.jpeg'));

  // Create a new array for metadata
  let metadataList = [];

  // Loop through the files
  for (let file of files) {
    try {
      // Get the metadata
      let metadata = await exifr.parse(pathToJpgs + '/' + file);

      // Sometimes exifr returns undefined if no EXIF exists
      if (!metadata) metadata = {};

      // Add the filename and the metadata to our metadata list
      metadataList.push({ file, ...metadata });
    } catch (err) {
      console.error(`Could not read metadata from ${file}:`, err.message);
    }
  }

  // Serialize the data to JSON
  let json = JSON.stringify(metadataList, null, 2);

  // Save the json as a file
  fs.writeFileSync('./jpg-metadata.json', json, 'utf-8');

  // Send the metadata as a response to the request (to our web browser)
  response.json(metadataList);

});

// Serve all files in the frontend folder
app.use(express.static('frontend'));

// Start the webserver on port 3000
app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000/api/metadata');
});
