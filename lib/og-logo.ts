import fs from "fs";
import path from "path";

let cachedLogoDataUri: string | null = null;

export function getLogoDataUri(): string {
  if (cachedLogoDataUri && process.env.NODE_ENV === "production") {
    return cachedLogoDataUri;
  }

  const filePath = path.join(process.cwd(), "public", "logo-og.png");
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString("base64");

  cachedLogoDataUri = `data:image/png;base64,${base64}`;
  return cachedLogoDataUri;
}
