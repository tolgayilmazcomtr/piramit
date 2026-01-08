import { NextRequest, NextResponse } from "next/server";

// Developer: Tolga Yılmaz
const N8N_API_URL = process.env.N8N_API_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function proxyN8N(
    req: NextRequest,
    path: string,
    method: HttpMethod = "POST"
) {
    try {
        if (!N8N_API_URL) {
            console.error("N8N_API_URL is not defined");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Authorization header'ı ilet
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
            headers["Authorization"] = authHeader;
        }

        let body;
        if (method !== "GET" && method !== "DELETE") {
            try {
                body = await req.json();
            } catch (e) {
                // Body boş olabilir
            }
        }

        const url = `${N8N_API_URL}${path}`;
        console.log(`Proxying to n8n: ${method} ${url}`);

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        // n8n'den gelen status kodunu yansıt veya 200 dön
        return NextResponse.json(data, { status: response.status || 200 });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
