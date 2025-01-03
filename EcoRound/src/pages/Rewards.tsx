import { ticket } from "ionicons/icons";
import HomeCard from "../components/HomeCard";
import MainPage from "../components/MainPage";
import IconText from "../components/IconText";
import { IonButton, IonText } from "@ionic/react";
import CardList from "../components/CardList";

export default function Rewards() {
  return (
    <MainPage title="Rewards">
      <div className="p-4">
        <CardList>
          <HomeCard>
            <div className="flex flex-col gap-2">
              <IconText
                icon={ticket}
                text="5000 IDR Voucher"
                col={false}
                textSize="large"
                textBold={true}
                iconSize="small"
              />
              <p>
                <IonText color={"medium"}>5000 Reward Points</IonText>
              </p>
              <IonButton color={"secondary"} fill="outline" className="w-full">
                Redeem
              </IonButton>
            </div>
          </HomeCard>
          <HomeCard>
            <div className="flex flex-col gap-2">
              <IconText
                icon={ticket}
                text="10000 IDR Voucher"
                col={false}
                textSize="large"
                textBold={true}
                iconSize="small"
              />
              <p>
                <IonText color={"medium"}>18000 Reward Points</IonText>
              </p>
              <IonButton color={"secondary"} fill="outline" className="w-full">
                Redeem
              </IonButton>
            </div>
          </HomeCard>
        </CardList>
      </div>
    </MainPage>
  );
}
