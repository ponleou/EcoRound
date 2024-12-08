import { IonPage, IonContent, IonButton, useIonRouter } from "@ionic/react";

export default function Travel() {
  //temp
  const navigation = useIonRouter();
  function handleTabClick() {
    navigation.goBack();
  }
  return (
    <IonPage>
      <IonContent>
        test2 <IonButton onClick={handleTabClick}>go back</IonButton>
      </IonContent>
    </IonPage>
  );
}
