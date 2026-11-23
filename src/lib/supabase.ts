// lib/supabase.ts
// Sign-in for chat. Visitors get an anonymous Supabase account the first time they send a message
// (behind a Turnstile check); the session lives in localStorage and refreshes itself. Email and
// Google sign-in later are other Supabase providers: callers only ever ask for an access token.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient {
	if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Chat is not configured (Supabase URL or key missing)');
	client ??= createClient(SUPABASE_URL, SUPABASE_KEY);
	return client;
}

interface Turnstile {
	render: (el: HTMLElement, options: Record<string, unknown>) => string;
	remove: (widgetId: string) => void;
}

declare global {
	interface Window {
		turnstile?: Turnstile;
	}
}

let scriptLoading: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
	scriptLoading ??= new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = TURNSTILE_SCRIPT;
		script.async = true;
		script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile failed to load')));
		script.onerror = () => {
			scriptLoading = null;
			reject(new Error('Turnstile failed to load'));
		};
		document.head.appendChild(script);
	});
	return scriptLoading;
}

// A one-time Turnstile token. The widget stays invisible unless Cloudflare wants an interaction,
// in which case it appears in the bottom corner until solved.
async function turnstileToken(): Promise<string> {
	if (!TURNSTILE_SITE_KEY) throw new Error('Chat is not configured (Turnstile site key missing)');
	const turnstile = await loadTurnstile();
	const host = document.createElement('div');
	host.className = 'fixed bottom-4 right-4 z-[60]';
	document.body.appendChild(host);
	return new Promise((resolve, reject) => {
		let widgetId = '';
		const done = () => {
			turnstile.remove(widgetId);
			host.remove();
		};
		widgetId = turnstile.render(host, {
			sitekey: TURNSTILE_SITE_KEY,
			appearance: 'interaction-only',
			callback: (token: string) => {
				done();
				resolve(token);
			},
			// Codes: https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/
			// (110200: this hostname isn't allowed for the widget)
			'error-callback': (code: string) => {
				console.error('Turnstile error', code);
				done();
				reject(new Error("Couldn't verify you're human. Please try again."));
			},
		});
	});
}

// The current access token, or null when this browser hasn't started chatting yet
export async function currentAccessToken(): Promise<string | null> {
	if (!SUPABASE_URL || !SUPABASE_KEY) return null;
	const { data } = await supabase().auth.getSession();
	return data.session?.access_token ?? null;
}

let signingIn: Promise<string> | null = null;

// An access token, signing in anonymously first if needed (one sign-in even if called concurrently)
export async function accessToken(): Promise<string> {
	const existing = await currentAccessToken();
	if (existing) return existing;
	signingIn ??= (async () => {
		try {
			const captchaToken = await turnstileToken();
			const { data, error } = await supabase().auth.signInAnonymously({ options: { captchaToken } });
			if (error || !data.session) throw new Error("Couldn't start a chat session. Please try again.");
			return data.session.access_token;
		} finally {
			signingIn = null;
		}
	})();
	return signingIn;
}

// Whether the signed-in account is a guest (anonymous); guests' chats expire after 30 days
export async function isGuest(): Promise<boolean> {
	if (!SUPABASE_URL || !SUPABASE_KEY) return true;
	const { data } = await supabase().auth.getSession();
	return data.session?.user.is_anonymous ?? true;
}
