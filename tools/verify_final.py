import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

ag = [s for s in songs if s.get('primaryCategory') == 'agomoni']
with open('tools/final_agomoni_check.txt', 'w', encoding='utf-8') as out:
    for i, s in enumerate(ag):
        out.write(f"[{i+1}] {s.get('id')} | {s.get('title')} | {s.get('bengaliTitle')} | {s.get('singers')} | {s.get('decade')}\n")

print(f"Wrote {len(ag)} songs to tools/final_agomoni_check.txt")
