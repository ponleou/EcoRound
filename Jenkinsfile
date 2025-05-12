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
                androidEmulator avdName: 'test_avd', 
                                emulatorOptions: '-no-window -gpu off -memory 2048',
                                startEmulator: true,
                                forceCreate: true  // Optional, forces creation of the AVD
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
