pipeline {
    agent any
    environment {
        ANDROID_HOME = '/home/ponleou/Android/Sdk'
        ANDROID_AVD_HOME = '/home/ponleou/.android/avd'
    }
    stages {
        // stage('Build') {
        //     steps {
        //         sh '''
        //         echo "=========== Installing node modules... ==========="
        //         (cd EcoRound && npm install)
        //         echo "=========== Building web assets... ==========="
        //         (cd EcoRound && npx ionic build)
        //         echo "=========== Building for Android... ==========="
        //         (cd EcoRound && npx ionic cap build android --no-open)
        //         (cd EcoRound/android && ./gradlew assembleDebug)
        //         '''
        //     }
        // }
        stage('Test') {
            steps {
                sh '''
                echo "Checking for AVDs..."
                AVD_LIST=$($ANDROID_HOME/emulator/emulator -list-avds | head -n 1)

                if [ -z "$AVD_LIST" ]; then
                    echo "❌ No AVDs found in $ANDROID_AVD_HOME"
                    ls -l "$ANDROID_AVD_HOME"
                    exit 1
                fi

                echo "✅ Launching emulator: $AVD_LIST"
                $ANDROID_HOME/emulator/emulator -avd "$AVD_LIST" -no-audio -no-window -no-snapshot-load &
                adb wait-for-device

                echo "📦 Installing app..."
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
