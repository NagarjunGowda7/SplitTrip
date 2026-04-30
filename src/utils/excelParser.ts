import { readSheet, Row } from "read-excel-file/universal";

import { ItineraryItem } from "@/types/ItineraryItem";
import {
  formatItineraryTime,
  getWeekdayLabel,
  parseTimeToMinutes,
  toLocalDateInputValue,
} from "@/utils/dateHelpers";
import { normalizeDateString } from "@/utils/validation";

type SpreadsheetRow = Record<string, unknown>;
export interface ParsedItineraryRow {
  item: ItineraryItem;
  warnings: string[];
  sourceIndex: number;
}

const readString = (value: unknown) => (value == null ? "" : String(value).trim());

const excelSerialToDate = (value: number) => new Date(Math.round((value - 25569) * 86400 * 1000));

const parseDayMonthYearDate = (value: string) => {
  const match = value.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2}|\d{4})$/);
  if (!match) {
    return "";
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = match[3];
  const year = Number(rawYear.length === 2 ? `20${rawYear}` : rawYear);
  const date = new Date(year, month - 1, day, 12, 0, 0);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }

  return toLocalDateInputValue(date);
};

const dateToUtcInputValue = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(
    value.getUTCDate(),
  ).padStart(2, "0")}`;

const formatImportedTime = (value: unknown) => {
  if (value instanceof Date) {
    return formatItineraryTime(
      `${value.getUTCHours()}:${String(value.getUTCMinutes()).padStart(2, "0")}`,
    );
  }

  if (typeof value === "number") {
    const date = excelSerialToDate(value);
    return formatItineraryTime(`${date.getUTCHours()}:${String(date.getUTCMinutes()).padStart(2, "0")}`);
  }

  const raw = readString(value);

  return formatItineraryTime(raw);
};

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

const excelDateToIso = (value: unknown) => {
  if (value instanceof Date) {
    return dateToUtcInputValue(value);
  }

  if (typeof value === "number") {
    const converted = excelSerialToDate(value);
    const date = new Date(
      converted.getUTCFullYear(),
      converted.getUTCMonth(),
      converted.getUTCDate(),
      12,
      0,
      0,
    );
    return toLocalDateInputValue(date);
  }

  const raw = readString(value);
  const dayMonthYearDate = parseDayMonthYearDate(raw);
  if (dayMonthYearDate) {
    return dayMonthYearDate;
  }

  if (/^[A-Za-z]{3,}[-/\s]\d{1,2}$/.test(raw)) {
    return "";
  }

  return normalizeDateString(raw);
};

const resolveMonthDayDate = (
  value: string,
  currentYear: number,
  previousMonthIndex?: number,
) => {
  const match = value.match(/^([A-Za-z]{3,})[-/\s](\d{1,2})$/);
  if (!match) {
    return null;
  }

  const monthIndex = monthLookup[match[1].slice(0, 3).toLowerCase()];
  if (monthIndex == null) {
    return null;
  }

  const nextYear =
    previousMonthIndex != null && monthIndex < previousMonthIndex ? currentYear + 1 : currentYear;
  const date = new Date(nextYear, monthIndex, Number(match[2]), 12, 0, 0);

  return {
    isoDate: toLocalDateInputValue(date),
    year: nextYear,
    monthIndex,
  };
};

const resolveImportedDate = (
  value: unknown,
  currentYear: number,
  previousMonthIndex?: number,
) => {
  const rawDate = readString(value);
  const monthDayDate = resolveMonthDayDate(rawDate, currentYear, previousMonthIndex);
  if (monthDayDate) {
    return monthDayDate;
  }

  const directDate = excelDateToIso(value);
  if (!directDate) {
    return null;
  }

  const parsed = new Date(`${directDate}T12:00:00`);
  return {
    isoDate: directDate,
    year: parsed.getFullYear(),
    monthIndex: parsed.getMonth(),
  };
};

const mapRowToItem = (
  row: SpreadsheetRow,
  tripId: string,
  index: number,
  resolvedDate: string,
): ParsedItineraryRow | null => {
  const routeFrom = readString(row["From"]);
  const routeTo = readString(row["To"]);
  const activity = readString(row["Activity"]);

  if (!routeFrom && !routeTo && !activity) {
    return null;
  }

  const warnings: string[] = [];
  const date = resolvedDate;
  const startTime = formatImportedTime(row["Start Time"]);
  const endTime = formatImportedTime(row["End Time"]);
  const mapsLink = readString(row["Google Maps"]) || undefined;

  if (!date) warnings.push("Missing date");
  if (!startTime) warnings.push("Missing start time");
  if (!endTime) warnings.push("Missing end time");
  if (!routeFrom) warnings.push("Missing from");
  if (!routeTo) warnings.push("Missing to");
  if (!activity) warnings.push("Missing activity");

  return {
    sourceIndex: index,
    warnings,
    item: {
      id: `excel-${index}-${Date.now()}`,
      tripId,
      dayLabel: readString(row["Day"]) || getWeekdayLabel(date),
      date,
      startTime,
      routeFrom,
      endTime,
      routeTo,
      distanceKm: Number(readString(row["Distance (km)"]) || 0) || undefined,
      travelTime: readString(row["Travel Time"]) || undefined,
      timeSpent: readString(row["Time Spent"]) || undefined,
      activity,
      notes: "",
      mapsLink,
      visited: false,
      sortOrder:
        Date.parse(`${date || "9999-12-31"}T00:00:00Z`) + parseTimeToMinutes(startTime) + index / 1000,
      createdAt: new Date().toISOString(),
    },
  };
};

const rowsToObjects = (rows: Row[]) => {
  const [headerRow, ...dataRows] = rows;
  const headers = (headerRow ?? []).map((cell) => readString(cell));

  return dataRows.map((row) =>
    headers.reduce<SpreadsheetRow>((record, header, index) => {
      if (header) {
        record[header] = row[index];
      }
      return record;
    }, {}),
  );
};

export const parseItineraryWorkbookDetailed = async (
  uri: string,
  tripId: string,
  tripStartDate?: string,
): Promise<ParsedItineraryRow[]> => {
  const arrayBuffer = await fetch(uri).then((response) => response.arrayBuffer());
  const rows = rowsToObjects(await readSheet(arrayBuffer));
  const baseYear = tripStartDate ? new Date(`${tripStartDate}T12:00:00`).getFullYear() : new Date().getFullYear();
  let rollingYear = baseYear;
  let previousMonthIndex: number | undefined;

  return rows
    .map((row, index) => {
      const resolvedDate = resolveImportedDate(row["Date"], rollingYear, previousMonthIndex);
      const finalDate = resolvedDate?.isoDate ?? "";

      if (resolvedDate) {
        rollingYear = resolvedDate.year;
        previousMonthIndex = resolvedDate.monthIndex;
      }

      return mapRowToItem(row, tripId, index, finalDate);
    })
    .filter((item): item is ParsedItineraryRow => Boolean(item));
};

export const parseItineraryWorkbook = async (
  uri: string,
  tripId: string,
  tripStartDate?: string,
): Promise<ItineraryItem[]> => {
  const parsed = await parseItineraryWorkbookDetailed(uri, tripId, tripStartDate);
  return parsed.map((entry) => entry.item);
};
