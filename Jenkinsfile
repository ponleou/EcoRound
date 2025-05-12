pipeline {
    agent any
    environment {
        JAVA_HOME = "/usr/lib/jvm/java-21-openjdk"
        SKIP_JDK_VERSION_CHECK = "true"
        ANDROID_SDK = "/opt/android-sdk"
        ANDROID_SDK_ROOT = "${HOME}/.android/avd"
        ANDROID_HOME = "${HOME}/.android"
        PATH = "${PATH}:${ANDROID_SDK}/tools:${ANDROID_SDK}/cmdline-tools/latest/bin:${ANDROID_SDK}/tools/qemu/linux-x86_64"
        AVD_NAME = "avd_jenkins"
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
                // emulator -avd $AVD_NAME -no-snapshot-load -no-audio -no-window &
                sh '''
                yes | sdkmanager 'system-images;android-30;google_apis;x86_64'
                avdmanager create avd -n $AVD_NAME -k "system-images;android-30;google_apis;x86_64" --device "pixel" --force
                qemu-system-x86_64 -engine classic -prop persist.sys.language=en -prop persist.sys.country=US -avd $AVD_NAME -no-snapshot-load -no-snapshot-save -no-window &
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
