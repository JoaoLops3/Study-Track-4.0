import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(
		"Faltam variáveis de ambiente do Supabase. Verifique se VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas.",
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
	},
	global: {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
	},
});

export type SupabaseUser = {
	id: string;
	email?: string;
	avatar_url?: string;
	full_name?: string;
	user_metadata?: {
		full_name?: string;
		avatar_url?: string;
		name?: string;
		picture?: string;
	};
};
