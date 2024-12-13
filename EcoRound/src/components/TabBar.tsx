import {
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonText,
  useIonRouter,
} from "@ionic/react";
import {
  homeOutline,
  homeSharp,
  locationOutline,
  locationSharp,
  personCircle,
} from "ionicons/icons";

export default function TabBar() {
  const navigation = useIonRouter();

  function handleTabClick(page) {
    navigation.push(page, "forward");
  }

  return (
    <IonTabBar>
      <IonTabButton
        tab="home"
        href="/home"
        onClick={() => handleTabClick("home")}
      >
        <IonIcon icon={homeSharp} />
        <IonText>Home</IonText>
      </IonTabButton>
      <IonTabButton
        tab="travel"
        href="/travel"
        onClick={() => handleTabClick("travel")}
      >
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
