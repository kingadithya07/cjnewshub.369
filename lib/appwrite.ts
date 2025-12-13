
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../constants';

const client = new Client();

// Initialize Appwrite
client
    .setEndpoint(APPWRITE_CONFIG.ENDPOINT) 
    .setProject(APPWRITE_CONFIG.PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper to generate unique IDs
export const uniqueId = () => ID.unique();

export { ID, Query };
export default client;
