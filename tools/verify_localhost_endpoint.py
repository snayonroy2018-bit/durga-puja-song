import urllib.request
import json

songs_url = 'http://localhost:8080/data/songs.json'
with urllib.request.urlopen(songs_url) as res:
    songs = json.loads(res.read().decode('utf-8'))

agomoni_songs = [s for s in songs if s.get('primaryCategory') == 'agomoni']
print('Songs served by localhost with primaryCategory == agomoni:', len(agomoni_songs))

disallowed = [
    'mahalaya', 'মহালয়া', 'birendra krishna', 'বীরেন্দ্রকৃষ্ণ', 'chandipath',
    'alor benu', 'আলোর বেণু', 'dj ', 'remix', 'lofi', 'slowed',
    'nikhita gandhi', 'sunidhi chauhan', 'arijit singh', 'monali thakur', 'challenge 2'
]
violating = []
for s in agomoni_songs:
    singers_str = ' '.join(s.get('singers', []))
    txt = f"{s.get('title','')} {s.get('bengaliTitle','')} {singers_str}".lower()
    for d in disallowed:
        if d in txt:
            violating.append((s['id'], s['title'], d))

print('Violating songs in agomoni:', len(violating))
if violating:
    print('Violations:', violating)
else:
    print('SUCCESS: All songs in Agomoni category are strictly authentic Agomoni songs!')
