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
  IonModal,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import { searchSharp } from "ionicons/icons";
import "./Travel.css";

export default function Travel() {
  const [searchInput, setSearchInput] = useState("");
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">
        <HeaderBar title="Travel" color="primary" isStatusDark={true} />
      </IonHeader>
      <IonContent>
        {/* Search header */}
        <div className="bg-primary flex justify-center p-4 rounded-b-3xl shadow-lg">
          {/* Search bar */}
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

        {/* Modal */}
        <IonModal
          className="rounded-t-3l"
          ref={modal}
          trigger="open-modal"
          isOpen={true}
          initialBreakpoint={0.5}
          breakpoints={[0.05, 0.25, 0.5, 0.75]}
          backdropDismiss={false}
          backdropBreakpoint={0.5}
        >
          <div className="bg-primary h-full px-4 pb-4 pt-6 flex flex-col gap-4">
            {/* Cards inside modal */}
            <div className="bg-white rounded-lg">
              test
              <p>test</p>
            </div>
            <div className="bg-white">test</div>
            <div className="bg-white">tes2</div>
            <div className="bg-white">test3</div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
