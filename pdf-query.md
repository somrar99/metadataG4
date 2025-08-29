## Hämta vanliga metadata från pdfs
```
SELECT
  fileName,
  metadata->>'$.info.Title' AS title,
  metadata->>'$.info.Author' AS author,
  metadata->>'$.info.Creator' AS creator,
  metadata->>'$.xmp.keywords' AS keywords,
  metadata->>'$.xmp.description' AS description,
  metadata->>'$.file' AS originalFileName
FROM pdfs
WHERE LOWER(metadata->>'$.info.Title') LIKE LOWER('%profile%');
```

## COALESCE(a, b) returnerar det första icke-null värdet mellan a och b

```
SELECT
  fileName,
  COALESCE(
    metadata->>'$.info.Title',
    metadata->>'$.xmp.title'
  ) AS title,
  metadata->>'$.info.Author'  AS author,
  metadata->>'$.info.Creator' AS creator,
  metadata->>'$.xmp.keywords' AS keywords,
  metadata->>'$.xmp.description' AS description,
  metadata->>'$.file' AS originalFileName
FROM pdfs
ORDER BY title;
```
