export function projectPath(username: string, projectSlug: string) {
  return `/${username}/${projectSlug}`
}

export function formatDateTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dateOpts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

  return `${startDate.toLocaleDateString("en-US", dateOpts)}, ${startDate.toLocaleTimeString("en-US", timeOpts)} — ${endDate.toLocaleDateString("en-US", dateOpts)}, ${endDate.toLocaleTimeString("en-US", timeOpts)}`;
}
