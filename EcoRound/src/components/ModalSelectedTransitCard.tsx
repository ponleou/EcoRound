import CardList from "./CardList";
import TravelCard from "./TravelCard";
import TravelItem from "./TravelItem";
import TravelSelectedNonTransitPath from "./TravelSelectedNonTransitPath";
import TravelSelectedTransitPath from "./TravelSelectedTransitPath";

export default function ModalSelectedTransitCard({ transitRoute, showMiddleStop }) {
  return (
    <div className="h-3/4 overflow-scroll rounded-lg">
      <TravelCard>
        <CardList>
          <TravelItem
            iconText={""}
            icon={transitRoute.icon}
            text={transitRoute.destinationLabel}
            subTexts={[
              transitRoute.route.distance,
              transitRoute.route.duration,
              transitRoute.route.emission,
              <span className="font-bold">{transitRoute.route.points}</span>,
            ]}
            iconSize="large"
            ripple={false}
          />
          <hr />
          <CardList>
            {transitRoute.route.segments.map((segment, index) => {
              showMiddleStop.current.push(false);
              return segment.transitSegment ? (
                <TravelSelectedTransitPath
                  segment={segment}
                  segmentIndex={index}
                  showMiddleStops={showMiddleStop}
                  key={segment.id}
                />
              ) : (
                <TravelSelectedNonTransitPath
                  segment={segment}
                  key={segment.id}
                />
              );
            })}
          </CardList>
        </CardList>
      </TravelCard>
    </div>
  );
}
