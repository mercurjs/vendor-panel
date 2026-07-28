export const applyDateFilter = <T>(
  key: 'created_at' | 'updated_at',
  raw: string | undefined,
  searchParams: T
): void => {
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([op, value]) => {
        if (value) {
          (searchParams as Record<string, unknown>)[`${key}[${op}]`] = value;
        }
      });
    }
  } catch {
    // Ignore malformed JSON and leave filter unset
  }
};
