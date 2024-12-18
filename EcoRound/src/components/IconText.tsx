import { IonIcon, IonText } from "@ionic/react";

export default function IconText({ icon, text, iconSize = "large" }) {
  return (
    <div className="flex flex-col justify-center items-center gap-1 w-fit">
      <IonIcon size={iconSize} icon={icon}></IonIcon>
      <p className="text-xs w-full text-center">
        <IonText>{text}</IonText>
      </p>
    </div>
  );
}
