import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonPage,
  IonRouterOutlet,
  IonTabs,
  setupIonicReact,
  useIonRouter,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import "./theme/variables.css";
import Home from "./pages/Home";
import Travel from "./pages/Travel";
import { useEffect } from "react";
import { App as CApp } from "@capacitor/app";

setupIonicReact();

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <Main />
      </IonReactRouter>
    </IonApp>
  );
}

function Main() {
  const navigation = useIonRouter();

  useEffect(() => {
    document.addEventListener("ionBackButton", () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        CApp.exitApp();
      }
    });
  }, [navigation]);

  return (
    <IonRouterOutlet>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
      <Route exact={true} path="/home" render={() => <Home />} />
      <Route exact={true} path="/travel" render={() => <Travel />} />
    </IonRouterOutlet>
  );
}

export default App;
