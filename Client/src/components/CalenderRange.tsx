import { ArrowLeft, ArrowRight } from "lucide-react";
import type { DateRange } from "../types";

interface CalenderRangeProps {
  value?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
}

function CalenderRange({ value, onChange }: CalenderRangeProps) {
  const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const onChangeHandle = (event: Event) => {
    console.log("Calendar changed:", (event.target as HTMLInputElement)?.value as string);
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
    const blocked = ["2026-04-16", "2026-04-17"];

    const formatted = date.toISOString().split("T")[0];

    return blocked.includes(formatted);
  };

  return (
    <div className="w-fit">
      <calendar-range
        value={value ? `${new Date(value.startDate).toISOString().split("T")[0]}/${new Date(value.endDate).toISOString().split("T")[0]}` : ""}
        className="cally w-fit"
        min={new Date().toISOString().split("T")[0]}
        onchange={onChangeHandle}
        months={1}
        locale="es-DO"
        isDateDisallowed={isDateDisallowed}
      >
        <ArrowLeft className="w-6 h-6" slot="previous" aria-label="Previous" />
        <ArrowRight className="w-6 h-6" slot="next" aria-label="Next" />
        <calendar-month></calendar-month>
      </calendar-range>
    </div>
  )
}

export default CalenderRange;