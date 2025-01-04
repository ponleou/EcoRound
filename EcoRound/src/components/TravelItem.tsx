import { IonRippleEffect, IonText } from "@ionic/react";
import IconText from "./IconText";

export default function SearchItem({
  text,
  subTexts = [],
  icon,
  iconSize = "small",
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
        iconSize={iconSize}
        textSize="small"
      />
      <p className="flex flex-col grow min-w-1">
        <IonText className="font-bold leading-tight">{text}</IonText>
        <IonText
          color={"secondary"}
          className="text-xs truncate w-full flex gap-2"
        >
          {subTexts.map((subText, index) => (
            <span
              key={index}
              className={subTexts.length - 1 <= index ? "truncate" : ""}
            >
              {subText}
            </span>
          ))}
        </IonText>
      </p>
      <IonRippleEffect></IonRippleEffect>
    </div>
  );
}
