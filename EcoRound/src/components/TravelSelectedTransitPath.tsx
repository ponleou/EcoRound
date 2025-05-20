import { useContext } from "react";
import { DateContext } from "../context/DateContext";
import { IonIcon, IonText } from "@ionic/react";
import TravelItem from "./TravelItem";
import CardList from "./CardList";
import IconText from "./IconText";
import { arrowDownCircle, bus, chevronUp, stopCircle } from "ionicons/icons";

export default function TravelSelectedTransitPath({
  segment,
  segmentIndex,
  showMiddleStops,
}) {
  const { toCurrentTimezone, to12HourFormat } = useContext(DateContext) as any;

  return (
    <div
      onClick={() => {
        showMiddleStops.current[segmentIndex] =
          !showMiddleStops.current[segmentIndex];
      }}
      className="grid grid-cols-[auto,1fr] gap-x-4 items-center px-2"
    >
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
        icon={segment.mode.toLowerCase() === "bus" ? bus : null}
        subTexts={[
          segment.stops.middleStops.length +
            (segment.stops.startStop ? 1 : 0) +
            (segment.stops.endStop ? 1 : 0) +
            " stops",
          segment.duration,
        ]}
        text={
          segment.transitNames.code +
          " - " +
          segment.mode[0].toUpperCase() +
          segment.mode.substr(1).toLowerCase() +
          " to " +
          segment.transitNames.headsign
        }
      ></TravelItem>
      <br />
      <div>
        <CardList>
          <div className="flex gap-4">
            <div className="text-sm flex flex-col gap-4 grow px-2 pb-4">
              {segment.stops.startStop ? (
                <IconText
                  icon={arrowDownCircle}
                  col={false}
                  text={segment.stops.startStop}
                  iconColor="secondary"
                  iconSize="small"
                ></IconText>
              ) : null}
              {showMiddleStops.current[segmentIndex]
                ? segment.stops.middleStops.map((stop, index) => (
                    <IconText
                      icon={arrowDownCircle}
                      col={false}
                      text={stop}
                      iconColor="secondary"
                      key={stop.id}
                      iconSize="small"
                    ></IconText>
                  ))
                : null}
              {segment.stops.endStop ? (
                <IconText
                  icon={stopCircle}
                  col={false}
                  text={segment.stops.endStop}
                  iconColor="tertiary"
                  iconSize="small"
                ></IconText>
              ) : null}
            </div>
            <IonIcon
              className={
                (showMiddleStops.current[segmentIndex]
                  ? " rotate-180 "
                  : "") + "transform transition-all"
              }
              icon={chevronUp}
              size="small"
            ></IonIcon>
          </div>
        </CardList>
      </div>
    </div>
  );
}
