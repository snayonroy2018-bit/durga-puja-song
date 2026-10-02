import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

from classify_agomoni import pure_agomoni, mahalaya_list, other_list

with open('tools/review_pure_agomoni.txt', 'w', encoding='utf-8') as f:
    for i, s in enumerate(pure_agomoni):
        f.write(f"[{i+1}] {s['id']} | {s['title']} | {s['bengaliTitle']} | {s['singers']} | {s['decade']}\n")

with open('tools/review_mahalaya.txt', 'w', encoding='utf-8') as f:
    for i, s in enumerate(mahalaya_list):
        f.write(f"[{i+1}] {s['id']} | {s['title']} | {s['bengaliTitle']} | {s['singers']} | {s['decade']}\n")

with open('tools/review_other.txt', 'w', encoding='utf-8') as f:
    for i, s in enumerate(other_list):
        f.write(f"[{i+1}] {s['id']} | {s['title']} | {s['bengaliTitle']} | {s['singers']} | {s['decade']}\n")

print("Wrote review files")
