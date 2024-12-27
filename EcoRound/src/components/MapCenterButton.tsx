import { useContext } from "react";
import { CoordinateContext } from "../context/CoordinateContext";
import { IonButton, IonIcon } from "@ionic/react";
import { locate } from "ionicons/icons";

export default function MapCenterButton({
  focusCurrentCoords,
  setFocusCurrentCoords,
}) {
  // handles focusing on current location
  const handleCurrentFocus = () => {
    setFocusCurrentCoords(true);
  };

  return (
    <div className="flex flex-col items-end gap-4 m-4">
      <IonButton
        shape="round"
        color={focusCurrentCoords ? "primary" : "light"}
        onClick={() => handleCurrentFocus()}
      >
        <IonIcon slot="icon-only" icon={locate}></IonIcon>
      </IonButton>
    </div>
  );
}
