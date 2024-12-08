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
import TabBar from "../components/TabBar";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";

export default function Home() {

  // Make the status bar blend with header
  StatusBar.setBackgroundColor({ color: "#ffffff" });
  const setStatusBarStyleLight = async () => {
    await StatusBar.setStyle({ style: Style.Light });
  };

  useEffect(() => {
    setStatusBarStyleLight();
  }, []);


  return (
    // Header section
    <IonPage>
      <IonHeader className="no-shadow" translucent={true}>
        <IonToolbar>
          <IonTitle color="primary">EcoRound</IonTitle>
          <IonButtons slot="end" class="ion-margin-end" collapse={true}>
            <IonButton size="small" color="primary" shape="round">
              <IonIcon icon={ellipsisVertical}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* collapseible header section for iOS */}
        <IonHeader collapse="condense">
          <IonToolbar class="ion-justify-content-center">
            <IonTitle color="primary" size="large">EcoRound</IonTitle>
            <IonButtons slot="end" class="ion-margin-end">
              <IonButton size="small" shape="round">
                <IonIcon icon={ellipsisVertical}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <p>1</p>
        <p>2</p>
        <p>3</p>
        <p>5</p>
        <p>6</p>
        <p>7</p>
        <p>8</p>
        <p>9</p>
        <p>h</p>
        <p>3</p>
        <p>3</p>
        <p>4</p>
        <p>9</p>
        <p>9</p>
        <p>9</p>
        <p>9</p>
        <p>9</p>
        <p>9</p>
        <p>9</p>
        <p>9 </p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>
        <p>2</p>

      </IonContent>

      <TabBar />
    </IonPage>
  );
};