const monthLookup: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const parseMonthDayDate = (value: string) => {
  const match = value.trim().match(/^([A-Za-z]{3,})[-/\s](\d{1,2})(?:[-/\s,](\d{2,4}))?$/);
  if (!match) {
    return null;
  }

  const monthIndex = monthLookup[match[1].slice(0, 3).toLowerCase()];
  if (monthIndex == null) {
    return null;
  }

  const rawYear = match[3];
  const year = rawYear ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear) : new Date().getFullYear();
  const date = new Date(year, monthIndex, Number(match[2]), 12, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseValidDate = (value: string | Date) => {
  const parsed =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T12:00:00`)
        : parseMonthDayDate(value) ?? new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const padDatePart = (value: number) => String(value).padStart(2, "0");

const extractLegacyClockTime = (value: string) => {
  const legacyTimeMatch = value.match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (!legacyTimeMatch) {
    return null;
  }

  return {
    hour: Number(legacyTimeMatch[1]),
    minute: Number(legacyTimeMatch[2]),
  };
};

const formatToTwelveHour = (hour24: number, minute: number) => {
  const safeHour = ((hour24 % 24) + 24) % 24;
  const suffix = safeHour >= 12 ? "PM" : "AM";
  const hour12 = safeHour % 12 === 0 ? 12 : safeHour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export const toLocalDateInputValue = (value: Date | string) => {
  const parsed = parseValidDate(value);
  if (!parsed) {
    return "";
  }

  return `${parsed.getFullYear()}-${padDatePart(parsed.getMonth() + 1)}-${padDatePart(parsed.getDate())}`;
};

export const getTodayDateInput = () => toLocalDateInputValue(new Date());

const safeFormatDate = (
  value: string,
  options: Intl.DateTimeFormatOptions,
  fallback = "TBD",
) => {
  const parsed = parseValidDate(value);
  if (!parsed) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", options).format(parsed);
};

export const formatDisplayDate = (value: string) =>
  safeFormatDate(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatShortDate = (value: string) =>
  safeFormatDate(value, {
    month: "short",
    day: "numeric",
  });

export const formatTime = (value: string) =>
  safeFormatDate(
    value,
    {
      hour: "numeric",
      minute: "2-digit",
    },
    "--:--",
  );

export const getTripDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = end.getTime() - start.getTime();
  return Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)) + 1, 1);
};

export const toIsoDate = (value: Date | string) => {
  const parsed = parseValidDate(value);
  return parsed ? parsed.toISOString() : new Date().toISOString();
};

export const getWeekdayLabel = (value: string) =>
  safeFormatDate(value, { weekday: "short" }, "");

export const parseTimeToMinutes = (value: string) => {
  const trimmed = value.trim();
  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const meridiem = twelveHourMatch[3].toUpperCase();

    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    return hour * 60 + minute;
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHourMatch) {
    return Number(twentyFourHourMatch[1]) * 60 + Number(twentyFourHourMatch[2]);
  }

  if (/(GMT|UTC|^\w{3}\s\w{3}\s\d{2}\s\d{4})/.test(trimmed)) {
    const clock = extractLegacyClockTime(trimmed);
    if (clock) {
      return clock.hour * 60 + clock.minute;
    }
  }

  const parsedDate = parseValidDate(trimmed);
  if (parsedDate) {
    return parsedDate.getHours() * 60 + parsedDate.getMinutes();
  }

  return Number.MAX_SAFE_INTEGER;
};

export const formatItineraryTime = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (twelveHourMatch) {
    return `${Number(twelveHourMatch[1])}:${twelveHourMatch[2]} ${twelveHourMatch[3].toUpperCase()}`;
  }

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHourMatch) {
    return formatToTwelveHour(Number(twentyFourHourMatch[1]), Number(twentyFourHourMatch[2]));
  }

  if (/(GMT|UTC|^\w{3}\s\w{3}\s\d{2}\s\d{4})/.test(trimmed)) {
    const clock = extractLegacyClockTime(trimmed);
    if (clock) {
      return formatToTwelveHour(clock.hour, clock.minute);
    }
  }

  const parsedDate = parseValidDate(trimmed);
  if (parsedDate) {
    return formatToTwelveHour(parsedDate.getHours(), parsedDate.getMinutes());
  }

  return trimmed;
};

export const formatCalendarMonth = (value: Date) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(value);

export const getCalendarDays = (monthDate: Date) => {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const startWeekday = start.getDay();
  const days: Array<{ key: string; value?: string; dayNumber?: number }> = [];

  for (let index = 0; index < startWeekday; index += 1) {
    days.push({ key: `empty-${index}` });
  }

  for (let day = 1; day <= end.getDate(); day += 1) {
    const current = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    days.push({
      key: `${current.getFullYear()}-${current.getMonth()}-${day}`,
      value: toLocalDateInputValue(current),
      dayNumber: day,
    });
  }

  return days;
};

export const generateTimeOptions = (stepMinutes = 30) => {
  const options: string[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      options.push(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(date),
      );
    }
  }

  return options;
};

export const compareItineraryOrder = (
  first: { date: string; startTime: string; sortOrder?: number },
  second: { date: string; startTime: string; sortOrder?: number },
) => {
  const firstDateValue = parseValidDate(first.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const secondDateValue = parseValidDate(second.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;

  if (firstDateValue !== secondDateValue) {
    return firstDateValue - secondDateValue;
  }

  const timeDifference = parseTimeToMinutes(first.startTime) - parseTimeToMinutes(second.startTime);
  if (timeDifference !== 0) {
    return timeDifference;
  }

  return (first.sortOrder ?? 0) - (second.sortOrder ?? 0);
};

export const getDateSortValue = (value: string) => parseValidDate(value)?.getTime() ?? 0;

export const getDateTimeSortValue = (value: string) => {
  if (!value) return 0;

  const parsedTimestamp = Date.parse(value);
  if (!Number.isNaN(parsedTimestamp)) {
    return parsedTimestamp;
  }

  return getDateSortValue(value);
};
