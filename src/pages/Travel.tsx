import { StatusBar, Style } from "@capacitor/status-bar";
import {
  IonPage,
  IonContent,
  IonButton,
  useIonRouter,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect } from "react";
import HeaderBar from "../components/HeaderBar";

export default function Travel() {
  return (
    <IonPage>
      <IonHeader>
        <HeaderBar title="Travel" color="primary" isStatusDark={true} />
      </IonHeader>
      <IonContent>test2</IonContent>
    </IonPage>
  );
}
