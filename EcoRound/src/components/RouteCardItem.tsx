import { IonIcon, IonText, IonButton } from "@ionic/react";
import { walk, chevronForward } from "ionicons/icons";

export default function RouteCardItem({ text, icon, route }) {
  return (
    <div className="flex justify-between px-2">
      <div className="flex flex-col justify-center gap-1">
        <IonIcon size="large" icon={icon}></IonIcon>
        <p className="text-xs w-full text-center">
          <IonText>{text}</IonText>
        </p>
      </div>
      <div className="flex justify-center items-center">
        <div className="text-right flex flex-col justify-between h-full">
          <p>
            <IonText>200 Points</IonText>
          </p>
          <p className="text-xs flex gap-2">
            <IonText color={"secondary"}>
              {route.distance ? route.distance : ""}
            </IonText>
            <IonText color={"secondary"}>
              {route.duration ? route.duration : ""}
            </IonText>
          </p>
        </div>
        {route.coordinates.length > 0 ? (
          <IonButton fill="clear" color="dark" shape="round">
            <IonIcon slot="icon-only" icon={chevronForward}></IonIcon>
          </IonButton>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
