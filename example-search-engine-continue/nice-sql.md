
### Get a list of all genres

```sql
SELECT DISTINCT SUBSTRING(
    meta->>'$.common.genre',
    3,
    LENGTH(meta->>'$.common.genre') -4
  ) AS genre
FROM musicMeta
WHERE meta->>'$.common.genre' IS NOT NULL
ORDER BY genre
```

-- good as long as we do not have multiple genres
-- because we convert array to string, check if better

### Get common attributes and search by

```sql
SELECT meta->>'$.file' AS fileName,
  meta->>'$.common.title' AS title,
  meta->>'$.common.artist' AS artist,
  meta->>'$.common.album' AS album,
  meta->>'$.common.genre' AS genre
FROM musicMeta
WHERE LOWER(meta->>'$.common.genre') LIKE LOWER("%hip%")
```