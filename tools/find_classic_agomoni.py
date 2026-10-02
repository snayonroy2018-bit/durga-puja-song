import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

classic_agomoni = []
for s in songs:
    txt = f"{s.get('title','')} {s.get('bengaliTitle','')} {' '.join(s.get('tags',[]))}".lower()
    singers = ' '.join(s.get('singers',[])).lower()
    dec = s.get('decade','')
    kws = ['agomoni', 'agamani', 'আগমনী', 'গিরিরাজ', 'গিরিবর', 'মেনকা', 'উমা', 'uma', 'হর', 'হর-গৌরী', 'হরের ঘরে', 'আশ্বিনে', 'শারদপ্রাতে', 'শারদে', 'শিউলি', 'shiuli', 'kaash', 'কাশফুল', 'রামকুমার', 'অমর পাল', 'পান্নালাল', 'ধানঞ্জয়', 'মহিষাসুর']
    if any(k in txt or k in singers for k in kws):
        classic_agomoni.append(s)

with open('tools/classic_agomoni_candidates.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total found: {len(classic_agomoni)}\n")
    for s in classic_agomoni:
        out.write(f"{s.get('id')} | {s.get('primaryCategory')} | {s.get('title')} | {s.get('bengaliTitle')} | {s.get('singers')} | {s.get('decade')} | {s.get('year')}\n")

print(f"Total found: {len(classic_agomoni)}")
