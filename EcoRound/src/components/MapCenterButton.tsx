import { useContext } from "react";
import { CoordinateContext } from "../context/CoordinateContext";
import { IonButton, IonIcon } from "@ionic/react";
import { locate } from "ionicons/icons";

export default function MapCenterButton() {
  const { focusCurrentCoords } = useContext(CoordinateContext) as any;

  // handles focusing on current location
  const handleCurrentFocus = () => {
    focusCurrentCoords.current = true;
  };

  return (
    <div className="flex flex-col items-end gap-4 m-4">
      <IonButton
        shape="round"
        color={focusCurrentCoords.current ? "primary" : "light"}
        onClick={() => handleCurrentFocus()}
      >
        <IonIcon slot="icon-only" icon={locate}></IonIcon>
      </IonButton>
    </div>
  );
}
