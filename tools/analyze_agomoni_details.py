import json
import re

with open('data/songs.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

agomoni_songs = [s for s in songs if s.get('primaryCategory') == 'agomoni']

print(f"Total songs currently in agomoni: {len(agomoni_songs)}")

# Criteria for Mahalaya:
mahalaya_keywords = [
    'mahalaya', 'মহালয়া', 'mahisasur', 'mahishasur', 'মহিষাসুর',
    'birendra krishna', 'বীরেন্দ্রকৃষ্ণ', 'chandipath', 'চণ্ডীপাঠ',
    'alor benu', 'aalor benu', 'আলোর বেণু', 'আলোর বেনু',
    'aham rudre', 'ahang rudre', 'rudrebhir',
    'madhukaitava', 'rupang dehi', 'jago durga dashapraharana',
    'dashapraharanadharinee', 'shubhra sankha', 'namo chandi',
    'ya devi sarbabhuteshu', 'yaa devi sarvabhuteshu', 'ইয়া দেবী সর্বভূতেষু',
    'adyastab', 'durgastab', 'durgastav'
]

# Criteria for Non-Agomoni / Modern / Generic / Film / Pop:
# Let's inspect each song individually and see what it actually is!
