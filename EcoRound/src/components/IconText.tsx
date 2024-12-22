import { IonIcon, IonText } from "@ionic/react";

export default function IconText({
  icon,
  text,
  iconSize = "large",
  iconColor = "",
}) {
  return (
    <div className="flex flex-col justify-center items-center gap-1 w-fit">
      <IonIcon color={iconColor} size={iconSize} icon={icon}></IonIcon>
      <p className="text-xs w-full text-center text-nowrap">
        <IonText>{text}</IonText>
      </p>
    </div>
  );
}
