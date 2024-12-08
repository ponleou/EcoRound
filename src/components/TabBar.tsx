import { IonIcon, IonTabBar, IonTabButton, IonText } from "@ionic/react";
import {
  homeOutline,
  homeSharp,
  locationOutline,
  locationSharp,
  personCircle,
} from "ionicons/icons";

export default function TabBar() {
  return (
    <IonTabBar>
      <IonTabButton tab="home" href="/home">
        <IonIcon icon={homeSharp} />
        <IonText>Home</IonText>
      </IonTabButton>
      <IonTabButton tab="travel" href="/travel">
        <IonIcon icon={locationSharp} />
        <IonText>Travel</IonText>
      </IonTabButton>
      <IonTabButton>
        <IonIcon icon={personCircle} />
        <IonText>Profile</IonText>
      </IonTabButton>
    </IonTabBar>
  );
}
