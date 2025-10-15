// Mock users data with 30 realistic profiles
export interface MockUser {
  id: string;
  walletAddress: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  twitter: string;
  instagram: string;
  discord: string;
  isVerified: boolean;
  isFeatured: boolean;
  joinedAt: string;
  stats: {
    artworks: number;
    sales: number;
    followers: number;
    following: number;
    totalVolume: string;
    totalVolumeUSDC: string;
  };
  badges: string[];
  specialties: string[];
  languages: string[];
  timezone: string;
  isOnline: boolean;
  lastActive: string;
}

// Realistic names and usernames
const names = [
  'Alex Chen', 'Maya Rodriguez', 'Jordan Kim', 'Sam Taylor', 'Riley Johnson',
  'Casey Williams', 'Morgan Brown', 'Avery Davis', 'Quinn Miller', 'Sage Wilson',
  'River Anderson', 'Phoenix Martinez', 'Blake Thompson', 'Drew Garcia', 'Cameron Lee',
  'Taylor White', 'Jamie Clark', 'Dakota Lewis', 'Skyler Walker', 'Rowan Hall',
  'Emery Young', 'Finley King', 'Hayden Wright', 'Parker Lopez', 'Reese Hill',
  'Sawyer Scott', 'Kendall Green', 'Avery Adams', 'Blake Baker', 'Cameron Nelson'
];

const usernames = [
  'digital_artist', 'cyber_creator', 'neon_designer', 'pixel_master', 'code_artist',
  'visual_storyteller', 'digital_dreamer', 'creative_coder', 'art_innovator', 'design_wizard',
  'color_maestro', 'shape_shifter', 'light_weaver', 'form_builder', 'vision_crafter',
  'digital_poet', 'art_architect', 'creative_engineer', 'visual_alchemist', 'design_philosopher',
  'pixel_perfectionist', 'digital_visionary', 'art_technologist', 'creative_developer', 'visual_artist',
  'design_innovator', 'digital_craftsman', 'art_engineer', 'creative_technician', 'visual_creator'
];

// Realistic bios
const bios = [
  'Digital artist exploring the intersection of technology and creativity. Passionate about pushing boundaries in Web3 art.',
  'Photographer capturing the beauty of urban landscapes and human emotions through the lens.',
  '3D artist creating immersive worlds and characters that tell compelling stories.',
  'Illustrator specializing in character design and concept art for games and animation.',
  'Musician crafting ambient soundscapes that transport listeners to other dimensions.',
  'Multimedia artist combining traditional techniques with cutting-edge digital tools.',
  'Creative technologist building bridges between art and blockchain technology.',
  'Visual storyteller using digital media to explore themes of identity and connection.',
  'Designer focused on creating meaningful experiences through thoughtful visual communication.',
  'Artist experimenting with new forms of digital expression and interactive media.',
  'Photographer documenting the human experience in the digital age.',
  '3D designer creating architectural visualizations and virtual environments.',
  'Illustrator bringing stories to life through vibrant colors and dynamic compositions.',
  'Musician exploring the fusion of electronic and organic sounds.',
  'Digital creator passionate about democratizing art through blockchain technology.',
  'Visual artist investigating the relationship between technology and human nature.',
  'Designer crafting user experiences that are both beautiful and functional.',
  'Artist using code as a medium to create generative and interactive artworks.',
  'Photographer capturing the essence of contemporary life in urban environments.',
  '3D artist specializing in character modeling and animation for digital media.',
  'Illustrator creating whimsical worlds and memorable characters.',
  'Musician composing atmospheric soundtracks for digital experiences.',
  'Digital artist exploring themes of identity, community, and technology.',
  'Visual designer creating compelling narratives through strategic use of imagery.',
  'Creative technologist building tools that empower other artists.',
  'Artist investigating the intersection of artificial intelligence and human creativity.',
  'Designer focused on creating inclusive and accessible digital experiences.',
  'Photographer documenting the rapid changes in our technological landscape.',
  '3D artist creating immersive experiences that challenge our perception of reality.',
  'Illustrator using art as a medium for social commentary and cultural exploration.'
];

// Realistic locations
const locations = [
  'New York, NY', 'Los Angeles, CA', 'San Francisco, CA', 'London, UK', 'Tokyo, Japan',
  'Berlin, Germany', 'Amsterdam, Netherlands', 'Toronto, Canada', 'Sydney, Australia', 'Paris, France',
  'Seoul, South Korea', 'Singapore', 'Dubai, UAE', 'Mumbai, India', 'São Paulo, Brazil',
  'Mexico City, Mexico', 'Barcelona, Spain', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Zurich, Switzerland',
  'Vancouver, Canada', 'Melbourne, Australia', 'Hong Kong', 'Taipei, Taiwan', 'Bangkok, Thailand',
  'Miami, FL', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Boston, MA'
];

