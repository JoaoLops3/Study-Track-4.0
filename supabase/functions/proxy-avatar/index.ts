import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Max-Age": "86400",
};

serve(async (req) => {
	// Handle CORS
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		const url = new URL(req.url);
		const imageUrl = url.searchParams.get("url");

		if (!imageUrl) {
			return new Response(
				JSON.stringify({ error: "URL parameter is required" }),
				{
					status: 400,
					headers: { ...corsHeaders, "Content-Type": "application/json" },
				},
			);
		}

		// Validar se a URL é do Google
		if (!imageUrl.includes("googleusercontent.com")) {
			return new Response(JSON.stringify({ error: "Invalid image URL" }), {
				status: 400,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}

		const response = await fetch(imageUrl);

		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}

		const contentType = response.headers.get("content-type") || "image/jpeg";
		const contentLength = response.headers.get("content-length");

		return new Response(response.body, {
			headers: {
				...corsHeaders,
				"Content-Type": contentType,
				"Content-Length": contentLength || "",
				"Cache-Control": "public, max-age=3600, s-maxage=3600",
				"X-Content-Type-Options": "nosniff",
				"X-Frame-Options": "DENY",
				"X-XSS-Protection": "1; mode=block",
			},
		});
	} catch (error) {
		console.error("Error in proxy-avatar:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to fetch image",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}
});
