import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
    try {
        // Run prisma db push to sync schema
        const { stdout, stderr } = await execAsync("npx prisma db push");

        return NextResponse.json({
            status: "success",
            message: "Database schema synced successfully.",
            stdout,
            stderr
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            stdout: error.stdout,
            stderr: error.stderr
        }, { status: 500 });
    }
}
