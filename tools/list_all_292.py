import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

ag = [s for s in songs if s.get('primaryCategory') == 'agomoni']

with open('tools/all_292_output.txt', 'w', encoding='utf-8') as out:
    for i, s in enumerate(ag):
        sid = s.get('id', '')
        title = s.get('title', '')
        bn = s.get('bengaliTitle', '')
        singers = ', '.join(s.get('singers', []))
        decade = s.get('decade', '')
        album = s.get('album', '')
        year = str(s.get('year', ''))
        out.write(f"[{i+1}] {sid} | {title} | {bn} | {singers} | {decade} | {year} | {album}\n")

print(f"Wrote {len(ag)} to tools/all_292_output.txt")
