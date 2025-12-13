
import { Article, EPaperPage, User, Advertisement, AdSize, EmailSettings, SubscriptionSettings, AdSettings, Classified } from './types';

export const CATEGORIES = ['World', 'Business', 'Technology', 'Culture', 'Sports', 'Opinion'];

export const CHIEF_EDITOR_ID = 'admin1';

// A hardcoded Master Key for the Chief Editor to recover account if email access is lost
export const MASTER_RECOVERY_KEY = 'CHIEF-SECURE-2025';

// --- APPWRITE CONFIGURATION ---
export const APPWRITE_CONFIG = {
    PROJECT_ID: '693d22c000236a18097f', 
    ENDPOINT: 'https://cloud.appwrite.io/v1', // Updated to standard Cloud endpoint
    DATABASE_ID: 'cj_news_db', 
    COLLECTION_IDS: {
        ARTICLES: 'articles',
        USERS: 'users',
        EPAPER: 'epaper_pages',
        ADS: 'advertisements',
        CLASSIFIEDS: 'classifieds',
        CLIPPINGS: 'clippings',
        COMMENTS: 'comments',
        MESSAGES: 'messages',
        SETTINGS: 'settings'
    },
    BUCKET: 'images'
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
    apiKey: 'SIMULATED-KEY-12345',
    senderEmail: 'support@cjnewshub.com',
    companyName: 'CJ News Hub',
    emailTemplate: "Hi {name},\nhere is your verification code please enter to change your password/passcode {code}\n\nthankyou for contact support team \n{companyName}"
};

export const DEFAULT_SUBSCRIPTION_SETTINGS: SubscriptionSettings = {
  showPaymentButton: false, // Default to false to remove payment page appearance
  paymentLink: 'https://paypal.com',
  monthlyPrice: '$9.99'
};

export const DEFAULT_AD_SETTINGS: AdSettings = {
    enableAdsGlobally: true
};

export const INITIAL_CLASSIFIEDS: Classified[] = [
    {
        id: 'c1',
        category: 'Jobs',
        title: 'Senior Graphic Designer',
        description: 'Creative agency looking for a senior designer with 5+ years experience. Adobe Creative Suite mastery required.',
        contact: 'hr@creativehub.com / +91 9988776655',
        location: 'Visakhapatnam',
        timestamp: Date.now()
    },
    {
        id: 'c2',
        category: 'Jobs',
        title: 'Accountant Needed',
        description: 'Local retail chain requires experienced accountant. Tally knowledge essential. Immediate joining.',
        contact: 'jobs@retailchain.com',
        location: 'Hyderabad',
        timestamp: Date.now() - 86400000
    },
    {
        id: 'c3',
        category: 'Real Estate',
        title: '3BHK Apartment for Sale',
        description: 'Luxury apartment in MVP Colony. 1800 sqft, East facing, fully furnished. Price negotiable.',
        contact: 'Ravi: +91 9876543210',
        location: 'Visakhapatnam',
        imageUrl: 'https://picsum.photos/400/300?random=20',
        timestamp: Date.now() - 172800000
    },
    {
        id: 'c4',
        category: 'Education',
        title: 'Home Tuitions Available',
        description: 'Experienced tutor available for Maths and Physics (Classes 8-12). CBSE/ICSE syllabus.',
        contact: 'Suresh: +91 8899001122',
        location: 'Online / Vizag',
        timestamp: Date.now() - 259200000
    },
    {
        id: 'c5',
        category: 'Services',
        title: 'Packers & Movers',
        description: 'Safe and reliable shifting services. Household, Office, Car transport. Pan India service.',
        contact: 'Express Movers: +91 7777788888',
        location: 'All India',
        timestamp: Date.now()
    }
];

