import { IonIcon, IonText } from "@ionic/react";

export default function IconText({
  icon,
  text,
  iconSize = "large",
  textSize = "small",
  textBold = false,
  iconColor = "",
  col = true,
}) {
  return (
    <div
      className={
        "flex justify-center items-center  w-fit " +
        (col ? "flex-col gap-1" : " gap-2")
      }
    >
      <IonIcon color={iconColor} size={iconSize} icon={icon}></IonIcon>
      <p
        className={
          "text-center text-nowrap " +
          (col ? "w-full " : "") +
          (textSize == "base"
            ? "text-base"
            : textSize == "large"
            ? "text-lg"
            : "text-xs") +
          (textBold ? " font-bold" : "")
        }
      >
        <IonText>{text}</IonText>
      </p>
    </div>
  );
}
