
import { Candidate, Language } from './types';

export const CONSTITUENCIES = [
  "Karnataka - Bangalore North",
  "Karnataka - Bangalore South",
  "Karnataka - Hassan Holenarasipura",
  "Karnataka - Mysore",
  "Karnataka - Tumkur Turuvekere",
  "Maharashtra - Mumbai North",
  "Maharashtra - Mumbai South",
  "Maharashtra - Pune",
  "Delhi - New Delhi",
  "Delhi - East Delhi",
  "Tamil Nadu - Chennai Central",
  "Uttar Pradesh - Lucknow",
  "Uttar Pradesh - Varanasi",
  "West Bengal - Kolkata North",
  "Gujarat - Ahmedabad West",
  "Telangana - Hyderabad"
];

export const CANDIDATES: Candidate[] = [
  {
    id: 'bjp',
    name: 'Bharatiya Janata Party',
    party: 'BJP',
    symbol: '🪷',
    color: 'bg-orange-500',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Bharatiya_Janata_Party_logo.svg',
    description: 'Development, Nationalism, and Global Presence.'
  },
  {
    id: 'inc',
    name: 'Indian National Congress',
    party: 'INC',
    symbol: '✋',
    color: 'bg-blue-600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/INC_Logo.png',
    description: 'Equality, Social Justice, and Inclusive Growth.'
  },
  {
    id: 'jds',
    name: 'Janata Dal (Secular)',
    party: 'JD(S)',
    symbol: '🌾',
    color: 'bg-green-600',
    logo: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Janata_Dal_%28Secular%29_logo.png',
    description: 'Farmers welfare and Regional development.'
  },
  {
    id: 'others',
    name: 'Independent / Others',
    party: 'OTH',
    symbol: '🗳️',
    color: 'bg-slate-500',
    logo: '',
    description: 'Alternative voices and local issues.'
  }
];

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    welcome: "Secure the Future of Democracy",
    login_sub: "Sign in with Chandan to initiate your vote session.",
    email_verify: "Email Verification",
    email_sub: "A secure one-time code has been sent to your registered Gmail.",
    choose_location: "Search Voting Booth",
    location_sub: "Select the constituency where you are currently registered to vote.",
    aadhar_verify: "Aadhar Recognition",
    voter_verify: "Voter ID Recognition",
    face_verify: "AI Biometric Check",
    cast_vote: "Cast Your Vote",
    ledger: "Global Ledger",
    vote_success: "Vote Anchored!",
    verify_btn: "Verify & Proceed",
    logout: "Logout",
    verify_identity: "AI is verifying your identity..."
  },
  hi: {
    welcome: "लोकतंत्र के भविष्य को सुरक्षित करें",
    login_sub: "अपना वोट सत्र शुरू करने के लिए चंदन ऐडी से साइन इन करें।",
    email_verify: "ईमेल सत्यापन",
    email_sub: "आपके पंजीकृत जीमेल पर एक सुरक्षित ओटीपी भेजा गया है।",
    choose_location: "मतदान केंद्र खोजें",
    location_sub: "उस निर्वाचन क्षेत्र का चयन करें जहां आप मतदान करने के लिए पंजीकृत हैं।",
    aadhar_verify: "आधार पहचान",
    voter_verify: "मतदाता पहचान पत्र",
    face_verify: "एआई बायोमेट्रिक जांच",
    cast_vote: "अपना वोट डालें",
    ledger: "वैश्विक खाता",
    vote_success: "वोट दर्ज हो गया!",
    verify_btn: "सत्यापित करें और आगे बढ़ें",
    logout: "लॉगआउट",
    verify_identity: "एआई आपकी पहचान सत्यापित कर रहा है..."
  },
  kn: {
    welcome: "ಪ್ರಜಾಪ್ರಭುತ್ವದ ಭವಿಷ್ಯವನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಿ",
    login_sub: "ನಿಮ್ಮ ಮತದಾನ ಅಧಿವೇಶನವನ್ನು ಪ್ರಾರಂಭಿಸಲು ಚಂದನ್ ಐಡಿಯೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    email_verify: "ಇಮೇಲ್ ಪರಿಶೀಲನೆ",
    email_sub: "ನಿಮ್ಮ ನೋಂದಾಯಿತ ಜಿಮೇಲ್ ಗೆ ಸರಕ್ಷಿತ ಓಟಿಪಿ ಕಳುಹಿಸಲಾಗಿದೆ.",
    choose_location: "ಮತದಾನ ಕೇಂದ್ರವನ್ನು ಹುಡುಕಿ",
    location_sub: "ನೀವು ಮತ ಚಲಾಯಿಸಲು ನೋಂದಾಯಿಸಿದ ಕ್ಷೇತ್ರವನ್ನು ಆರಿಸಿ.",
    aadhar_verify: "ಆಧಾರ್ ಗುರುತಿಸುವಿಕೆ",
    voter_verify: "ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ",
    face_verify: "AI ಬಯೋಮೆಟ್ರಿಕ್ ತಪಾಸಣೆ",
    cast_vote: "ನಿಮ್ಮ ಮತ ಚಲಾಯಿಸಿ",
    ledger: "ಜಾಗತಿಕ ಲೆಡ್ಜರ್",
    vote_success: "ಮತ ದಾಖಲಾಗಿದೆ!",
    verify_btn: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ",
    logout: "ನಿರ್ಗಮಿಸಿ",
    verify_identity: "AI ನಿಮ್ಮ ಗುರುತನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದೆ..."
  }
};
