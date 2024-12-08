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

export default function HeaderBar({
  title,
  color = "",
  textColor = "",
  isStatusDark = false,
}) {
  // Make the status bar blend with header
  function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
  }

  async function setStatusBarStyle() {
    if (isStatusDark) {
      await StatusBar.setStyle({ style: Style.Dark });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
    }
  }

  const hexColor = color
    ? getCssVariableValue("--ion-color-" + color)
    : "#ffffff";

  StatusBar.setBackgroundColor({ color: hexColor });
  setStatusBarStyle();

  return (
    <IonToolbar color={color ? color : ""}>
      <IonButtons slot="start">
        <IonBackButton></IonBackButton>
      </IonButtons>
      <IonTitle color={textColor ? textColor : ""}>{title}</IonTitle>
      <IonButtons slot="end" class="ion-margin-end" collapse={true}>
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
