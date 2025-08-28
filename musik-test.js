import { parseFile } from "music-metadata";
import fs from "fs";

async function readMusicMetadata() {
  try {
    // Parse metadata from a music file
    const metadata = await parseFile("/Users/anmolwakas/Desktop/metadataG4-1/frontend/music");

    console.log(metadata);
  } catch (err) {
    console.error("Error reading metadata:", err);
  }
}

readMusicMetadata();
