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
  ticket,
} from "ionicons/icons";

export default function TabBar() {
  const navigation = useIonRouter();

  function handleTabClick(page, replace = false) {
    if (replace) {
      navigation.push(page, "none", "replace");
    } else {
      navigation.push(page, "forward");
    }
  }

  return (
    <IonTabBar>
      <IonTabButton
        tab="home"
        href="/home"
        onClick={() => handleTabClick("home", true)}
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
      <IonTabButton
        tab="rewards"
        href="/rewards"
        onClick={() => handleTabClick("rewards", true)}
      >
        <IonIcon icon={ticket} />
        <IonText>Rewards</IonText>
      </IonTabButton>
      <IonTabButton
        tab="profile"
        href="/profile"
        onClick={() => handleTabClick("profile", true)}
      >
        <IonIcon icon={personCircle} />
        <IonText>Profile</IonText>
      </IonTabButton>
    </IonTabBar>
  );
}
