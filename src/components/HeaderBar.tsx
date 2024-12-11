import { StatusBar, Style } from "@capacitor/status-bar";
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBackButton,
} from "@ionic/react";
import { ellipsisVertical } from "ionicons/icons";
import { useEffect } from "react";

export default function HeaderBar({ title, color = "", textColor = "" }) {
  return (
    <IonToolbar color={color ? color : ""}>
      <IonButtons slot="start" class="ion-margin-start">
        <IonBackButton></IonBackButton>
      </IonButtons>
      <IonTitle class="ion-no-padding" color={textColor ? textColor : ""}>
        {title}
      </IonTitle>
      <IonButtons slot="end" collapse={true} class="ion-margin-end">
        <IonButton
          size="small"
          color={textColor ? textColor : ""}
          shape="round"
        >
          <IonIcon icon={ellipsisVertical}></IonIcon>
        </IonButton>
      </IonButtons>
    </IonToolbar>
  );
}
