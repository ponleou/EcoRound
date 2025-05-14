import { train, walk, bicycle, car } from "ionicons/icons";
import CardList from "./CardList";
import RouteCardItem from "./RouteCardItem";

export default function TravelDefaultCards({
  transitRoutes,
  walkRoute,
  bikeRoute,
  carRoute,
  handleTransitRoute,
  handleRouteItem,
}) {
  const walkObj = {
    name: "Walk",
    route: walkRoute,
    icon: walk,
  };

  const bikeObj = {
    name: "Bike",
    route: bikeRoute,
    icon: bicycle,
  };

  const carObj = {
    name: "Car",
    route: carRoute,
    icon: car,
  };

  const objOrder = [walkObj, bikeObj, carObj];

  return (
    <CardList>
      <span onClick={() => handleTransitRoute()}>
        <RouteCardItem
          iconText="Transit"
          points={transitRoutes.loaded ? transitRoutes.routes[0].points : ""}
          icon={train}
          isAvailable={transitRoutes.loaded}
          routeStepsNames={
            transitRoutes.loaded
              ? transitRoutes.routes[0].segments.map((segment) =>
                  segment.transitSegment ? segment.transitNames.code : "-"
                )
              : []
          }
          routeDescriptions={
            transitRoutes.loaded
              ? [
                  transitRoutes.routes[0].distance,
                  transitRoutes.routes[0].duration,
                  transitRoutes.routes[0].emission,
                ]
              : []
          }
        />
      </span>
      {objOrder.map((obj) => {
        const route = obj.route;
        const name = obj.name;
        const icon = obj.icon;
        return (
          <div key={name}>
            <hr />
            <span onClick={() => route.loaded && handleRouteItem(route, walk)}>
              <RouteCardItem
                iconText={name}
                points={route.loaded ? route.points : ""}
                icon={icon}
                isAvailable={route.loaded}
                routeStepsNames={
                  route.loaded ? route.steps.map((step) => step.name) : []
                }
                routeDescriptions={
                  route.loaded
                    ? [route.distance, route.duration, route.emission]
                    : []
                }
              />
            </span>
          </div>
        );
      })}
    </CardList>
  );
}
