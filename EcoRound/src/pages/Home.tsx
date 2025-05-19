import {
  IonContent,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonIcon,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
  useIonRouter,
  IonInput,
} from "@ionic/react";
import {
  homeOutline,
  personCircleOutline,
  locationOutline,
  ellipsisVertical,
  footsteps,
  ticket,
  server,
} from "ionicons/icons";
import TabBar from "../components/TabBar";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import PermissionToast from "../components/PermissionToast";
import HomeCard from "../components/HomeCard";
import CardList from "../components/CardList";
import { Icon } from "leaflet";
import IconText from "../components/IconText";
import { verifyUrl } from "../function/api";
import MainPage from "../components/MainPage";

export default function Home() {
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);

  
  const [inputUrl, setInputUrl] = useState("");
  const [urlVerified, setUrlVerified] = useState(false);
  
  const checkUrlVerification = async (url="") => {
    let response;
    if (url == "") response = await verifyUrl();
    else response = await verifyUrl(url)
    
    if (response.verify) {
      setUrlVerified(true);
    } else {
      setUrlVerified(false);
    }
  };

  useEffect(() => {
    setCarbonFootprint(Math.round(Math.random() * 100));
    setRewardPoints(Math.round(Math.random() * 100));

    checkUrlVerification()
  }, []);
  
  return (
    // Header section
    <MainPage title="EcoRound">
      {/* <PermissionToast /> */}

      <div className="p-4">
        <CardList>
          <HomeCard>
            <div className="flex flex-col gap-2">
              <IconText
                icon={footsteps}
                text="Carbon Footprint"
                col={false}
                iconSize="small"
                textSize="large"
                textBold={true}
              ></IconText>
              <p>
                <IonText color={"medium"}>
                  You have saved {carbonFootprint} gCO
                  <sub>2</sub>e of carbon emissions today.
                </IonText>
              </p>
            </div>
          </HomeCard>
          <HomeCard>
            <div className="flex flex-col gap-2">
              <IconText
                icon={ticket}
                text="Reward Points"
                col={false}
                iconSize="small"
                textSize="large"
                textBold={true}
              ></IconText>
              <p>
                <IonText color={"medium"}>
                  You have saved up {rewardPoints} reward points!
                </IonText>
              </p>
            </div>
          </HomeCard>
          {!urlVerified ? (
            <HomeCard>
              <div className="flex flex-col gap-2">
                <IconText
                  icon={server}
                  text="Development Option"
                  col={false}
                  iconSize="small"
                  textSize="large"
                  textBold={true}
                ></IconText>
                <p>
                  <IonText color={"medium"}>Input backend server:</IonText>
                </p>
                <input
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                  }}
                  value={inputUrl}
                  className="border-2 outline-primary border-gray-300 rounded-md p-2 bg-white w-full"
                />
                <IonButton
                  onClick={() => {
                    checkUrlVerification(inputUrl);
                  }}
                >
                  Verify
                </IonButton>
              </div>
            </HomeCard>
          ) : null}
        </CardList>
      </div>
    </MainPage>
  );
}
