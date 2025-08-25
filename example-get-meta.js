// import file system module
// - used to read file names from the music folder
import fs from 'fs';
// import the musicMetadata
// npm module - used to read metadata from music files
import musicMetadata from 'music-metadata';

// read all file names from the music fodler
const files = await fs.readdirSync('music');

// loop through all music files and read metadata
for (let file of files) {
  let metadata = await musicMetadata.parseFile('./music/' + file);
  console.log('');
  console.log(file);
  console.log(metadata);
  // thought: do we need all metadata?
  // metadata.format and metadata.common might
  // be enough info to store in database?

  // how do we store all the filenames + corresponding
  // metadata in the database?
}