import fs from 'fs';
import exifr from 'exifr';

// Читаем JPG и достаём метаданные
let metadata = await exifr.parse(
  fs.readFileSync('./frontend/photos/DSC00042.JPG')
);

console.log(metadata);
