pipeline {
    agent any
    environment {
        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk'
        SKIP_JDK_VERSION_CHECK = 'true'
        ANDROID_SDK = '/opt/android-sdk'
        ANDROID_SDK_ROOT = "${ANDROID_SDK}"
        ANDROID_HOME = "${ANDROID_SDK}"
        PATH = "${PATH}:${ANDROID_SDK}/emulator:${ANDROID_SDK}/cmdline-tools/latest/bin"
        AVD_NAME = "avd_jenkins2"
        adb = '/usr/bin/adb'
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
                yes | sdkmanager "platform-tools" "emulator" "platforms;android-35" "system-images;android-35;google_apis_playstore;x86_64"
                avdmanager create avd -n $AVD_NAME -k "system-images;android-35;google_apis_playstore;x86_64" --device "pixel" --force

                '''
                script {
                    parallel(
                        launchEmulator: {
                            sh '''
                            emulator -avd $AVD_NAME -writable-system -no-window -no-snapshot-load -no-audio -no-qt -no-boot-anim
                            '''
                        },
                        runAndroidTests: {
                            timeout(time: 120, unit: 'SECONDS') {
                                sh '$adb wait-for-device'
                            }

                            sh '''
                            (cd EcoRound/android && ./gradlew assembleDebug)
                            $adb install -r EcoRound/android/app/build/outputs/apk/debug/app-debug.apk
                            $adb shell am start -n io.ionic.starter/.MainActivity
                            '''
                        }
                    )
                }
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
    // stage('Monitor') {
    //     steps {
    //     }
    // }
    }
    }
