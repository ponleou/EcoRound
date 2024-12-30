import { IonIcon, IonText } from "@ionic/react";

export default function IconText({
  icon,
  text,
  iconSize = "large",
  iconColor = "",
  col = true,
}) {
  return (
    <div
      className={
        "flex justify-center items-center gap-1 w-fit " +
        (col ? "flex-col" : "")
      }
    >
      <IonIcon color={iconColor} size={iconSize} icon={icon}></IonIcon>
      <p className={"text-xs text-center text-nowrap " + (col ? "w-full" : "")}>
        <IonText>{text}</IonText>
      </p>
    </div>
  );
}
