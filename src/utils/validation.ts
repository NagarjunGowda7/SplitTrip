export const isValidDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const isValidTimeInput = (value: string) => /^(0?[1-9]|1[0-2]):[0-5]\d ?(AM|PM)$/i.test(value);

export const isPositiveNumber = (value: string) => {
  const parsed = Number(value);
  return !Number.isNaN(parsed) && parsed > 0;
};

export const isNonNegativeNumber = (value: string) => {
  const parsed = Number(value);
  return !Number.isNaN(parsed) && parsed >= 0;
};

export const isLikelyUrl = (value: string) =>
  !value || /^https?:\/\/.+/i.test(value);

export const normalizeDateString = (value: string) => {
  if (isValidDateInput(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
};
