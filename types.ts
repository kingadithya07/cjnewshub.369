
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorId?: string; // Tracks the user ID of the creator
  date: string;
  imageUrl: string;
  videoUrl?: string; // Optional video URL
  content: string; // Full content
  tags: string[];
  status: 'draft' | 'published' | 'pending';
  isFeatured: boolean;
  views: number;
}

export interface EPaperPage {
  id: string;
  pageNumber: number;
  imageUrl: string; // Represents the rendered PDF page or uploaded image
  date: string;
  status: 'active' | 'pending';
}

export interface Clipping {
  id: string;
  dataUrl: string;
  timestamp: number;
  userId?: string; // Link clipping to specific user
}

export interface Classified {
  id: string;
  category: 'Jobs' | 'Real Estate' | 'Services' | 'Education' | 'Vehicles' | 'Public Notice' | 'Matrimonial';
  title: string;
  description: string;
  contact: string;
  location?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface WatermarkSettings {
  text: string;
  logoUrl: string | null;
}

export enum AdSize {
  LEADERBOARD = '728x90',
  RECTANGLE = '300x250',
  SKYSCRAPER = '160x600',
  MOBILE_BANNER = '320x50',
  MOBILE_LARGE = '320x100',
}

export interface AdSettings {
    enableAdsGlobally: boolean;
}

export interface Advertisement {
  id: string;
  advertiserName: string;
  imageUrl: string;
  targetUrl: string;
  size: AdSize;
  status: 'active' | 'inactive' | 'pending';
  startDate: string;
  endDate: string;
  clicks: number;
  clickedIps: string[];
}

export interface AdSpot {
  id: string;
  size: AdSize;
  location: string;
}

export type UserRole = 'admin' | 'publisher' | 'subscriber';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; 
  status: 'active' | 'blocked' | 'pending';
  ip?: string;
  joinedAt?: string;
  subscriptionPlan?: 'free' | 'premium';
  isAdFree?: boolean; 
  profilePicUrl?: string;
  trustedDevices: string[]; // List of approved Device IDs
}

export interface SecurityRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    deviceId: string;
    type: 'login' | 'recovery';
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
    ip: string;
}

export interface RecoveryRequest {
  email: string;
  userName: string;
  code: string;
  timestamp: number;
}

export interface ProfileUpdateRequest {
  userId: string;
  newEmail?: string;
  newPassword?: string;
  newProfilePic?: string;
  verificationCode: string;
  timestamp: number;
}

export interface EmailSettings {
  apiKey: string; // Simulation key
  senderEmail: string;
  companyName: string;
  emailTemplate: string;
}

export interface SubscriptionSettings {
  showPaymentButton: boolean;
  paymentLink: string;
  monthlyPrice: string;
}

export interface AnalyticsData {
    totalViews: number;
    avgViewsPerArticle: number;
    categoryDistribution: { category: string; count: number; percentage: number; color: string }[];
    dailyVisits: { date: string; visits: number }[];
    geoSources: { country: string; percentage: number }[];
}

export interface Comment {
    id: string;
    articleId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: number;
    likes: number;
    dislikes: number;
    likedBy: string[]; // User IDs who liked
    dislikedBy: string[]; // User IDs who disliked
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    timestamp: number;
    read: boolean;
}
