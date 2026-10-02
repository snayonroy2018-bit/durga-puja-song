import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

agomoni = [s for s in songs if s.get('primaryCategory') == 'agomoni']

with open('tools/scratch_agomoni.txt', 'w', encoding='utf-8') as out:
    for i, s in enumerate(agomoni):
        out.write(f"{i+1}. id={s.get('id')} | title={s.get('title')} | bn={s.get('bengaliTitle')} | singers={s.get('singers')} | decade={s.get('decade')} | year={s.get('year')} | tags={s.get('tags')}\n")

print(f"Wrote {len(agomoni)} songs to tools/scratch_agomoni.txt")
