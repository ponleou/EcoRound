import { IonIcon } from "@ionic/react";
import { searchSharp } from "ionicons/icons";
import { useState } from "react";

export default function SearchBar() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="bg-primary  p-4 rounded-b-3xl shadow-lg">
      <div className="flex justify-center">
        <div className="flex-grow flex rounded-full bg-white items-center justify-between pl-4">
          <IonIcon icon={searchSharp}></IonIcon>
          <input
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Find a location"
            className="border-0 outline-none bg-white rounded-r-full flex-grow pl-3 pr-4 py-2"
            type="text"
            name=""
            id=""
          />
        </div>
      </div>
    </div>
  );
}
