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
  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">
        <HeaderBar title="Travel" color="primary" isStatusDark={true} />
      </IonHeader>
      <IonContent></IonContent>
    </IonPage>
  );
}
