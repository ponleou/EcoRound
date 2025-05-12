pipeline {
    agent any
    environment {
        ANDROID_HOME = "/opt/android-sdk"
        PATH = "${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin"
        AVD_NAME = "jenkins_avd"
    }
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
                sh '''
                avdmanager create avd -n $AVD_NAME -k "system-images;android-30;google_apis;x86_64" --device "pixel"
                emulator -avd $AVD_NAME -no-snapshot-load -no-audio -no-window &
                adb wait-for-device
                (cd EcoRound/android && ./gradlew assembleDebug)
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
