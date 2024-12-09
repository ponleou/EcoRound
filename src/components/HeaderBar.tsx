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

  useEffect(() => {
    const hexColor = color
      ? getCssVariableValue("--ion-color-" + color)
      : getCssVariableValue("--ion-color-primary-contrast");

    StatusBar.setBackgroundColor({ color: hexColor });
    setStatusBarStyle();
  });

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
