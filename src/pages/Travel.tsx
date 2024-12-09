import { StatusBar, Style } from "@capacitor/status-bar";
import {
  IonPage,
  IonContent,
  IonButton,
  useIonRouter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
} from "@ionic/react";
import { useEffect, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import { searchSharp } from "ionicons/icons";

export default function Travel() {
  const [searchInput, setSearchInput] = useState("");

  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">
        <HeaderBar title="Travel" color="primary" isStatusDark={true} />
      </IonHeader>
      <IonContent>
        <div className="bg-primary flex justify-center p-4 rounded-b-3xl shadow-lg">
          <div className="flex-grow flex rounded-3xl bg-white items-center justify-between pl-4">
            <IonIcon icon={searchSharp}></IonIcon>
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Find a location"
              className="border-0 outline-none bg-white rounded-r-3xl flex-grow pl-3 pr-4 py-2"
              type="text"
              name=""
              id=""
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
