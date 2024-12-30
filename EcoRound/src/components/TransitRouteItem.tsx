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
      dayChanged.current = startTime.split("T")[0] !== endTime.split("T")[0];
    }
  }, [startTime, endTime]);

  const formatTime = (time) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(time.split("T")[0]);
    return (
      (dayChanged.current ? days[date.getDay()] + " " : "") +
      to12HourFormat(toCurrentTimezone(time).split("T")[1]).split("+")[0]
    );
  };

  return (
    <div className="flex px-2 gap-4 ion-activatable relative overflow-hidden py-4 rounded-md">
      <div className="flex flex-col justify-between grow min-w-1 gap-2 truncate">
        <p>
          <IonText>
            {formatTime(startTime) + " - " + formatTime(endTime)}
          </IonText>
        </p>
        <div className="flex gap-1 items-center grow truncate">
          {paths.map((path, index) => (
            <span className="flex items-center gap-1">
              {path.isTransit ? (
                <p
                  key={index}
                  className="border-1 px-2 py-1 rounded-full border-2 border-primary"
                >
                  <IconText
                    icon={path.mode.toLowerCase() === "bus" ? bus : null}
                    text={path.code}
                    iconSize="small"
                    col={false}
                  />
                </p>
              ) : (
                <p key={index}>
                  <IconText
                    icon={path.mode.toLowerCase() === "walk" ? walk : null}
                    text={path.duration}
                    iconSize="small"
                    col={false}
                  />
                </p>
              )}
              <IonText>{index < paths.length - 1 && ">"}</IonText>
            </span>
          ))}
        </div>
        <p className="text-xs flex gap-2">
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
      <div className="flex items-center w-fit text-nowrap gap-2">
        <div className="text-right flex items-center h-full">
          <p className="font-bold">
            <IonText>{points ? points : ""}</IonText>
          </p>
        </div>
        <IonIcon slot="icon-only" size="small" icon={chevronForward}></IonIcon>
      </div>
      <IonRippleEffect></IonRippleEffect>
    </div>
  );
}
