import { IonButton, IonIcon, IonRippleEffect, IonText } from "@ionic/react";
import { chevronForward, star } from "ionicons/icons";
import { DateContext } from "../context/DateContext";
import { useContext } from "react";

export default function TransitRouteItem({
  startTime = "",
  endTime = "",
  points = "",
  subTexts = [],
  path = [],
}) {
  const { toCurrentTimezone, to12HourFormat } = useContext(DateContext) as any;

  const formatTime = (time) => {
    return to12HourFormat(toCurrentTimezone(time).split("T")[1]).split("+")[0];
  };

  return (
    <div className="flex px-2 gap-4 ion-activatable relative overflow-hidden py-4 rounded-md">
      <div className="flex flex-col justify-between grow">
        <p>
          <IonText>
            {formatTime(startTime) + " - " + formatTime(endTime)}
          </IonText>
        </p>
        <p>
          {subTexts.map((subText, index) => (
            <IonText
              key={index}
              color={"secondary"}
              className={subTexts.length - 1 <= index ? "font-bold" : ""}
            >
              {subText}
            </IonText>
          ))}
        </p>
      </div>
      <div className="flex items-center w-fit text-nowrap">
        <div className="text-right flex items-center h-full">
          <p className="font-bold">
            <IonText>{points ? points : ""}</IonText>
          </p>
        </div>
        <IonButton fill="clear" color="dark" shape="round" size="small">
          <IonIcon
            slot="icon-only"
            size="small"
            icon={chevronForward}
          ></IonIcon>
        </IonButton>
      </div>
      <IonRippleEffect></IonRippleEffect>
    </div>
  );
}
