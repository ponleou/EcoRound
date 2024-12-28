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

  return (
    <DateContext.Provider value={{ date, getCurrentTime }}>
      {children}
    </DateContext.Provider>
  );
}

export { DateContext, DateProvider };
