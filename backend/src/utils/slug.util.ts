const SLUG_MAX_LENGTH = 200;

/**
 * Convert a display title into a URL-safe slug segment.
 */
export const slugifyTitle = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH);

  return slug.length > 0 ? slug : 'movie';
};

/**
 * Resolve a unique slug by appending numeric suffixes when collisions occur.
 */
export const generateUniqueSlug = async (
  title: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> => {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;
  let suffix = 2;

  while (await slugExists(candidate)) {
    const suffixText = `-${String(suffix)}`;
    const trimmedBase = baseSlug.slice(0, SLUG_MAX_LENGTH - suffixText.length);
    candidate = `${trimmedBase}${suffixText}`;
    suffix += 1;
  }

  return candidate;
};