// Realistic specialties
const specialties = [
  'Digital Art', 'Photography', '3D Modeling', 'Illustration', 'Music Production',
  'Animation', 'Graphic Design', 'UI/UX Design', 'Concept Art', 'Character Design',
  'Architectural Visualization', 'Product Design', 'Motion Graphics', 'Web Design', 'Game Art',
  'NFT Art', 'Generative Art', 'Interactive Media', 'Virtual Reality', 'Augmented Reality',
  'Blockchain Art', 'Crypto Art', 'Digital Sculpture', 'Pixel Art', 'Vector Art',
  'Photomanipulation', 'Digital Painting', '3D Animation', 'Sound Design', 'Video Art'
];

// Realistic languages
const languages = [
  'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Portuguese',
  'Italian', 'Dutch', 'Russian', 'Arabic', 'Hindi', 'Thai', 'Vietnamese'
];

// Realistic badges
const badges = [
  'Early Adopter', 'Verified Artist', 'Top Seller', 'Community Leader', 'Innovation Pioneer',
  'Rising Star', 'Featured Creator', 'Blockchain Expert', 'Digital Pioneer', 'Art Collector',
  'NFT Enthusiast', 'Web3 Advocate', 'Creative Visionary', 'Tech Innovator', 'Art Evangelist'
];

// Generate realistic stats
const generateStats = () => ({
  artworks: Math.floor(Math.random() * 50) + 1,
  sales: Math.floor(Math.random() * 200) + 1,
  followers: Math.floor(Math.random() * 10000) + 100,
  following: Math.floor(Math.random() * 1000) + 10,
  totalVolume: (Math.random() * 100 + 1).toFixed(2),
  totalVolumeUSDC: (Math.random() * 300000 + 1000).toFixed(0)
});

// Generate join dates (last 2 years)
const generateJoinedAt = (): string => {
  const now = new Date();
  const twoYearsAgo = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

// Generate last active time
const generateLastActive = (): string => {
  const now = new Date();
  const hoursAgo = Math.floor(Math.random() * 24);
  const activeTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
  return activeTime.toISOString();
};

// Generate mock users
export const MOCK_USERS: MockUser[] = [];

for (let i = 1; i <= 30; i++) {
  const name = names[i - 1];
  const username = usernames[i - 1];
  const stats = generateStats();
  const userSpecialties = specialties.slice(0, Math.floor(Math.random() * 3) + 1);
  const userBadges = badges.slice(0, Math.floor(Math.random() * 3) + 1);
  const userLanguages = languages.slice(0, Math.floor(Math.random() * 3) + 1);
  
  const user: MockUser = {
    id: i.toString(),
    walletAddress: `0x${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}${Math.random().toString(16).substr(2, 8)}`,
    name,
    username: `${username}${i}`,
    bio: bios[i - 1],
    avatar: `https://images.unsplash.com/200x200/?portrait&sig=${i}`,
    coverImage: `https://images.unsplash.com/800x300/?abstract&sig=${i}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    website: `https://${username}${i}.com`,
    twitter: `@${username}${i}`,
    instagram: `@${username}${i}`,
    discord: `${username}${i}#${Math.floor(Math.random() * 9999)}`,
    isVerified: Math.random() > 0.4, // 60% verified
    isFeatured: Math.random() > 0.8, // 20% featured
    joinedAt: generateJoinedAt(),
    stats,
    badges: userBadges,
    specialties: userSpecialties,
    languages: userLanguages,
    timezone: 'UTC',
    isOnline: Math.random() > 0.3, // 70% online
    lastActive: generateLastActive()
  };
  
  MOCK_USERS.push(user);
}

// Helper functions
export const getVerifiedUsers = () => 
  MOCK_USERS.filter(user => user.isVerified);

export const getFeaturedUsers = () => 
  MOCK_USERS.filter(user => user.isFeatured);

export const getOnlineUsers = () => 
  MOCK_USERS.filter(user => user.isOnline);

export const getUserByAddress = (address: string) => 
  MOCK_USERS.find(user => user.walletAddress.toLowerCase() === address.toLowerCase());

export const getUserByUsername = (username: string) => 
  MOCK_USERS.find(user => user.username.toLowerCase() === username.toLowerCase());

export const searchUsers = (query: string) => 
  MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase()) ||
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.bio.toLowerCase().includes(query.toLowerCase()) ||
    user.specialties.some(specialty => specialty.toLowerCase().includes(query.toLowerCase()))
  );

export const getTopSellers = (limit: number = 10) => 
  MOCK_USERS
    .sort((a, b) => b.stats.sales - a.stats.sales)
    .slice(0, limit);

export const getTopCreators = (limit: number = 10) => 
  MOCK_USERS
    .sort((a, b) => b.stats.artworks - a.stats.artworks)
    .slice(0, limit);

export const getUsersBySpecialty = (specialty: string) => 
  MOCK_USERS.filter(user => 
    user.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
  );
