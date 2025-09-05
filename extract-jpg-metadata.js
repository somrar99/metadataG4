// extract-jpg-metadata.js
// This script reads all JPEG files from the `frontend/photos` directory,
// extracts their EXIF metadata using the exifr library and writes the
// result to `jpg-metadata.json`. Each JSON entry includes the file name
// in the `fileName` property, so a separate fileName column in the
// database is unnecessary.

import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';

async function extractMetadata() {
  // Build the absolute path to the directory containing the photos.
  // Adjust the directory if your images are stored elsewhere.
  const photosDir = path.join(process.cwd(), 'frontend', 'photos');

  // Read all entries in the photos directory.
  const entries = await fs.readdir(photosDir);

  // Filter for JPEG images (.jpg or .jpeg, case-insensitive).
  const jpgFiles = entries.filter((name) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg');
  });

  // Prepare an array to hold metadata objects.
  const metadataList = [];

  // Loop through each JPEG file and extract its metadata.
  for (const file of jpgFiles) {
    try {
      const filePath = path.join(photosDir, file);
      let metadata = await exifr.parse(filePath);

      // If no metadata is found, use an empty object.
      if (!metadata) {
        metadata = {};
      }

      // Push an object containing the file name and all metadata
      // properties onto the list. Including the file name here
      // means you don't need a separate database column for it.
      metadataList.push({
        fileName: file,
        ...metadata,
      });
    } catch (error) {
      console.error(`Failed to read metadata from ${file}:`, error.message);
    }
  }

  // Serialize the metadata list with indentation for readability.
  const jsonString = JSON.stringify(metadataList, null, 2);

  // Write the JSON string to jpg-metadata.json in the project root.
  const outputPath = path.join(process.cwd(), 'jpg-metadata.json');
  await fs.writeFile(outputPath, jsonString, 'utf-8');

  console.log(
    `Saved ${metadataList.length} metadata entries to jpg-metadata.json`
  );
}

// Execute the extraction. Any unhandled errors will be logged.
extractMetadata().catch((err) => {
  console.error(err);
});
