import {
  arrowForward,
  arrowBack,
  arrowUp,
  locationSharp,
} from "ionicons/icons";
import CardList from "./CardList";
import TravelCard from "./TravelCard";
import TravelItem from "./TravelItem";

export default function ModalSelectedRouteCard({ route }) {
  return (
    <div className="h-3/4 overflow-scroll rounded-lg">
      <TravelCard>
        <CardList>
          <TravelItem
            iconText={""}
            icon={route.icon}
            text={route.destinationLabel}
            subTexts={[
              route.route.distance,
              route.route.duration,
              route.route.emission,
              <span className="font-bold">{route.route.points}</span>,
            ]}
            iconSize="large"
            ripple={false}
          />
          <hr />
          <CardList>
            {route.route.steps.map((step, index) => (
              <TravelItem
                key={step.id}
                text={step.instruction}
                icon={
                  step.instruction.toLowerCase().includes("turn")
                    ? step.instruction.toLowerCase().includes("right")
                      ? arrowForward
                      : arrowBack
                    : arrowUp
                }
                iconText={step.distance}
                subTexts={[step.duration]}
                ripple={false}
                iconColor={"secondary"}
              />
            ))}
            <TravelItem
              text={"Arrive at " + route.destinationLabel}
              icon={locationSharp}
              iconText={""}
              subTexts={[""]}
              ripple={false}
              iconColor={"tertiary"}
            />
          </CardList>
        </CardList>
      </TravelCard>
    </div>
  );
}
