import { DurableObject } from "cloudflare:workers"

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class MyDurableObject extends DurableObject<Env> {
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */

	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`
	}
}

// Helper function to add CORS headers
const addCorsHeaders = (response: Response): Response => {
	response.headers.set("Access-Control-Allow-Origin", "*") // Allow any origin (adjust in production!)
	response.headers.set("Access-Control-Allow-Methods", "PUT, GET, DELETE, OPTIONS")
	response.headers.set("Access-Control-Allow-Headers", "Content-Type") // Allow Content-Type header
	return response
}

// Simple function to extract extension
const getExtension = (filename: string | null, contentType: string | null): string => {
	if (filename?.includes(".")) {
		const parts = filename.split(".")
		const ext = parts[parts.length - 1]
		if (ext && ext.length < 10) {
			// Basic check for a reasonable extension
			return `.${ext.toLowerCase()}`
		}
	}
	// Explicitly check contentType before calling startsWith
	if (contentType) {
		if (contentType.startsWith("image/jpeg")) return ".jpg"
		if (contentType.startsWith("image/png")) return ".png"
		if (contentType.startsWith("image/gif")) return ".gif"
		if (contentType.startsWith("application/pdf")) return ".pdf"
		if (contentType.startsWith("text/plain")) return ".txt"
	}
	return ".bin" // Default fallback
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url)

		if (request.method === "OPTIONS" && url.pathname === "/upload") {
			return addCorsHeaders(new Response(null, { status: 204 }))
		}

		let response: Response

		if (url.pathname === "/upload" && request.method === "PUT") {
			// Handle File Upload
			if (!request.body) {
				response = new Response("Request body is missing", { status: 400 })
			} else {
				// Generate a unique key on the server
				const uniqueId = crypto.randomUUID()
				const contentType = request.headers.get("Content-Type")
				// Attempt to get extension from Content-Type or original filename (if provided)
				const originalFilename = url.searchParams.get("filename")
				const extension = getExtension(originalFilename, contentType)
				const generatedKey = `${uniqueId}${extension}`

				try {
					await env.FILE_BUCKET.put(generatedKey, request.body, {
						httpMetadata: { contentType: contentType ?? undefined },
					})
					// Return the *generated* key as JSON on success
					response = new Response(JSON.stringify({ key: generatedKey }), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					})
				} catch (error) {
					console.error(`Error uploading file ${generatedKey}:`, error)
					response = new Response(
						`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`,
						{
							status: 500,
						},
					)
				}
			}
		} else if (request.method === "GET") {
			// Handle File Retrieval (using the key from the path)
			const key = url.pathname.slice(1)
			if (!key) {
				response = new Response("Missing file key in URL path", { status: 400 })
			} else {
				const object = await env.FILE_BUCKET.get(key)
				if (object === null) {
					response = new Response("Object Not Found", { status: 404 })
				} else {
					const headers = new Headers()
					object.writeHttpMetadata(headers)
					headers.set("etag", object.httpEtag)
					// Add content disposition if you want downloads to use original filename (requires storing it)
					// headers.set('Content-Disposition', `inline; filename="${originalFilenameStoredSomewhere}"`);
					response = new Response(object.body, {
						headers,
					})
				}
			}
		} else if (request.method === "DELETE") {
			// Handle File Deletion (using the key from the path)
			const key = url.pathname.slice(1)
			if (!key) {
				response = new Response("Missing file key in URL path", { status: 400 })
			} else {
				await env.FILE_BUCKET.delete(key)
				response = new Response("Deleted!", { status: 200 })
			}
		} else {
			response = new Response("Not Found or Method Not Allowed", {
				status: 404,
				headers: {
					Allow: "PUT, GET, DELETE, OPTIONS",
				},
			})
		}

		return addCorsHeaders(response)
	},
} satisfies ExportedHandler<Env>
