export const RESERVED_USERNAMES = [
  "admin",
  "dashboard",
  "ideas",
  "docs",
  "hackathons",
  "universities",
  "apply",
  "submit",
  "auth",
  "projects",
  "api",
  "learn",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "og-image.png",
  "logo.svg",
  "logo-og.png",
  "logo-with-logotype.svg",
];

export function isReservedUsername(value: string): boolean {
  return RESERVED_USERNAMES.includes(value.toLowerCase());
}
