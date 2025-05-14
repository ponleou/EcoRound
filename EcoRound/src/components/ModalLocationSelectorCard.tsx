import { IonIcon, IonText, IonButton } from "@ionic/react";
import { locate, swapVertical, ellipsisVertical, locationSharp } from "ionicons/icons";
import TravelCard from "./TravelCard";

export default function ModalLocationSelectorCard({
    handleChooseLocation,
    setStartCoords,
    startCoords,
    handleCoordSwap,
    setDestinationCoords,
    destinationCoords
}) {
    return  <TravelCard>
                          <div className="grid grid-cols-[auto_1fr_auto] grid-rows-3 gap-x-4 items-center">
                            {" "}
                            <IonIcon color="secondary" icon={locate}></IonIcon>
                            <p
                              className="truncate w-full"
                              onClick={() =>
                                handleChooseLocation(setStartCoords)
                              }
                            >
                              <IonText class="ion-padding-horizontal">
                                {startCoords.lat === undefined ||
                                startCoords.lon === undefined
                                  ? "Starting location"
                                  : startCoords.label !== ""
                                  ? startCoords.label
                                  : startCoords.lat + ", " + startCoords.lon}
                              </IonText>
                            </p>
                            <IonButton
                              size="small"
                              fill="clear"
                              color="dark"
                              className="row-span-3"
                              shape="round"
                              onClick={() => handleCoordSwap()}
                            >
                              <IonIcon
                                slot="icon-only"
                                icon={swapVertical}
                              ></IonIcon>
                            </IonButton>
                            <IonIcon icon={ellipsisVertical}></IonIcon>
                            <hr />
                            <IonIcon
                              color="tertiary"
                              icon={locationSharp}
                            ></IonIcon>
                            <p
                              className="truncate w-full"
                              onClick={() =>
                                handleChooseLocation(setDestinationCoords)
                              }
                            >
                              <IonText class="ion-padding-horizontal">
                                {destinationCoords.lat === undefined ||
                                destinationCoords.lon === undefined
                                  ? "Set destination"
                                  : destinationCoords.label !== ""
                                  ? destinationCoords.label
                                  : destinationCoords.lat +
                                    ", " +
                                    destinationCoords.lon}
                              </IonText>
                            </p>
                          </div>
                        </TravelCard>
}