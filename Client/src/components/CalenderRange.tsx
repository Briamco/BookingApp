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
  const formatDate = (date: Date | string) => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const onChangeHandle = (event: Event) => {
    const [start, end] = ((event.target as HTMLInputElement)?.value as string).split("/");
    if (start && end && onChange) {
      onChange({
        startDate: parseDate(start),
        endDate: parseDate(end),
      });
    } else if (onChange) {
      onChange(null);
    }
  }

  const isDateDisallowed = (date: Date) => {
    const currentDate = formatDate(date);

    return disabledRanges.some(({ startDate, endDate }) => {
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      return currentDate >= start && currentDate <= end;
    });
  };

  return (
    <div className="w-full">
      <calendar-range
        value={value ? `${formatDate(value.startDate)}/${formatDate(value.endDate)}` : ""}
        className="cally w-full"
        min={formatDate(new Date())}
        onchange={onChangeHandle}
        months={months}
        locale="es-DO"
        isDateDisallowed={isDateDisallowed}
      >
        <ArrowLeft className="w-6 h-6" slot="previous" aria-label="Previous" />
        <ArrowRight className="w-6 h-6" slot="next" aria-label="Next" />
        <div className="flex gap-4 flex-row w-full justify-center">
          <calendar-month></calendar-month>
          {months > 1 && <calendar-month offset={1}></calendar-month>}
        </div>
      </calendar-range>
    </div>
  )
}

export default CalenderRange;