import { StatusBar, Style } from "@capacitor/status-bar";
import {
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { ellipsisVertical } from "ionicons/icons";
import { useEffect } from "react";

export default function HeaderBar({
  title,
  color = "",
  textColor = "",
  isStatusDark = false,
}) {
  console.log("rendered");
  // Make the status bar blend with header
  function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
  }

  const hexColor = color
    ? getCssVariableValue("--ion-color-" + color)
    : "#ffffff";

  StatusBar.setBackgroundColor({ color: hexColor });

  async function setStatusBarStyle() {
    console.log("setStatusBarStyle");
    if (isStatusDark) {
      await StatusBar.setStyle({ style: Style.Dark });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
    }
  }

  useEffect(() => {
    setStatusBarStyle();
  }, [setStatusBarStyle]);

  return (
    <IonToolbar color={color ? color : ""}>
      <IonTitle color={textColor ? textColor : ""}>{title}</IonTitle>
      <IonButtons slot="end" class="ion-margin-end" collapse={true}>
        <IonButton
          href="/travel"
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
