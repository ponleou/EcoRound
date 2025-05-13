import unittest
from typing import List, Literal
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.remote.webelement import WebElement

capabilities = dict(
    platformName='Android',
    automationName='uiautomator2',
    deviceName='medium_phone',
    platformVersion='35',
    udid='emulator-5554',
    )

appium_server_url = 'http://localhost:4723'

driver = webdriver.Remote(appium_server_url, capabilities)
class Appium():
    def __init__(self, appium_server_url: str, device: dict, testCases: List[callable[[], None]]):
        self.testCases = testCases
        self.driver = webdriver.Remote(appium_server_url, device)

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
        return self.driver.find_element(by=self.element_id, value=self.element_value)

    def get_function(self) -> callable[[], None]:
        return lambda: self.get_element().click()
    
    @staticmethod
    def get_function(element: WebElement) -> callable[[], None]:
        return lambda: element.click()

class TouchChainsCase():
    def __init__(self, driver: webdriver.Remote, start_coords: tuple[int, int], end_coords: tuple[int, int]):
        self.action = ActionChains(driver)
        self.action.w3c_actions = ActionBuilder(driver, mouse=PointerInput(interaction.POINTER_TOUCH, "touch"))

        self.start_x = start_coords[0]
        self.start_y = start_coords[1]
        self.end_x = end_coords[0]
        self.end_y = end_coords[1]

    def get_function(self) -> callable[[], None]:
        self.action.w3c_actions.pointer_action.move_to_location(self.start_x, self.start_x)
        self.action.w3c_actions.pointer_action.pointer_down()
        self.action.w3c_actions.pointer_action.move_to_location(self.end_x, self.end_x)
        self.action.w3c_actions.pointer_action.release()

        return lambda: self.action.perform()

class FunctionCases():
    def __init__(self):
        self.list = []

    def add_function(self, function: callable[[], None]):
        self.list.append(function)

    def get_list(self) -> List[callable[[], None]]:
        return self.list


def main():
    url = 'http://localhost:4723'
    device = dict(
        platformName='Android',
        automationName='uiautomator2',
        deviceName='medium_phone',
        platformVersion='35',
        udid='emulator-5554',
    )

    appium = Appium(url, device)
    driver = appium.get_driver()
    case_list = FunctionCases()

    # accept location permission
    case_list.add_function(WebElementCase(driver, AppiumBy.ID, "com.android.permissioncontroller:id/permission_location_accuracy_radio_fine"))
    case_list.add_function(WebElementCase(driver, AppiumBy.ID, "com.android.permissioncontroller:id/permission_allow_foreground_only_button"))


if __name__ == '__main__':
    main()


