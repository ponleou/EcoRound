import { IonIcon, IonTabBar, IonTabButton, IonText } from "@ionic/react";
import { homeOutline, locationOutline, personCircleOutline } from "ionicons/icons";

export default function TabBar() {
  return (
    <IonTabBar>
      <IonTabButton>
        <IonIcon icon={homeOutline} />
        <IonText>Home</IonText>
      </IonTabButton>
      <IonTabButton>
        <IonIcon icon={locationOutline} />
        <IonText>Travel</IonText>
      </IonTabButton>
      <IonTabButton>
        <IonIcon icon={personCircleOutline} />
        <IonText>Profile</IonText>
      </IonTabButton>
    </IonTabBar>
  );
}
