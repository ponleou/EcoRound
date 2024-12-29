import { createContext } from "react";

const DateContext = createContext({});

function DateProvider({ children }) {
  const date = new Date();

  const getCurrentTime = () => {
    const date = new Date();

    // Get the current date and time components in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Construct the formatted date string
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    // Get the timezone offset in minutes
    const timezoneOffset = date.getTimezoneOffset();

    // Calculate the sign (+ or -) for the offset
    const sign = timezoneOffset > 0 ? "-" : "+";

    // Calculate hours and minutes for the offset
    const offsetHours = String(
      Math.abs(Math.floor(timezoneOffset / 60))
    ).padStart(2, "0");
    const offsetMinutes = String(Math.abs(timezoneOffset % 60)).padStart(
      2,
      "0"
    );

    // Combine the formatted date with the timezone offset
    return `${formattedDate}${sign}${offsetHours}:${offsetMinutes}`;
  };

  const toCurrentTimezone = (dateString) => {
    // Parse the input date string
    const [datePart, timezonePart] = dateString.split("+");
    const inputTimezone = parseInt(timezonePart);

    // Create a date object treating the input as if it were UTC
    const inputDate = new Date(datePart + "Z");

    // Adjust for the actual input timezone
    const actualUTC = new Date(
      inputDate.getTime() - inputTimezone * 60 * 60 * 1000
    );

    // Convert to local time
    const localDate = new Date(actualUTC);

    // Format the date
    const pad = (num) => num.toString().padStart(2, "0");
    const formattedDate = `${localDate.getFullYear()}-${pad(
      localDate.getMonth() + 1
    )}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(
      localDate.getMinutes()
    )}:${pad(localDate.getSeconds())}`;

    // Get the local timezone offset
    const offset = -localDate.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? "+" : "-";
    const formattedOffset = `${offsetSign}${pad(offsetHours)}:${pad(
      offsetMinutes
    )}`;

    return `${formattedDate}${formattedOffset}`;
  };

  const to12HourFormat = (time24) => {
    // Parse the input time
    const [hours24, minutes] = time24.split(":").map(Number);

    // Determine AM or PM
    const period = hours24 >= 12 ? "pm" : "am";

    // Convert hours to 12-hour format
    let hours12 = hours24 % 12;
    hours12 = hours12 ? hours12 : 12; // If hours12 is 0, set it to 12

    // Pad single-digit hours and minutes with leading zeros
    const paddedHours = hours12.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");

    // Return the formatted time
    return `${paddedHours}:${paddedMinutes} ${period}`;
  };

  return (
    <DateContext.Provider
      value={{ date, getCurrentTime, toCurrentTimezone, to12HourFormat }}
    >
      {children}
    </DateContext.Provider>
  );
}

export { DateContext, DateProvider };
