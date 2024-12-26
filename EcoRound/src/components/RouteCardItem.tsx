import { IonIcon, IonText, IonButton, IonRippleEffect } from "@ionic/react";
import { walk, chevronForward } from "ionicons/icons";
import IconText from "./IconText";

export default function RouteCardItem({
  text,
  icon,
  isAvailable = false,
  routeStepsNames = [],
  routeDistance = "",
  routeDuration = "",
}) {
  return (
    <div className="flex px-2 gap-4 ion-activatable relative overflow-hidden py-4 rounded-md">
      <IconText icon={icon} text={text} />

      {!isAvailable ? (
        <p className="font-bold items-center justify-end flex grow">
          <IonText>No routes found</IonText>
        </p>
      ) : (
        <div className="flex gap-4 items-center justify-between grow min-w-1">
          <div className="flex flex-col justify-between truncate grow">
            <p className="text-xs truncate grow">
              <IonText className="">
                {routeStepsNames.map(
                  (name, index) =>
                    (name !== "-" ? name + " > " : "") +
                    (index >= routeStepsNames.length - 1 ? "Destination" : "")
                )}
              </IonText>
            </p>
            <p className="text-xs flex gap-2">
              <IonText color={"secondary"}>
                {routeDistance ? routeDistance : ""}
              </IonText>
              <IonText className="font-bold" color={"secondary"}>
                {routeDuration ? routeDuration : ""}
              </IonText>
            </p>
          </div>
          <div className="flex items-center w-fit text-nowrap">
            <div className="text-right flex items-center h-full">
              <p className="font-bold">
                <IonText>200 Points</IonText>
              </p>
            </div>
            <IonButton fill="clear" color="dark" shape="round">
              <IonIcon slot="icon-only" icon={chevronForward}></IonIcon>
            </IonButton>
          </div>
        </div>
      )}
      <IonRippleEffect></IonRippleEffect>
    </div>
  );
}
