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
  useIonRouter,
} from "@ionic/react";
import {
  homeOutline,
  personCircleOutline,
  locationOutline,
  ellipsisVertical,
  footsteps,
  ticket,
} from "ionicons/icons";
import TabBar from "../components/TabBar";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import PermissionToast from "../components/PermissionToast";
import HomeCard from "../components/HomeCard";
import CardList from "../components/CardList";
import { Icon } from "leaflet";
import IconText from "../components/IconText";

export default function Home() {
  return (
    // Header section
    <IonPage>
      <IonHeader translucent={true} className="shadow-lg">
        <HeaderBar title="EcoRound" textColor="primary" />
      </IonHeader>

      <IonContent fullscreen>
        {/* collapseible header section for iOS */}
        <IonHeader collapse="condense">
          <IonToolbar class="ion-justify-content-center">
            <IonTitle color="primary" size="large">
              EcoRound
            </IonTitle>
            <IonButtons slot="end" class="ion-margin-end">
              <IonButton size="small" shape="round">
                <IonIcon icon={ellipsisVertical}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <PermissionToast />

        <div className="p-4">
          <CardList>
            <HomeCard>
              <div className="flex flex-col gap-2">
                <IconText
                  icon={footsteps}
                  text="Carbon Footprint"
                  col={false}
                  iconSize="small"
                  textSize="large"
                  textBold={true}
                ></IconText>
                <IonText>
                  <p className=" text-gray-500">
                    You have saved {Math.round(Math.random() * 100)} gCO
                    <sub>2</sub>e of carbon emissions today.
                  </p>
                </IonText>
              </div>
            </HomeCard>
            <HomeCard>
              <div className="flex flex-col gap-2">
                <IconText
                  icon={ticket}
                  text="Reward Points"
                  col={false}
                  iconSize="small"
                  textSize="large"
                  textBold={true}
                ></IconText>
                <IonText>
                  <p className=" text-gray-500">
                    You have saved up {Math.round(Math.random() * 100)} reward
                    points!
                  </p>
                </IonText>
              </div>
            </HomeCard>
          </CardList>
        </div>
      </IonContent>
      <IonFooter>
        <TabBar />
      </IonFooter>
    </IonPage>
  );
}
