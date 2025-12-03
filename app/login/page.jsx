"use client";

import { createClient } from '@supabase/supabase-js';
import AuthPage from '@/app/components/AuthPage';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
    return <AuthPage supabase={supabase} />;
}