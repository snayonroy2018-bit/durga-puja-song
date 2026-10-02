import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

with open('tools/other_agomoni.txt', 'w', encoding='utf-8') as out:
    for s in songs:
        cat = s.get('primaryCategory', '')
        if cat != 'agomoni':
            tags_str = ' '.join(s.get('tags', []))
            text = f"{s.get('title', '')} {s.get('bengaliTitle', '')} {tags_str}".lower()
            if any(k in text for k in ['agomoni', 'agamani', 'আগমনী', 'আগমন', 'uma', 'উমা']):
                out.write(f"{s.get('id')} | {cat} | {s.get('title')} | {s.get('bengaliTitle')} | {s.get('singers')}\n")

print("Done scanning other songs")
