// extract-jpg-metadata.js
// Detta skript läser alla JPEG-filer från mappen `frontend/photos`,
// hämtar EXIF-metadata via exifr och sparar resultatet i `jpg-metadata.json`.
// Varje rad innehåller fileName + en praktisk url + all EXIF-metadata.

import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';

async function extractMetadata() {
  const photosDir = path.join(process.cwd(), 'frontend', 'photos');
  const entries = await fs.readdir(photosDir);
  const jpgFiles = entries.filter((name) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg');
  });

  const metadataList = [];

  for (const file of jpgFiles) {
    try {
      const filePath = path.join(photosDir, file);
      let metadata = await exifr.parse(filePath);
      if (!metadata) metadata = {};

      metadataList.push({
        fileName: file,         // fält som back-/frontend använder
        file: file,             // alias om någon kod förväntar sig `file`
        url: `/photos/${file}`, // praktiskt för <img src=...>
        ...metadata             // ← FIX: sprid ut all metadata (tidigare stod felaktigt .metadata)
      });
    } catch (error) {
      console.error(`Kunde inte läsa metadata från ${file}:`, error.message);
    }
  }

  const outputPath = path.join(process.cwd(), 'jpg-metadata.json');
  await fs.writeFile(outputPath, JSON.stringify(metadataList, null, 2), 'utf-8');
  console.log(`✅ Sparade ${metadataList.length} metadata-poster till jpg-metadata.json`);
}

extractMetadata().catch((err) => {
  console.error('❌ Ett fel inträffade:', err);
});
