import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRippleEffect,
  IonText,
} from "@ionic/react";
import IconText from "./IconText";

export default function SearchItem({
  text,
  subText,
  icon,
  iconText,
  iconColor = "",
  ripple = true,
}) {
  return (
    <div
      className={`flex gap-4 items-center px-2 relative overflow-hidden py-4 rounded-md ${
        ripple ? "ion-activatable" : ""
      }`}
    >
      <IconText
        iconColor={iconColor}
        icon={icon}
        text={iconText}
        iconSize="small"
      />
      <p className="flex flex-col">
        <IonText className="font-bold">{text}</IonText>
        <IonText color={"secondary"} className="text-xs">
          {subText}
        </IonText>
      </p>
      <IonRippleEffect></IonRippleEffect>
    </div>
  );
}
