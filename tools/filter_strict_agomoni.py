import json

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

# Rule for genuine Agomoni:
# Must be specifically an Agomoni / Uma welcoming song.
# Exclude: Mahalaya, DJ remix, Lofi, pop/party songs, movie songs.

def is_strictly_agomoni(s):
    title = s.get('title', '').strip()
    bn = s.get('bengaliTitle', '').strip()
    singers = ' '.join(s.get('singers', [])).lower()
    text = f"{title} {bn}".lower()
    
    # Exclude Mahalaya
    if any(k in text or k in singers for k in [
        'birendra krishna', 'বীরেন্দ্রকৃষ্ণ', 'mahalaya', 'মহালয়া',
        'mahisasur', 'mahishasur', 'মহিষাসুর', 'chandipath', 'চণ্ডীপাঠ',
        'alor benu', 'aalor benu', 'আলোর বেণু', 'আলোর বেনু',
        'aham rudre', 'ahang rudre', 'rudrebhir', 'madhukaitava',
        'rupang dehi', 'dashapraharana', 'narayani namastute',
        'ya devi', 'yaa devi', 'durgastab', 'durgastav', 'adyastab',
        'stotra', 'bhabani dayani', 'jago durga'
    ]):
        return False
        
    # Exclude DJ, Lofi, Pop, Film
    if any(k in text or k in singers for k in [
        'dj ', 'dj', 'remix', 'lofi', 'slowed', 'reverb',
        'challenge 2', 'nikhita gandhi', 'sunidhi chauhan',
        'arijit singh', 'rupankar bagchi', 'monali thakur'
    ]):
        return False
        
    # Positive inclusion:
    # 1. Agomoni / Agamani / আগমনী / আগমন
    if any(k in text for k in ['agomoni', 'agamani', 'আগমনী', 'আগমন', 'aagomon']):
        # If it's pure Agomoni:
        return True
        
    # 2. Traditional Uma / Gouri arrival songs:
    uma_arrival = [
        'ailo uma barite', 'আইলো উমা বাড়িতে',
        'gouri elo re', 'গৌরী এলো রে',
        'amar uma', 'আমার উমা',
        'kemon kore horer ghare',
        'durgaar agomoni',
        'mayer agomoni',
        'elo maa dugga', 'এলো মা দুগ্গা',
        'maa go tui',
        'ma go chinmoyee', 'মা গো চিন্ময়ী',
        'shiuly talai sharod alor'
    ]
    if any(k in text for k in uma_arrival):
        return True
        
    return False

strict_agomoni = [s for s in songs if is_strictly_agomoni(s)]

with open('tools/strict_agomoni_list.txt', 'w', encoding='utf-8') as out:
    out.write(f"Total strictly agomoni songs: {len(strict_agomoni)}\n\n")
    for i, s in enumerate(strict_agomoni):
        out.write(f"[{i+1}] id={s.get('id')} | title={s.get('title')} | bn={s.get('bengaliTitle')} | singers={s.get('singers')} | decade={s.get('decade')}\n")

print(f"Total strictly agomoni songs: {len(strict_agomoni)}")
