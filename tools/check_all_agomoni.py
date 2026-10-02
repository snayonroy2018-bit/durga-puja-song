import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

print(f"Total songs in catalog: {len(songs)}")

# Search for agomoni keywords in title, bengaliTitle, tags, album across all songs
agomoni_candidates = []
for s in songs:
    text = f"{s.get('title', '')} {s.get('bengaliTitle', '')} {' '.join(s.get('tags', []))} {s.get('album', '')}".lower()
    cat = s.get('primaryCategory', '')
    if any(k in text for k in ['agomoni', 'agamani', 'আগমনী', 'আগমন']):
        agomoni_candidates.append(s)

print(f"Total songs with agomoni in text across entire catalog: {len(agomoni_candidates)}")
cats = {}
for s in agomoni_candidates:
    c = s.get('primaryCategory', 'unknown')
    cats[c] = cats.get(c, 0) + 1
print(f"Categories of songs mentioning agomoni: {cats}")
