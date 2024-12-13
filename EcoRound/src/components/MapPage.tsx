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
  IonText,
  IonRouterOutlet,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import {
  ellipsisVertical,
  locate,
  locationSharp,
  print,
  searchSharp,
  swapVertical,
} from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import Map from "../components/Map";

export default function Travel({
  header,
  topContent,
  bottomContent,
  currentCoords,
  setCurrentCoords,
  setCenterCoords,
  startCoords,
  destinationCoords,
}) {
  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">{header}</IonHeader>
      <IonContent>
        {topContent}
        <div className="fixed h-screen top-0 w-screen -z-30">
          <Map
            currentCoords={currentCoords}
            setCurrentCoords={setCurrentCoords}
            setCenterCoords={setCenterCoords}
            startCoords={startCoords}
            destinationCoords={destinationCoords}
          />
        </div>
        {bottomContent}
      </IonContent>
    </IonPage>
  );
}
