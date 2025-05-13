pipeline {
    agent any
    environment {
        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk'
        SKIP_JDK_VERSION_CHECK = 'true'
        ANDROID_AVD_PATH = "${HOME}/.android/avd"
        ANDROID_SDK = '/opt/android-sdk'
        ANDROID_SDK_ROOT = "${ANDROID_SDK}"
        ANDROID_HOME = "${ANDROID_SDK}"
        PATH = "${PATH}:${ANDROID_SDK}/emulator:${ANDROID_SDK}/cmdline-tools/latest/bin"
        AVD_NAME = 'avd_jenkins2'
        ORS_API_KEY = credentials('ORS_API_KEY')
        DEVELOPMENT_SERVER = 'http://127.0.0.1:5000'
        adb = '/usr/bin/adb'
    }
    stages {
        stage('Initialise') {
            steps {
                sh '''
                adb kill-server
                '''
            }
        }
        stage('Build') {
            steps {
                sh '''
                export APP_BACKEND_URL=$DEVELOPMENT_SERVER/api

                echo "=========== Installing node modules... ==========="
                (cd EcoRound && npm install)

                echo "=========== Building web assets... ==========="
                (cd EcoRound && npx ionic build)

                echo "=========== Building for Android... ==========="
                (cd EcoRound && npx ionic cap build android --no-open)

                echo "=========== Building Android APK... ==========="
                (cd EcoRound/android && ./gradlew clean)
                (cd EcoRound/android && ./gradlew --refresh-dependencies)
                (cd EcoRound/android && ./gradlew assembleDebug)

                echo "=========== Downloading OTP... ==========="
                (cd Backend/otp && wget https://repo1.maven.org/maven2/org/opentripplanner/otp/2.6.0/otp-2.6.0-shaded.jar)

                echo "=========== Building OTP Server... ==========="
                (cd Backend/otp && java -Xmx2G -jar otp-2.6.0-shaded.jar --buildStreet .)
                (cd Backend/otp && java -Xmx2G -jar otp-2.6.0-shaded.jar --loadStreet --save .)

                echo "=========== Creating Python venv for backend... ==========="
                (cd Backend && python -m venv .venv)
                (cd Backend && source ./venv/bin/activate)
                (cd Backend && pip install -r pip install -r requirement.txt)
                deactivate

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
                            emulator -avd $AVD_NAME -writable-system -no-window -no-snapshot-load -no-audio -no-qt -wipe-data
                            '''
                        },
                        launchOTP: {
                            sh '''
                            (cd Backend/otp && java -Xmx2G -jar otp-2.6.0-shaded.jar --load .)
                            '''
                        },
                        runBackend: {
                            sh '''
                            (cd Backend && source ./venv/bin/activate)
                            (cd Backend && python -m flask --app main run)
                            '''
                        },
                        runAndroidTests: {
                            timeout(time: 120, unit: 'SECONDS') {
                                sh '$adb wait-for-device'
                            }

                            retry(10) {
                                try {
                                    sh '''
                                    adb shell getprop sys.boot_completed
                                    adb shell pm path android
                                    adb shell pm list packages
                                    '''
                                } catch (err) {
                                    sleep(time: 5, unit: 'SECONDS')
                                    throw err
                                }
                            }

                            retry(6) {
                                try {
                                    sh '''
                                    $adb devices
                                    $adb install -r EcoRound/android/app/build/outputs/apk/debug/app-debug.apk
                                    $adb shell am start -n io.ionic.starter/.MainActivity
                                    '''
                                } catch (err) {
                                    sleep(time: 5, unit: 'SECONDS')
                                    throw err
                                }
                            }

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
    post {
        always {
            sh '''
            avdmanager delete avd -n $AVD_NAME
            adb kill-server
            '''
        }
    }
    }
