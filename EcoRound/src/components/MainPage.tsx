import {
  IonPage,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
} from "@ionic/react";
import { ellipsisVertical } from "ionicons/icons";
import HeaderBar from "./HeaderBar";
import TabBar from "./TabBar";

export default function MainPage({ title, children }) {
  return (
    <IonPage>
      <IonHeader translucent={true} className="shadow-lg">
        <HeaderBar title={title} textColor="primary" />
      </IonHeader>

      <IonContent fullscreen>
        {/* collapseible header section for iOS */}
        <IonHeader collapse="condense">
          <IonToolbar class="ion-justify-content-center">
            <IonTitle color="primary" size="large">
              {title}
            </IonTitle>
            <IonButtons slot="end" class="ion-margin-end">
              <IonButton size="small" shape="round">
                <IonIcon icon={ellipsisVertical}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        {children}
      </IonContent>
      <IonFooter>
        <TabBar />
      </IonFooter>
    </IonPage>
  );
}
