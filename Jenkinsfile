pipeline {
    agent any
    environment {
        ANDROID_HOME = '/home/ponleou/Android/Sdk'
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
                (cd EcoRound/android && ./gradlew assembleDebug)
                '''
            }
        }
        stage('Test') {
            steps {
                sh '''
                $ANDROID_HOME/emulator/emulator -avd $($ANDROID_HOME/emulator/emulator -list-avds) -no-snapshot-load -no-audio -no-window &
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
