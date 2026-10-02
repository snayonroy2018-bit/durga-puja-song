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

# Let's inspect any other songs currently in agomoni to see what category they should be moved to:
# 1. Mahalaya:
MAHALAYA_KEYWORDS = [
    'mahalaya', 'মহালয়া', 'mahisasur', 'mahishasur', 'মহিষাসুর',
    'chandipath', 'চণ্ডীপাঠ', 'alor benu', 'aalor benu', 'আলোর বেণু', 'আলোর বেনু',
    'aham rudre', 'ahang rudre', 'rudrebhir', 'madhukaitava', 'rupang dehi',
    'dashapraharana', 'narayani namastute', 'shubhra sankha', 'namo chandi',
    'ya devi', 'yaa devi', 'দেবী সর্বভূতেষু', 'adyastab', 'durgastab',
    'durgastav', 'bhabani dayani', 'tribhubono monoharini', 'mrinmoyee rupi',
    'jago durga'
]

def determine_new_category(s):
    sid = s.get('id')
    if sid in PURE_AGOMONI_IDS:
        return 'agomoni'
        
    title = s.get('title', '')
    bn = s.get('bengaliTitle', '')
    text = f"{title} {bn} {' '.join(s.get('tags', []))} {s.get('album', '')}".lower()
    singers_str = ' '.join(s.get('singers', [])).lower()
    singers_list = s.get('singers', [])
    decade = s.get('decade', '')
    
    # 1. Mahalaya
    if 'birendra krishna' in singers_str or 'বীরেন্দ্রকৃষ্ণ' in singers_str:
        return 'mahalaya'
    for kw in MAHALAYA_KEYWORDS:
        if kw in text:
            return 'mahalaya'
            
    # 2. Dhaak
    if 'dhak' in text or 'ঢাক' in text:
        return 'dhaak'
        
    # 3. Aarti
    if 'pradip' in text or 'aarti' in text or 'আরতি' in text:
        return 'aarti'
        
    # 4. Shyama Sangeet / Kali / Krishna / Loknath / Stotra -> durga-puja
    if any(k in text for k in ['shyama sangeet', 'শ্যামা সঙ্গীত', 'kali bole', 'loknath', 'কৃষ্ণ', 'krishna', 'vishnu', 'ভক্তি', 'stotra']):
        return 'durga-puja'
    if 'dhananjay bhattacharya' in singers_str or 'pannalal bhattacharjee' in singers_str:
        return 'durga-puja'
        
    # 5. Romantic
    romantic_titles = [
        'taar churite', 'naam harano', 'prothom belar', 'jadi jante', 'o sangi',
        'bandha moner', 'mon bolchhe', 'muhuyay jameche', 'aaro katodin',
        'priyotamo ki', 'evergreen romantic', 'chokhe naame brishti', 'e to bhalobasha',
        'ami dur hote tomarei'
    ]
    for rt in romantic_titles:
        if rt in text:
            return 'romantic'
            
    # 6. Old Classics
    if decade == 'Old Classics' or any(sg in singers_str for sg in ['hemanta', 'lata mangeshkar', 'sandhya', 'arati mukherjee', 'manna dey', 'kishore kumar']):
        # If modern album of them:
        if any(w in text for w in ['remix', 'dj', 'lofi']):
            return 'modern'
        return 'old-classics'
        
    # 7. 90s
    if decade in ['1990s', '90s']:
        return '90s'
        
    # 8. 2000s
    if decade in ['2000s', '00s']:
        return '2000s'
        
    # 9. Modern
    return 'modern'

# Test all current agomoni songs
dest_counts = {}
for s in songs:
    if s.get('primaryCategory') == 'agomoni':
        dest = determine_new_category(s)
        dest_counts[dest] = dest_counts.get(dest, 0) + 1

print("New category distribution for previously agomoni songs:")
for k, v in sorted(dest_counts.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

# Also check other songs in PURE_AGOMONI_IDS
moved_to_agomoni = [s for s in songs if s.get('id') in PURE_AGOMONI_IDS and s.get('primaryCategory') != 'agomoni']
print(f"Songs being moved into agomoni from other categories: {len(moved_to_agomoni)}")
for s in moved_to_agomoni:
    print(f"  {s.get('id')} from {s.get('primaryCategory')} -> {s.get('title')}")
