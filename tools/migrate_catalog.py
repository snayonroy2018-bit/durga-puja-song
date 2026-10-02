import json
import shutil
import os

PURE_AGOMONI_IDS = {
    'dps_000001', 'dps_000002', 'dps_000003', 'dps_000007', 'dps_000008',
    'dps_000010', 'dps_000013', 'dps_000014', 'dps_000017', 'dps_000018',
    'dps_000019', 'dps_000020', 'dps_000021', 'dps_000029', 'dps_000032',
    'dps_000035', 'dps_000038', 'dps_000039', 'dps_000040', 'dps_000042',
    'dps_000043', 'dps_000044', 'dps_000048', 'dps_000049', 'dps_000051',
    'dps_000054', 'dps_000056', 'dps_000069', 'dps_000072', 'dps_000101',
    'dps_000163', 'dps_000172', 'dps_000182', 'dps_000184', 'dps_000187',
    'dps_000191', 'dps_000197', 'dps_000202', 'dps_000274', 'dps_000276',
    'dps_000336', 'dps_001616', 'dps_001619', 'dps_001943', 'dps_001952',
    'dps_002326'
}

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

def migrate():
    # Make backup first
    if not os.path.exists('data/songs.json.bak'):
        shutil.copyfile('data/songs.json', 'data/songs.json.bak')
        print("Created backup at data/songs.json.bak")
        
    with open('data/songs.json', 'r', encoding='utf-8') as f:
        songs = json.load(f)
        
    reassigned_count = 0
    agomoni_count = 0
    
    for s in songs:
        sid = s.get('id')
        old_cat = s.get('primaryCategory')
        
        if sid in PURE_AGOMONI_IDS:
            s['primaryCategory'] = 'agomoni'
            tags = s.get('tags', [])
            if 'agomoni' not in tags:
                tags.append('agomoni')
            s['tags'] = tags
            agomoni_count += 1
            if old_cat != 'agomoni':
                print(f"Moved {sid} from {old_cat} -> agomoni ({s.get('title')})")
                reassigned_count += 1
        elif old_cat == 'agomoni':
            new_cat = determine_new_category(s)
            s['primaryCategory'] = new_cat
            # Update tags: remove 'agomoni' and add new_cat
            tags = [t for t in s.get('tags', []) if t != 'agomoni']
            if new_cat not in tags:
                tags.append(new_cat)
            s['tags'] = tags
            reassigned_count += 1
            
    print(f"\nMigration complete:")
    print(f"Total pure Agomoni songs: {agomoni_count}")
    print(f"Total songs reassigned: {reassigned_count}")
    
    # Save to data/songs.json
    with open('data/songs.json', 'w', encoding='utf-8') as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    print("Saved updated data/songs.json")
    
    # Also save to durga-puja-song/data/songs.json if directory exists
    if os.path.exists('durga-puja-song/data'):
        with open('durga-puja-song/data/songs.json', 'w', encoding='utf-8') as f:
            json.dump(songs, f, ensure_ascii=False, indent=2)
        print("Saved updated durga-puja-song/data/songs.json")

if __name__ == '__main__':
    migrate()
