import * as XLSX from "xlsx";

import { ItineraryItem } from "@/types/ItineraryItem";
import { formatItineraryTime, getWeekdayLabel, toLocalDateInputValue } from "@/utils/dateHelpers";
import { normalizeDateString } from "@/utils/validation";
import { parseTimeToMinutes } from "@/utils/dateHelpers";

type SpreadsheetRow = Record<string, unknown>;
export interface ParsedItineraryRow {
  item: ItineraryItem;
  warnings: string[];
  sourceIndex: number;
}

const readString = (value: unknown) => (value == null ? "" : String(value).trim());

const formatImportedTime = (value: unknown) => {
  if (value instanceof Date) {
    return formatItineraryTime(`${value.getHours()}:${String(value.getMinutes()).padStart(2, "0")}`);
  }

  if (typeof value === "number") {
    const converted = XLSX.SSF.parse_date_code(value);
    return formatItineraryTime(`${converted.H}:${String(converted.M).padStart(2, "0")}`);
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
  if (typeof value === "number") {
    const converted = XLSX.SSF.parse_date_code(value);
    const date = new Date(converted.y, converted.m - 1, converted.d, 12, 0, 0);
    return toLocalDateInputValue(date);
  }

  const raw = readString(value);
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

export const parseItineraryWorkbookDetailed = async (
  uri: string,
  tripId: string,
  tripStartDate?: string,
): Promise<ParsedItineraryRow[]> => {
  const workbook = XLSX.read(await fetch(uri).then((response) => response.arrayBuffer()), {
    type: "array",
    cellDates: true,
  });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(firstSheet, { defval: "" });
  const baseYear = tripStartDate ? new Date(`${tripStartDate}T12:00:00`).getFullYear() : new Date().getFullYear();
  let rollingYear = baseYear;
  let previousMonthIndex: number | undefined;

  return rows
    .map((row, index) => {
      const rawDate = readString(row["Date"]);
      const directDate = excelDateToIso(row["Date"]);
      const resolvedMonthDay = resolveMonthDayDate(rawDate, rollingYear, previousMonthIndex);
      const finalDate = resolvedMonthDay?.isoDate ?? directDate;

      if (resolvedMonthDay) {
        rollingYear = resolvedMonthDay.year;
        previousMonthIndex = resolvedMonthDay.monthIndex;
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
