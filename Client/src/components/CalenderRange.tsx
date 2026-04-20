import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DateRange } from "../types";

interface CalenderRangeProps {
  value?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
  months?: number;
  disabledRanges?: Array<{
    startDate: Date | string;
    endDate: Date | string;
  }>;
}

function CalenderRange({ value, onChange, months = 2, disabledRanges = [] }: CalenderRangeProps) {
  const [tentativeStartDate, setTentativeStartDate] = useState<Date | null>(null);

  const normalizeDate = (date: Date | string) => {
    if (date instanceof Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    // Treat any ISO-like string as date-only to avoid timezone day shifts.
    const datePartMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (datePartMatch) {
      const [, yearString, monthString, dayString] = datePartMatch;
      const year = Number(yearString);
      const month = Number(monthString);
      const day = Number(dayString);
      return new Date(year, month - 1, day);
    }

    const parsedDate = new Date(date);
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  };

  const formatDate = (date: Date | string) => {
    const parsedDate = normalizeDate(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const parseFormattedDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getIsoDateKey = (date: Date) => date.toISOString().split("T")[0];

  const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  };

  const compareDates = (left: Date, right: Date) => formatDate(left).localeCompare(formatDate(right));

  const sortedDisabledRanges = useMemo(
    () =>
      [...disabledRanges]
        .map(({ startDate, endDate }) => ({
          startDate: parseFormattedDate(formatDate(startDate)),
          endDate: parseFormattedDate(formatDate(endDate)),
        }))
        .sort((left, right) => compareDates(left.startDate, right.startDate)),
    [disabledRanges],
  );

  const getRangeEndLimit = (startDate: Date) => {
    const nextBlockedRange = sortedDisabledRanges.find((range) => compareDates(range.startDate, startDate) > 0);

    return nextBlockedRange ? addDays(nextBlockedRange.startDate, -1) : null;
  };

  const isRangeValid = (startDate: Date, endDate: Date) => {
    const startKey = formatDate(startDate);
    const endKey = formatDate(endDate);

    return !sortedDisabledRanges.some(({ startDate: blockedStart, endDate: blockedEnd }) => {
      const blockedStartKey = formatDate(blockedStart);
      const blockedEndKey = formatDate(blockedEnd);

      return startKey <= blockedEndKey && endKey >= blockedStartKey;
    });
  };

  const onChangeHandle = (event: Event) => {
    const [start, end] = ((event.target as HTMLInputElement)?.value as string).split("/");
    if (start && end && onChange) {
      const nextStartDate = parseDate(start);
      const nextEndDate = parseDate(end);

      if (isRangeValid(nextStartDate, nextEndDate)) {
        onChange({
          startDate: nextStartDate,
          endDate: nextEndDate,
        });
      } else {
        onChange(null);
      }
    } else if (onChange) {
      onChange(null);
    }

    setTentativeStartDate(null);
  }

  const isDateDisallowed = (date: Date) => {
    const currentDate = getIsoDateKey(date);

    return disabledRanges.some(({ startDate, endDate }) => {
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      return currentDate >= start && currentDate <= end;
    });
  };

  const selectionMaxDate = tentativeStartDate ? getRangeEndLimit(tentativeStartDate) : null;

  useEffect(() => {
    if (!value) {
      setTentativeStartDate(null);
    }
  }, [value]);

  return (
    <div className="w-full">
      <calendar-range
        value={value ? `${formatDate(value.startDate)}/${formatDate(value.endDate)}` : ""}
        className="cally w-full"
        min={formatDate(new Date())}
        max={selectionMaxDate ? formatDate(selectionMaxDate) : undefined}
        onchange={onChangeHandle}
        onrangestart={(event: CustomEvent<Date>) => setTentativeStartDate(parseDate(getIsoDateKey(event.detail)))}
        onrangeend={() => setTentativeStartDate(null)}
        months={months}
        locale="es-DO"
        isDateDisallowed={isDateDisallowed}
      >
        <ArrowLeft className="w-6 h-6" slot="previous" aria-label="Previous" />
        <ArrowRight className="w-6 h-6" slot="next" aria-label="Next" />
        <div className="flex gap-4 flex-row w-full justify-center">
          <calendar-month></calendar-month>
          {months > 1 && <calendar-month offset={1} className="hidden sm:block"></calendar-month>}
        </div>
      </calendar-range>
    </div>
  )
}

export default CalenderRange;