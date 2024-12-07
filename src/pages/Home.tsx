import {
  IonContent,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
} from "@ionic/react";
import {
  homeOutline,
  personCircleOutline,
  locationOutline,
  ellipsisVertical,
} from "ionicons/icons";
import "./Home.css";

export default function Home() {
  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>EcoRound</IonTitle>

        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

      </IonContent>

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
    </IonPage>
  );
};