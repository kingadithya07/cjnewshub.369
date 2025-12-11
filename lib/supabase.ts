
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aotfblipjssoldydnaaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdGZibGlwanNzb2xkeWRuYWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NjkyODEsImV4cCI6MjA4MTA0NTI4MX0.Yu1tHTn7JYuZn3KqxWKZUIm8rR09_LPrOdkvDY5AvYo';

export const supabase = createClient(supabaseUrl, supabaseKey);
