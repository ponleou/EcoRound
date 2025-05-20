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

  function getTextSizeClass(textSize) {
    if (textSize == "base") return "text-base"
    if (textSize === "large") return "text-lg"
    return "text-xs"
  }

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
          (getTextSizeClass(textSize)) +
          (textBold ? " font-bold" : "")
        }
      >
        <IonText>{text}</IonText>
      </p>
    </div>
  );
}
