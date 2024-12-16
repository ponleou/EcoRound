import { IonIcon, IonText, IonButton } from "@ionic/react";
import { walk, chevronForward } from "ionicons/icons";

export default function RouteCardItem({ text, icon, route, setMapPath }) {
  const handleClick = () => {
    setMapPath(route.coordinates);
  };

  return (
    <div className="flex px-2 gap-4">
      <div className="flex flex-col justify-center gap-1 w-fit">
        <IonIcon size="large" icon={icon}></IonIcon>
        <p className="text-xs w-full text-center">
          <IonText>{text}</IonText>
        </p>
      </div>

      {route.error ? (
        "No routes found"
      ) : (
        <div className="flex gap-4 items-center justify-between grow w-1">
          <div className="flex flex-col justify-between truncate grow">
            <p className="text-xs truncate grow">
              <IonText className="">
                {route.steps.map((step) =>
                  step.name !== "-" ? step.name + " > " : ""
                )}
              </IonText>
            </p>
            <p className="text-xs flex gap-2">
              <IonText color={"secondary"}>
                {route.distance ? route.distance : ""}
              </IonText>
              <IonText className="font-bold" color={"secondary"}>
                {route.duration ? route.duration : ""}
              </IonText>
            </p>
          </div>
          <div className="flex items-center w-fit text-nowrap">
            <div className="text-right flex items-center h-full">
              <p className="font-bold">
                <IonText>200 Points</IonText>
              </p>
            </div>
            {route.coordinates.length > 0 ? (
              <IonButton
                onClick={() => handleClick()}
                fill="clear"
                color="dark"
                shape="round"
              >
                <IonIcon slot="icon-only" icon={chevronForward}></IonIcon>
              </IonButton>
            ) : (
              ""
            )}
          </div>
        </div>
      )}
    </div>
  );
}
