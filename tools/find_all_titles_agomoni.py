import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

found = []
for s in songs:
    t = f"{s.get('title','')} {s.get('bengaliTitle','')}".lower()
    if any(k in t for k in ['agomoni', 'agamani', 'আগমনী', 'আগমন']):
        found.append(s)

with open('tools/all_agomoni_titles.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total songs found with agomoni in title: {len(found)}\n")
    for s in found:
        out.write(f"{s.get('id')} | {s.get('primaryCategory')} | {s.get('title')} | {s.get('bengaliTitle')} | {s.get('singers')}\n")

print(f"Total songs found: {len(found)}")
