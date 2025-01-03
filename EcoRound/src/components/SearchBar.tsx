import { IonIcon } from "@ionic/react";
import { searchSharp } from "ionicons/icons";
import { useState } from "react";
import TravelCard from "./TravelCard";

export default function SearchBar({
  setSearchInput,
  inputRef = null,
  disabled = false,
  isFocused = null,
  searchInput,
}) {
  return (
    <div className="flex justify-center">
      <div className="flex-grow flex rounded-full bg-white items-center justify-between pl-4">
        <label htmlFor="search" className="flex items-center">
          <IonIcon icon={searchSharp}></IonIcon>
        </label>
        <input
          ref={inputRef}
          readOnly={disabled}
          onChange={(e) => setSearchInput(e.target.value)}
          value={searchInput}
          onFocus={() => {
            if (isFocused !== null) isFocused(true);
          }}
          onBlur={() => {
            if (isFocused !== null) isFocused(false);
          }}
          placeholder="Find a location"
          className="border-0 outline-none bg-white rounded-r-full flex-grow pl-3 pr-4 py-2"
          type="text"
          name="search"
          id=""
        />
      </div>
    </div>
  );
}
