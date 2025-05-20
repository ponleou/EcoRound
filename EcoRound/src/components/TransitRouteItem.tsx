import { IonButton, IonIcon, IonRippleEffect, IonText } from "@ionic/react";
import { bus, chevronForward, star, walk } from "ionicons/icons";
import { DateContext } from "../context/DateContext";
import { useContext, useEffect, useRef } from "react";
import IconText from "./IconText";

export default function TransitRouteItem({
  startTime = "",
  endTime = "",
  points = "",
  subTexts = [],
  paths = [],
}) {
  const { toCurrentTimezone, to12HourFormat } = useContext(DateContext) as any;

  const dayChanged = useRef(false);

  useEffect(() => {
    if (startTime && endTime) {
      dayChanged.current =
        toCurrentTimezone(startTime).split("T")[0] !==
        toCurrentTimezone(endTime).split("T")[0];
    }
  }, [startTime, endTime]);

  const formatTime = (time) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(time);
    return (
      (dayChanged.current ? days[date.getDay()] + " " : "") +
      to12HourFormat(toCurrentTimezone(time).split("T")[1]).split("+")[0]
    );
  };

  return (
    <div className="flex px-2 gap-4 ion-activatable relative overflow-hidden py-4 rounded-md">
      <div className="flex flex-col justify-between grow min-w-1 gap-2 truncate">
        <p className="flex truncate">
          <IonText className="truncate">
            {formatTime(startTime) + " - " + formatTime(endTime)}
          </IonText>
        </p>
        <div className="flex gap-x-2 gap-y-0.5 items-center grow flex-wrap">
          {paths.map((path, index) => (
            <span className="flex items-center gap-2" key={path.key}>
              {path.isTransit ? (
                <div className="border-1 px-2 py-0.5 rounded-full border-2 border-primary">
                  <IconText
                    icon={path.mode.toLowerCase() === "bus" ? bus : null}
                    text={path.code}
                    iconSize="small"
                    col={false}
                  />
                </div>
              ) : (
                <div>
                  <IconText
                    icon={path.mode.toLowerCase() === "walk" ? walk : null}
                    text={path.duration}
                    iconSize="small"
                    col={false}
                  />
                </div>
              )}
              <IonText>{index < paths.length - 1 && ">"}</IonText>
            </span>
          ))}
        </div>
        <div className="text-xs flex gap-2">
          {subTexts.map((subText, index) => (
            <IonText
              key={subText.key}
              color={"secondary"}
              className={
                subTexts.length - 1 <= index ? "font-bold truncate" : ""
              }
            >
              {subText}
            </IonText>
          ))}
        </div>
      </div>
      <div className="flex items-center w-fit text-nowrap gap-2">
        <div className="text-right flex items-center h-full">
          <div className="font-bold">
            <IonText>{points ? points : ""}</IonText>
          </div>
        </div>
        <IonIcon slot="icon-only" size="small" icon={chevronForward}></IonIcon>
      </div>
      <IonRippleEffect></IonRippleEffect>
    </div>
  );
}
