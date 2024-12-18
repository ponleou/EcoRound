import { IonContent, IonHeader, IonIcon, IonPage, IonText } from "@ionic/react";
import HeaderBar from "./HeaderBar";
import SearchBar from "./SearchBar";
import { useState } from "react";
import TravelCard from "./TravelCard";
import { locationSharp } from "ionicons/icons";
import IconText from "./IconText";
import CardList from "./CardList";

export default function SearchItem({ text, subText, distance }) {
  return (
    <div className="flex gap-4 items-center px-2">
      <IconText icon={locationSharp} text={distance} iconSize="small" />
      <p className="flex flex-col">
        <IonText className="font-bold">{text}</IonText>
        <IonText color={"secondary"} className="text-xs">
          {subText}
        </IonText>
      </p>
    </div>
  );
}
