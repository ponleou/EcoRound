import { IonText } from "@ionic/react";
import { useContext } from "react";
import { DateContext } from "../context/DateContext";
import TravelItem from "./TravelItem";
import { walk } from "ionicons/icons";

export default function TravelSelectedNonTransitPath({ segment }) {
  const { toCurrentTimezone, to12HourFormat } = useContext(DateContext) as any;
  return (
    <div className="flex gap-4 items-center px-2">
      <p className="self-center w-fit text-xs">
        <IonText>
          {
            to12HourFormat(
              toCurrentTimezone(
                segment.start.date + "T" + segment.start.time
              ).split("T")[1]
            ).split("+")[0]
          }
        </IonText>
      </p>
      <TravelItem
        ripple={false}
        iconText={
          segment.mode[0].toUpperCase() + segment.mode.substr(1).toLowerCase()
        }
        icon={segment.mode.toLowerCase() === "walk" ? walk : null}
        subTexts={[segment.distance, segment.duration]}
        text={
          "To " +
          (segment.stops.endStop !== "" ? segment.stops.endStop : "Destination")
        }
      ></TravelItem>
    </div>
  );
}
