import { initiateInstagramAuth } from "@/lib/instagram.actions";

export async function GET() {
  return initiateInstagramAuth(); // Akan redirect ke Instagram
}