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
        AVD_PORT = '5558'
        adb = '/usr/bin/adb'

        ORS_API_KEY = credentials('ORS_API_KEY')
        DEVELOPMENT_SERVER = 'http://10.0.2.2:5000'
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
                export VITE_BACKEND_URL=$DEVELOPMENT_SERVER/api
                cd EcoRound

                echo "=========== Installing node modules... ==========="
                npm install

                echo "=========== Building web assets... ==========="
                npx ionic build

                echo "=========== Building for Android... ==========="
                npx ionic cap build android --no-open
                '''

                sh '''
                cd EcoRound/android

                echo "=========== Building Android APK... ==========="
                ./gradlew assembleDebug
                '''

                sh '''
                cd Backend/otp

                echo "=========== Downloading OTP... ==========="
                wget https://repo1.maven.org/maven2/org/opentripplanner/otp/2.6.0/otp-2.6.0-shaded.jar

                echo "=========== Building OTP Server... ==========="
                java -Xmx2G -jar otp-2.6.0-shaded.jar --buildStreet .
                java -Xmx2G -jar otp-2.6.0-shaded.jar --loadStreet --save .
                '''

                sh '''
                cd Backend

                echo "=========== Creating Python venv for backend... ==========="
                python -m venv .venv
                .venv/bin/python -m pip install -r requirement.txt
                '''
            }
        }
        stage('Test') {
            steps {
                sh '''
                yes | sdkmanager "platform-tools" "emulator" "platforms;android-35" "system-images;android-35;google_apis_playstore;x86_64"
                avdmanager create avd -n $AVD_NAME -k "system-images;android-35;google_apis_playstore;x86_64" --device "pixel" --force
                '''

                sh '''
                emulator -avd $AVD_NAME -port $AVD_PORT -writable-system -no-window -no-snapshot-load -no-audio -no-qt -wipe-data & 
                '''

                sh '''
                cd Backend/otp
                java -Xmx2G -jar otp-2.6.0-shaded.jar --load . &
                '''

                sh '''
                cd Backend 
                .venv/bin/python -m flask --app main run &
                '''

                sh '''
                cd EcoRound
                npx appium &
                '''

                timeout(time: 120, unit: 'SECONDS') {
                    sh '$adb wait-for-device'
                }

                retry(10) {
                    try {
                        sh '''
                        $adb shell getprop sys.boot_completed
                        $adb shell pm path android
                        $adb shell pm list packages
                        '''
                    } catch (err) {
                        sleep(time: 5, unit: 'SECONDS')
                        throw err
                    }
                }

                retry(5) {
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

                // retry(5) {
                //     try {
                //         sh '''
                //         curl --silent http://127.0.0.1:4723/status | grep -q '"ready":true'
                //         '''
                //     } catch (err) {
                //         sleep(time: 5, unit: 'SECONDS')
                //         throw err
                //     }
                // }

                // sh '''
                // cd Testing
                // python -m venv .venv
                // .venv/bin/python -m pip install -r requirement.txt
                // .venv/bin/python test.py
                // '''

                // sh '''
                // kill $(jobs -p) || true
                // '''
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
