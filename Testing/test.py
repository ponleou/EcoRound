from typing import List, Callable
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import WebDriverException
from appium.options.android import UiAutomator2Options
import os
import sys
from dotenv import load_dotenv  # type: ignore
from time import sleep

load_dotenv()

class Appium():
    def __init__(self, appium_server_url: str, device: dict):
        options = UiAutomator2Options()
        for key, value in device.items():
            options.set_capability(key, value)

        self.driver = webdriver.Remote(command_executor=appium_server_url, options=options)

    def __del__(self):
        if self.driver:
            self.driver.quit()

    def get_driver(self) -> webdriver.Remote:
        return self.driver

class WebElementCase():
    def __init__(self, driver: webdriver.Remote, element_id: str, element_value: str):
        self.driver = driver
        self.element_id = element_id
        self.element_value = element_value

    def get_element(self) -> WebElement:
        WebDriverWait(self.driver, 120).until(
            EC.visibility_of_element_located((self.element_id, self.element_value))
        )

        return self.driver.find_element(by=self.element_id, value=self.element_value)

    def get_function(self) -> Callable[[], None]:
        log_string = f"click {self.element_value}"

        return lambda: (print(log_string, end=""), self.get_element().click())
    

class TouchChainsCase():
    def __init__(self, driver: webdriver.Remote, start_coords: tuple[int, int], end_coords=(-1,-1)):
        self.action = ActionChains(driver)
        self.action.w3c_actions = ActionBuilder(driver, mouse=PointerInput(interaction.POINTER_TOUCH, "touch"))

        self.start_x = start_coords[0]
        self.start_y = start_coords[1]
        self.end_x = end_coords[0]
        self.end_y = end_coords[1]

    def get_function(self) -> Callable[[], None]:
        self.action.w3c_actions.pointer_action.move_to_location(self.start_x, self.start_y)
        self.action.w3c_actions.pointer_action.pointer_down()
        self.action.w3c_actions.pointer_action.pause(0.5)

        log_string = ""

        if self.end_x != -1 or self.end_y != -1:
            self.action.w3c_actions.pointer_action.move_to_location(self.end_x, self.end_y)
            self.action.w3c_actions.pointer_action.pause(0.5)
            log_string =f"drag ({self.start_x}, {self.start_y}) to ({self.end_x}, {self.end_y})"

        else:
            log_string = f"touch ({self.start_x}, {self.start_y})"
        

        self.action.w3c_actions.pointer_action.release()

        return lambda: (print(log_string, end=""), self.action.perform())

class FunctionCases():
    def __init__(self):
        self.list = []

    def add_function(self, function: Callable[[], None]):
        self.list.append(function)

    def get_list(self) -> List[Callable[[], None]]:
        return self.list
    
    def run_cases(self, delay=1, max_fail=0) -> bool:
        print("Running test cases: ")
        success = 0
        fail = 0

        if max_fail <= 0:
            max_fail = len(self.list)

        for index, function in enumerate(self.list):
            print(f"{index + 1}. ", end="")
            try:
                function()
                print("...Done\n", end="")
                success = success + 1
            except WebDriverException as e:
                print("...Fail\n", end="")
                print(f"{type(e).__name__}: {e.msg}")
                fail = fail + 1
            finally:
                sleep(delay)

            if fail >= max_fail:
                break
        
        print(f"Test cases complete: {success}/{len(self.list)}")
        if success == len(self.list):
            return True
        else:
            return False

def back_button_function(driver: webdriver.Remote) -> Callable[[], None]:
    return lambda: (print("back button", end=""), driver.execute_script('mobile: pressKey', {"keycode": 4}))

def main():
    url = 'http://localhost:4723'
    device = dict(
        platformName='Android',
        automationName='uiautomator2',
        deviceName=os.getenv("AVD_NAME"),
        platformVersion='35',
        udid=f'emulator-{os.getenv("AVD_PORT")}',
        appPackage='com.ecoround.app',
        appActivity='.MainActivity'
        )

    appium = Appium(url, device)
    driver = appium.get_driver()
    case_list = FunctionCases()

    # accept location permission
    case_list.add_function(WebElementCase(driver, AppiumBy.ID, "com.android.permissioncontroller:id/permission_location_accuracy_radio_fine").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ID, "com.android.permissioncontroller:id/permission_allow_foreground_only_button").get_function())

    # clicking tab bar buttons
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"Profile\")").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"Rewards\")").get_function())

    #clicking all buttons on page
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"REDEEM\").instance(1)").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"REDEEM\").instance(0)").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.widget.Button\").instance(0)").get_function())

    # going to travel page and select start location
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"Travel\")").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"Starting location\")").get_function())

    # select desintation location with scrolling on map
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"SELECT LOCATION\")").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"Set destination\")").get_function())
    case_list.add_function(TouchChainsCase(driver, (500, 700), (500, 300)).get_function())
    case_list.add_function(TouchChainsCase(driver, (500, 700), (500, 300)).get_function())
    case_list.add_function(TouchChainsCase(driver, (500, 700), (500, 300)).get_function())
    case_list.add_function(TouchChainsCase(driver, (500, 700), (500, 300)).get_function())
    case_list.add_function(TouchChainsCase(driver, (500, 700), (500, 300)).get_function())
    case_list.add_function(TouchChainsCase(driver, (500, 700), (500, 300)).get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().text(\"SELECT LOCATION\")").get_function())

    # going to and navigating in transit section 
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.view.View\").instance(11)").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.view.View\").instance(11)").get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.view.View\").instance(12)").get_function())
    
    case_list.add_function(back_button_function(driver))
    case_list.add_function(back_button_function(driver))

    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.widget.Button\").instance(1)").get_function())

    case_list.add_function(TouchChainsCase(driver, (550, 1450), (550, 500)).get_function())
    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.view.View\").instance(19)").get_function())
    case_list.add_function(TouchChainsCase(driver, (550, 1000), (550, 500)).get_function())
    case_list.add_function(TouchChainsCase(driver, (550, 1750), (550, 1000)).get_function())

    case_list.add_function(back_button_function(driver))

    case_list.add_function(TouchChainsCase(driver, (550, 1450), (550, 1000)).get_function())
    case_list.add_function(TouchChainsCase(driver, (550, 1000), (550, 500)).get_function())

    case_list.add_function(WebElementCase(driver, AppiumBy.ANDROID_UIAUTOMATOR, "new UiSelector().className(\"android.view.View\").instance(23)").get_function())

    case_list.add_function(back_button_function(driver))
    case_list.add_function(back_button_function(driver))

    if case_list.run_cases(5, 1):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()


