import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

print(f"Total catalog songs: {len(songs)}")

# Set of IDs that are confirmed pure Agomoni:
PURE_AGOMONI_IDS = {
    'dps_000001', 'dps_000002', 'dps_000003', 'dps_000007', 'dps_000008',
    'dps_000010', 'dps_000013', 'dps_000014', 'dps_000017', 'dps_000018',
    'dps_000019', 'dps_000020', 'dps_000021', 'dps_000029', 'dps_000032',
    'dps_000035', 'dps_000038', 'dps_000039', 'dps_000040', 'dps_000042',
    'dps_000043', 'dps_000044', 'dps_000048', 'dps_000049', 'dps_000051',
    'dps_000054', 'dps_000056', 'dps_000067', 'dps_000072', 'dps_000101',
    'dps_000161', 'dps_000163', 'dps_000170', 'dps_000172', 'dps_000180',
    'dps_000181', 'dps_000182', 'dps_000183', 'dps_000184', 'dps_000187',
    'dps_000189', 'dps_000191', 'dps_000197', 'dps_000200', 'dps_000202',
    'dps_000274', 'dps_000276', 'dps_000336', 'dps_001616', 'dps_001619',
    'dps_001943', 'dps_001952', 'dps_002326'
}

all_pure = [s for s in songs if s.get('id') in PURE_AGOMONI_IDS]
with open('tools/verified_pure_agomoni.txt', 'w', encoding='utf-8') as out:
    for i, s in enumerate(all_pure):
        out.write(f"[{i+1}] {s.get('id')} | {s.get('title')} | {s.get('bengaliTitle')} | {s.get('singers')} | {s.get('decade')}\n")

print(f"Exported {len(all_pure)} verified pure agomoni songs to tools/verified_pure_agomoni.txt")