export const INITIAL_ARTICLES: Article[] = [
  // --- SLIDER ARTICLES (First 5) ---
  {
    id: 'telugu-1',
    title: "విశాఖపట్నంలో కొత్త ఐటీ హబ్ ఏర్పాటుకు సన్నాహాలు",
    excerpt: "నగర అభివృద్ధిలో భాగంగా ఐటీ రంగాన్ని విస్తరించేందుకు ప్రభుత్వం కీలక నిర్ణయం తీసుకుంది. త్వరలో శంకుస్థాపన.",
    category: "Technology",
    author: "విలేఖరి",
    authorId: 'admin1',
    date: "24-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=10",
    content: "<p>విశాఖపట్నం నగరాన్ని ఐటీ రాజధానిగా తీర్చిదిద్దేందుకు ప్రభుత్వం వడివడిగా అడుగులు వేస్తోంది. మధురవాడ ఐటీ సెజ్‌లో అంతర్జాతీయ స్థాయి ప్రమాణాలతో కూడిన నూతన ఐటీ టవర్‌కు వచ్చే నెలలో శంకుస్థాపన జరగనుంది.</p><p>ఈ ప్రాజెక్టు ద్వారా సుమారు 15,000 మందికి ప్రత్యక్షంగానూ, 40,000 మందికి పరోక్షంగానూ ఉపాధి లభిస్తుందని అంచనా వేస్తున్నారు. పలు బహుళజాతి సంస్థలు ఇప్పటికే ఇక్కడ కార్యాలయాలు ఏర్పాటు చేసేందుకు ఆసక్తి కనబరిచాయి.</p>",
    tags: ["Vizag", "IT Hub", "Development"],
    status: 'published',
    isFeatured: true,
    views: 120
  },
  {
    id: '1',
    title: "Global Markets Rally as Tech Sector Rebounds Unexpectedly",
    excerpt: "Investors are celebrating a surprising turn of events in the silicon valley sector as major players announce breakthrough earnings for Q3.",
    category: "Business",
    author: "Eleanor Rigby",
    authorId: 'admin1',
    date: "24-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=1",
    content: "Full article content goes here...",
    tags: ["Finance", "Silicon Valley", "Stocks"],
    status: 'published',
    isFeatured: true,
    views: 0
  },
  {
    id: '2',
    title: "The Renaissance of Modern Architecture in Europe",
    excerpt: "A look into how sustainable materials are reshaping the skylines of Paris, Berlin, and Rome without compromising historical integrity.",
    category: "Culture",
    author: "Jean-Luc Picard",
    authorId: 'admin1',
    date: "24-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=2",
    content: "Full article content goes here...",
    tags: ["Architecture", "Europe", "Sustainability"],
    status: 'published',
    isFeatured: false,
    views: 0
  },
  {
    id: '3',
    title: "New AI Regulations Proposed by Summit Leaders",
    excerpt: "The annual tech summit concluded with a unanimous agreement on the ethical deployment of generative models in public sectors.",
    category: "Technology",
    author: "Sarah Connor",
    authorId: 'admin1',
    date: "24-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=3",
    content: "Full article content goes here...",
    tags: ["AI", "Policy", "Tech Summit"],
    status: 'published',
    isFeatured: false,
    views: 0
  },
  {
    id: '4',
    title: "Historic Peace Treaty Signed in Geneva",
    excerpt: "Delegates from three continents gathered today to sign a landmark agreement that promises to de-escalate tensions in the northern hemisphere.",
    category: "World",
    author: "Clark Kent",
    authorId: 'admin1',
    date: "23-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=4",
    content: "Full article content...",
    tags: ["Peace", "Geneva", "World Politics"],
    status: 'published',
    isFeatured: true,
    views: 0
  },
  
  // --- LATEST NEWS ARTICLES (Next 3) ---
  {
    id: '5',
    title: "Championship Finals: The Underdog Story of the Decade",
    excerpt: "Against all odds, the local team secured victory in the final minutes of overtime, creating a sports moment that will be remembered for generations.",
    category: "Sports",
    author: "Ted Lasso",
    authorId: 'admin1',
    date: "23-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=5",
    content: "Full article content...",
    tags: ["Football", "Championship", "Sports"],
    status: 'published',
    isFeatured: false,
    views: 0
  },
  {
    id: '6',
    title: "Urban Farming: The Future of City Living?",
    excerpt: "With rising food costs and climate concerns, rooftops across the metropolis are turning green. We interview the pioneers of this vertical revolution.",
    category: "Culture",
    author: "Pamela Isley",
    authorId: 'admin1',
    date: "22-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=6",
    content: "Full article content...",
    tags: ["Environment", "City Life", "Food"],
    status: 'published',
    isFeatured: false,
    views: 0
  },
  {
    id: '7',
    title: "Electric Vehicles Surpass Gas Sales in Nordic Region",
    excerpt: "A historic milestone was reached this month as EV sales officially outpaced traditional combustion engines in Scandinavia.",
    category: "Business",
    author: "Elon Tusk",
    authorId: 'admin1',
    date: "22-11-2025",
    imageUrl: "https://picsum.photos/800/400?random=7",
    content: "Full article content...",
    tags: ["EV", "Automotive", "Green Energy"],
    status: 'published',
    isFeatured: false,
    views: 0
  }
];

export const INITIAL_EPAPER_PAGES: EPaperPage[] = [
  {
    id: 'p1',
    pageNumber: 1,
    imageUrl: "https://picsum.photos/1200/1800?random=101", // Tall aspect ratio for paper
    date: "2025-11-24",
    status: 'active'
  },
  {
    id: 'p2',
    pageNumber: 2,
    imageUrl: "https://picsum.photos/1200/1801?random=102",
    date: "2025-11-24",
    status: 'active'
  },
  {
    id: 'p3',
    pageNumber: 3,
    imageUrl: "https://picsum.photos/1200/1802?random=103",
    date: "2025-11-24",
    status: 'active'
  },
  // Archive Data
  {
    id: 'old_p1',
    pageNumber: 1,
    imageUrl: "https://picsum.photos/1200/1803?random=104",
    date: "2025-11-20",
    status: 'active'
  },
  {
    id: 'old_p2',
    pageNumber: 2,
    imageUrl: "https://picsum.photos/1200/1804?random=105",
    date: "2025-11-20",
    status: 'active'
  }
];

// Start with NO users. The Admin must be created via the Setup page.
export const INITIAL_USERS: User[] = [];

export const INITIAL_ADS: Advertisement[] = [
    {
        id: 'ad1',
        advertiserName: 'TechCorp Global',
        imageUrl: 'https://picsum.photos/728/90?random=10',
        targetUrl: 'https://example.com',
        size: AdSize.LEADERBOARD,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2030-12-31',
        clicks: 0,
        clickedIps: []
    },
    {
        id: 'ad2',
        advertiserName: 'Local Coffee Roasters',
        imageUrl: 'https://picsum.photos/300/250?random=11',
        targetUrl: 'https://example.com',
        size: AdSize.RECTANGLE,
        status: 'active',
        startDate: '2024-01-05',
        endDate: '2030-12-31',
        clicks: 0,
        clickedIps: []
    }
];
