pipeline {
    agent any
    // environment {
    //     ANDROID_HOME = '/home/ponleou/Android/Sdk'
    // }
    stages {
        stage('Build') {
            steps {
                sh '''
                echo "=========== Installing node modules... ==========="
                (cd EcoRound && npm install)
                echo "=========== Building web assets... ==========="
                (cd EcoRound && npx ionic build)
                echo "=========== Building for Android... ==========="
                (cd EcoRound && npx ionic cap build android --no-open)
                '''
            }
        }
        stage('Test') {
            steps {
                def emulator = androidEmulator(
                    avdName: 'my-avd',       // Name of the AVD
                    target: 'android-30',    // API level
                    abi: 'x86_64',          // ABI type (e.g., x86, x86_64, armeabi-v7a)
                    screenDensity: '240',    // Screen density (dpi)
                    screenResolution: '1080x1920', // Resolution
                    sdcardSize: '512M',      // SD card size
                    deleteAfterBuild: true,   // Delete AVD after build
                    // Additional options (optional)
                    commandLineOptions: '-no-snapshot-save -noaudio -no-window',
                    startupTimeout: '300',    // Timeout in seconds
                    hardwareProperties: [
                        'hw.keyboard=yes',
                        'hw.ramSize=2048'
                    ]
                )
                sh '''

                // Wait for the emulator to fully boot
                sh "${ANDROID_HOME}/platform-tools/adb wait-for-device"

                (cd EcoRound/android && ./gradlew assembleDebug)
                adb wait-for-device
                adb install -r EcoRound/android/app/build/outputs/apk/debug/app-debug.apk
                adb shell am start -n io.ionic.starter/.MainActivity
                '''
            }
        }
    // stage('Code Quality') {
    //     steps {
    //     }
    // }
    // stage('Security Scan') {
    //     steps {
    //     }
    // }
    // stage('Deploy') {
    //     steps {
    //     }
    // }
    // stage('Release') {
    //     steps {
    //     }
    // }
    // stage('Monitor') {
    //     steps {
    //     }
    // }
    }
}
