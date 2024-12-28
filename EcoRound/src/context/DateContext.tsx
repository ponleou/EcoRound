import { createContext } from "react";

const DateContext = createContext({});

function DateProvider({ children }) {
  const date = new Date();

  const getCurrentTime = () => {
    const date = new Date();
    const timezoneOffset = date.getTimezoneOffset();
    const sign = timezoneOffset > 0 ? "-" : "+";
    const hours = String(Math.abs(Math.floor(timezoneOffset / 60))).padStart(
      2,
      "0"
    );
    const minutes = String(Math.abs(timezoneOffset % 60)).padStart(2, "0");
    const formattedDate = date.toISOString().slice(0, 19); // Get 'YYYY-MM-DDTHH:MM:SS'

    return `${formattedDate}${sign}${hours}:${minutes}`;
  };

  return (
    <DateContext.Provider value={{ date, getCurrentTime }}>
      {children}
    </DateContext.Provider>
  );
}

export { DateContext, DateProvider };
