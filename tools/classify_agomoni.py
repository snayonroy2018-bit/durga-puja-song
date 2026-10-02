import json
import re

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

agomoni_songs = [s for s in songs if s.get('primaryCategory') == 'agomoni']

def is_mahalaya(s):
    text = f"{s.get('title', '')} {s.get('bengaliTitle', '')} {' '.join(s.get('tags', []))} {s.get('album', '')}".lower()
    singers = ' '.join(s.get('singers', [])).lower()
    
    # Birendra Krishna Bhadra is always Mahalaya
    if 'birendra krishna' in singers or 'বীরেন্দ্রকৃষ্ণ' in singers:
        return True
    
    # Specific Mahalaya and Chandi Path indicators
    mahalaya_patterns = [
        'mahalaya', 'মহালয়া', 'mahisasur', 'mahishasur', 'মহিষাসুর',
        'chandipath', 'চণ্ডীপাঠ',
        'alor benu', 'aalor benu', 'আলোর বেণু', 'আলোর বেনু',
        'aham rudre', 'ahang rudre', 'rudrebhir',
        'madhukaitava', 'rupang dehi', 'dashapraharana',
        'narayani namastute', 'shubhra sankha', 'namo chandi',
        'ya devi sarbabhuteshu', 'yaa devi sarvabhuteshu', 'ইয়া দেবী সর্বভূতেষু',
        'adyastab', 'durgastab', 'durgastav', 'bhabani dayani',
        'tribhubono monoharini', 'mrinmoyee rupi',
        'jago durga'
    ]
    for p in mahalaya_patterns:
        if p in text:
            return True
    return False

def is_agomoni(s):
    # If it's Mahalaya, it's not Agomoni
    if is_mahalaya(s):
        return False
    
    title = s.get('title', '').strip()
    bn = s.get('bengaliTitle', '').strip()
    text = f"{title} {bn}".lower()
    
    # Explicit exclusions from agomoni:
    # DJ, Lofi, Modern pop compilations, Hindi/Bollywood, Wedding, Movie songs
    exclusions = [
        'dj ', 'dj', 'remix', 'lofi', 'slowed', 'reverb',
        'nikhita gandhi', 'sunidhi chauhan', 'arijit singh', 'rupankar bagchi',
        'challenge 2', 'shei bochhorer shera gaan', 'sei bochhorer shera gaan',
        'বিয়ের গান', 'biye', 'palki te bou', 'mon churi chara', 'gold printer sari',
        'duranta ghurnir', 'ami dur hote', 'na mon lage na', 'priyotamo ki',
        'ghum ghum chand', 'mayaboti meghe', 'chokhe naame brishti', 'kedona maninee',
        'shyama sangeet', 'শ্যামা সঙ্গীত', 'kali bole', 'loknath baba', 'krishna bhajan',
        'vishnu sahasranamam', 'rabindra sangeet', 'রবীন্দ্রসংগীত', 'tagore songs',
        'dugga elo', 'aamaar dugga', 'baddi dhaker', 'pancha pradipe dhupe',
        'taar churite', 'naam harano kono', 'prothom belar', 'jadi jante'
    ]
    for ex in exclusions:
        if ex in text or ex in ' '.join(s.get('singers', [])).lower():
            return False
            
    # Positive Agomoni indicators:
    # 1. Contains Agomoni / Agamani / আগমনী / আগমন
    if any(k in text for k in ['agomoni', 'agamani', 'আগমনী', 'আগমন', 'aagomon']):
        # Ensure it's not a generic album that just tagged agomoni
        return True
        
    # 2. Traditional Uma / Gouri welcoming songs
    agomoni_themes = [
        'ailo uma barite', 'আইলো উমা বাড়িতে',
        'gouri elo re', 'গৌরী এলো রে',
        'amar uma', 'আমার উমা',
        'uma ashe notun saje',
        'kemon kore horer ghare',
        'ma go chinmoyee', 'মা গো চিন্ময়ী',
        'maa go tui', 'মা গো তুই',
        'shiuly talai', 'শিউলিতলায়',
        'sharod sokale', 'শারদ সকালে',
        'durge durge durgatinashini',
        'elo maa dugga', 'এলো মা দুগ্গা'
    ]
    for th in agomoni_themes:
        if th in text:
            return True
            
    return False

# Test classification on the 292 songs
pure_agomoni = []
mahalaya_list = []
other_list = []

for s in agomoni_songs:
    if is_mahalaya(s):
        mahalaya_list.append(s)
    elif is_agomoni(s):
        pure_agomoni.append(s)
    else:
        other_list.append(s)

print(f"Total Agomoni songs tested: {len(agomoni_songs)}")
print(f"Pure Agomoni count: {len(pure_agomoni)}")
print(f"Mahalaya count: {len(mahalaya_list)}")
print(f"Other (Modern / Pop / Classics / Shyama) count: {len(other_list)}")
