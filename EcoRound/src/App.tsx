import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
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
import "./input.css";
import Home from "./pages/Home";
import Travel from "./pages/Travel";
import { useEffect, useRef } from "react";
import { App as CApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { CoordinateProvider } from "./context/CoordinateContext";
import { RouteProvider } from "./context/RouteContext";

setupIonicReact();

function App() {
  return (
    <IonApp>
      <CoordinateProvider>
        <IonReactRouter>
          <Main />
        </IonReactRouter>
      </CoordinateProvider>
    </IonApp>
  );
}

function Main() {
  const navigation = useIonRouter();

  const homePath = useRef("/home");
  const travelPath = useRef("/travel");

  // Make the status bar blend with header
  function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
  }
  async function setStatusBarStyle(style) {
    await StatusBar.setStyle({ style: style });
  }

  const hexColor = useRef("#ffffff");
  const style = useRef(Style.Light);

  useEffect(() => {
    if (location.pathname === homePath.current) {
      hexColor.current = getCssVariableValue("--ion-color-primary-contrast");
      style.current = Style.Light;
    }
    if (location.pathname.startsWith(travelPath.current)) {
      hexColor.current = getCssVariableValue("--ion-color-primary");
      style.current = Style.Dark;
    }

    StatusBar.setBackgroundColor({ color: hexColor.current });
    setStatusBarStyle(style.current);
  }, [location.pathname]);

  // Handle back button on android
  useEffect(() => {
    document.addEventListener("ionBackButton", () => {
      if (!navigation.canGoBack()) {
        CApp.exitApp();
      }
    });
  }, [navigation]);

  return (
    <IonRouterOutlet>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
      <Route exact={true} path={homePath.current} component={Home} />
      <Route
        path={travelPath.current}
        render={(props) => (
          <RouteProvider>
            <Travel {...props} />
          </RouteProvider>
        )}
      />
    </IonRouterOutlet>
  );
}

export default App;
