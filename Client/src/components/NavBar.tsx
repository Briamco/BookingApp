import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Bell, Search, Calendar as CalendarIcon, Plus, Minus } from "lucide-react";
import LoginButton from "./auth/LoginButton";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import CalenderRange from "./CalenderRange";
import type { DateRange } from "../types";
import { useProperty } from "../hooks/useProperty";

const formatToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateFromQueryParam = (value: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const MAX_GUESTS = 16;

function NavBar() {
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useNotification();
  const { properties } = useProperty();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [destination, setDestination] = useState("");
  const [selectedDates, setSelectedDates] = useState<DateRange | null>(null);
  const [guests, setGuests] = useState(0);
  const [guestDraft, setGuestDraft] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showGuestPopover, setShowGuestPopover] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  const hasPublishedProperties = useMemo(() => {
    if (!user) return false;

    const currentUserId = user.id.toLowerCase();
    return properties.some((property) => property.hostId.toLowerCase() === currentUserId);
  }, [properties, user]);

  useEffect(() => {
    setDestination(searchParams.get("location") ?? "");

    const startDate = dateFromQueryParam(searchParams.get("startDate"));
    const endDate = dateFromQueryParam(searchParams.get("endDate"));

    if (startDate && endDate) {
      setSelectedDates({ startDate, endDate });
    } else {
      setSelectedDates(null);
    }

    const guestValue = searchParams.get("guests") ?? searchParams.get("minCapcity");
    const parsedGuests = guestValue ? Number(guestValue) : 0;
    const safeGuests = Number.isNaN(parsedGuests) ? 0 : parsedGuests;

    setGuests(safeGuests);
    setGuestDraft(safeGuests > 0 ? safeGuests : 1);
  }, [searchParams]);

  const handleDateChange = (newDates: DateRange | null) => {
    setSelectedDates(newDates);
    if (newDates) {
      setShowCalendar(false);
    }
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (destination.trim()) params.set("location", destination.trim());

    if (selectedDates?.startDate) {
      params.set("startDate", formatToYYYYMMDD(selectedDates.startDate));
    }

    if (selectedDates?.endDate) {
      params.set("endDate", formatToYYYYMMDD(selectedDates.endDate));
    }

    if (guests > 0) {
      params.set("guests", String(guests));
      params.set("minCapcity", String(guests));
    }

    navigate({
      pathname: "/",
      search: params.toString() ? `?${params.toString()}` : ""
    });

    setShowCalendar(false);
  };

  const dateRangeDisplay = selectedDates && selectedDates.startDate && selectedDates.endDate
    ? `${selectedDates.startDate.toDateString()} to ${selectedDates.endDate.toDateString()}`
    : "";

  const guestDisplay = guests > 0 ? `${guests} ${guests === 1 ? "guest" : "guests"}` : "Add guest";

  const openGuestPopover = () => {
    setGuestDraft(guests > 0 ? guests : 1);
    setShowGuestPopover((current) => !current);
  };

  const saveGuestPopover = () => {
    setGuests(guestDraft);
    setShowGuestPopover(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }

      if (guestRef.current && !guestRef.current.contains(event.target as Node)) {
        setShowGuestPopover(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  return (
    <nav className="bg-base-300 shadow-sm px-4 py-3">
      <div className="mx-auto flex w-full items-center justify-between gap-4">
        {/* Logo */}
        <div className="shrink-0">
          <Link to="/" className="btn btn-ghost text-xl">BookingApp</Link>
        </div>

        {/* Search Bar - Centered */}
        <form
          onSubmit={handleSearch}
          className="flex-1 flex justify-center"
        >
          <div className="flex w-full max-w-3xl items-stretch overflow-visible rounded-full border border-base-300 bg-base-100 shadow-lg">
            <div className="min-w-0 flex-1 px-4 pl-8 py-2">
              <p className="text-xs font-semibold">Where</p>
              <input
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Search destinations"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>

            <div className="hidden w-px bg-base-300 sm:block" />

            <div className="hidden sm:flex min-w-48 px-4 py-2 relative" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full text-left flex items-center justify-between hover:bg-base-200 rounded-lg px-2 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold">When</p>
                  <p className="text-sm text-base-content/70 truncate">
                    {dateRangeDisplay || "Select dates"}
                  </p>
                </div>
                <CalendarIcon className="h-4 w-4 ml-2 shrink-0 text-base-content/50" />
              </button>

              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-base-100 border border-base-300 rounded-2xl shadow-2xl p-4 w-max">
                  <CalenderRange
                    value={selectedDates}
                    onChange={handleDateChange}
                    months={2}
                  />
                </div>
              )}
            </div>

            <div className="hidden w-px bg-base-300 lg:block" />

            <div className="hidden lg:flex min-w-40 px-4 py-2 relative" ref={guestRef}>
              <button
                type="button"
                onClick={openGuestPopover}
                className="w-full text-left flex items-center justify-between hover:bg-base-200 rounded-lg px-2 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold">Who</p>
                  <p className="text-sm text-base-content/70 truncate">
                    {guestDisplay}
                  </p>
                </div>
              </button>

              {showGuestPopover && (
                <div className="absolute top-full left-0 mt-2 z-50 w-80 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-2xl">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold">Guests</h3>
                      <p className="text-sm text-base-content/70">Select how many guests will stay</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-base-300 p-4">
                    <div>
                      <p className="text-xs font-bold">TOTAL GUESTS</p>
                      <p className="text-2xl font-semibold">
                        {guestDraft} {guestDraft === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-ghost"
                        onClick={() => setGuestDraft((current) => Math.max(1, current - 1))}
                        aria-label="Decrease guests"
                        disabled={guestDraft <= 1}
                      >
                        <Minus />
                      </button>
                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-ghost"
                        onClick={() => setGuestDraft((current) => Math.min(MAX_GUESTS, current + 1))}
                        aria-label="Increase guests"
                        disabled={guestDraft >= MAX_GUESTS}
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-base-content/70">
                    Maximum capacity is {MAX_GUESTS} guests.
                  </p>

                  <div className="mt-5 flex justify-end gap-2">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowGuestPopover(false)}>
                      Cancel
                    </button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={saveGuestPopover}>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="m-2 grid h-11 w-11 place-items-center rounded-full btn btn-primary btn-circle hover:scale-110 transition-transform">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="shrink-0 flex items-center gap-2">
          {isAuthenticated && (
            <>
              {!hasPublishedProperties && (
                <Link to="/my-properties" className="btn btn-ghost rounded-full hidden md:inline-flex">
                  Become a host
                </Link>
              )}
              <Link to="/my-notifications" className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="indicator-item badge badge-error badge-sm animate-bounce">{unreadCount}</span>}
                </div>
              </Link>
            </>
          )}
          <LoginButton />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;