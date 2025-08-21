import fs from 'fs';

// Import pdf-parse-fork so we can read metadata from pdf files
import pdfParse from 'pdf-parse-fork';

// Get metadata from a pdf file
let data = await pdfParse(fs.readFileSync('./frontend/dm23-pdfs/2A2C2V4WI5YRDJHR26XUD4IAULIYGTMA.pdf'));

console.log(data);