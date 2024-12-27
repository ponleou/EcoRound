import { IonToast } from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";
import { CoordinateContext } from "../context/CoordinateContext";

export default function PermissionToast() {
  const { currentCoords } = useContext(CoordinateContext) as any;
  const [openToast, setOpenToast] = useState(false);
  const toastMessage = useRef("");

  useEffect(() => {
    if (!currentCoords.enabled) {
      setOpenToast(true);
      toastMessage.current = "Location not enabled. Please enable location.";
    } else if (!currentCoords.status) {
      setOpenToast(true);
      toastMessage.current =
        "Location permission not allowed. Please allow location.";
    } else if (!currentCoords.valid) {
      setOpenToast(true);
      toastMessage.current = "Location not supported.";
    } else if (
      currentCoords.status &&
      currentCoords.valid &&
      currentCoords.enabled
    ) {
      setOpenToast(false);
    }
  }, [currentCoords]);

  return (
    <span>
      <IonToast
        isOpen={openToast}
        message={toastMessage.current}
        onDidDismiss={() => setOpenToast(false)}
        duration={5000}
      ></IonToast>
    </span>
  );
}
