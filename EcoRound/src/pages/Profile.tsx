import { IonIcon, IonText } from "@ionic/react";
import HomeCard from "../components/HomeCard";
import MainPage from "../components/MainPage";
import { personCircle } from "ionicons/icons";

export default function Profile() {
  return (
    <MainPage title="My Profile">
      <div className="p-4">
        <HomeCard>
          <div className="flex gap-4 items-center">
            <IonIcon className="text-8xl" icon={personCircle} color="medium" />
            <p className="flex flex-col">
              <IonText className="font-bold text-lg">Developer</IonText>
              <IonText color="medium text-sm">example@gmail.com</IonText>
            </p>
          </div>
        </HomeCard>
      </div>
    </MainPage>
  );
}
