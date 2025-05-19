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
        AVD_NAME = 'jenkins_avd'
        AVD_PORT = '5558'
        adb = '/usr/bin/adb'

        AVD_LOCALHOST = '10.0.2.2'
        LOCAL_HOST = '127.0.0.1'
        OTP_PORT = '8080'
        FLASK_PORT = '5000'

        APP_VERSION = '1.0'

        SONAR_TOKEN = credentials('LOCAL_SONAR_TOKEN')
        SNYK_TOKEN = credentials('SNYK_TOKEN')
        GITHUB_TOKEN = credentials('GITHUB_TOKEN')
        ORS_API_KEY = credentials('ORS_API_KEY')


        DOCKER_USERNAME = 'ponleou'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'

        LOCAL_SERVER = '10.141.39.58'
        LOCAL_SERVER_SSH = '10-141-39-58.wifi-m.deakin.edu.au'
        PROD_SUBDOMAIN = "ecoround-flask-tunnel"
        LOCALTUNNEL_DOMAIN = 'loca.lt'

        KEY_ALIAS = 'androidkey'
        KEY_PASSWORD = credentials('KEY_PASSWORD')
        KEYSTORE_PASSWORD = credentials('KEYSTORE_PASSWORD')
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
                script {
                    parallel (
                        AppBuild: {
                            sh '''
                            echo "Building Ionic React web app..."
                            export VITE_BACKEND_URL=http://$AVD_LOCALHOST:$FLASK_PORT/api
                            cd EcoRound
                            npm install
                            npx ionic build
                            npx ionic cap build android --no-open
                            '''

                            sh '''
                            echo "Building Android APK..."
                            cd EcoRound/android
                            ./gradlew clean assembleDebug
                            '''
                        },
                        OTPBuild: {
                            sh '''
                            cd otp

                            echo "Downloading OpenTripPlanner Java server..."
                            wget https://repo1.maven.org/maven2/org/opentripplanner/otp/2.6.0/otp-2.6.0-shaded.jar

                            echo "Building OTP Server..."
                            java -Xmx2G -jar otp-2.6.0-shaded.jar --buildStreet .
                            java -Xmx2G -jar otp-2.6.0-shaded.jar --loadStreet --save .
                            '''
                        },
                        PythonVenv: {
                            sh '''
                            echo "Creating Python venv for backend..."
                            cd Backend
                            python -m venv .venv
                            .venv/bin/python -m pip install -r requirements.txt
                            '''

                            sh '''
                            cd Testing
                            python -m venv .venv
                            .venv/bin/python -m pip install -r requirements.txt
                            '''
                        }
                    )
                }
            }
        }
        stage('Test') {
            steps {
                script {

                sh '''
                echo "Installing images to create AVD..."
                yes | sdkmanager "platform-tools" "emulator" "platforms;android-35" "system-images;android-35;google_apis_playstore;x86_64"
                avdmanager create avd -n $AVD_NAME -k "system-images;android-35;google_apis_playstore;x86_64" --device "pixel" --force
                '''

                sh '''
                echo "Starting AVD emulator..."
                emulator -avd $AVD_NAME -port $AVD_PORT -no-window -writable-system -no-snapshot-load -no-audio -wipe-data & 
                '''

                sh '''
                echo "Running OpenTripPlanner server at $OTP_PORT..."
                cd otp
                java -Xmx2G -jar otp-2.6.0-shaded.jar --bindAddress $LOCAL_HOST --port $OTP_PORT --load . &
                '''

                sh '''
                echo "Running Flask server at $FLASK_PORT..."
                cd Backend
                export OTP_SERVER=$LOCAL_HOST:$OTP_PORT
                .venv/bin/python -m flask --app main run --host=$LOCAL_HOST -p $FLASK_PORT &
                '''

                sh '''
                echo "Starting Appium for testing..."
                cd EcoRound
                npx appium &
                '''

                timeout(time: 120, unit: 'SECONDS') {
                    sh '$adb wait-for-device'
                }

                retry(10) {
                    try {
                        sh '''
                        echo "Attempting to connect to device..."
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
                        echo "Attempting to install APK..."
                        $adb install -r EcoRound/android/app/build/outputs/apk/debug/app-debug.apk
                        '''
                    } catch (err) {
                        sleep(time: 5, unit: 'SECONDS')
                        throw err
                    }
                }

                sh '''
                echo "Changing AVD settings for performance..."
                $adb shell settings put global window_animation_scale 0
                $adb shell settings put global transition_animation_scale 0
                $adb shell settings put global animator_duration_scale 0
                '''

                retry(5) {
                    try {
                        sh '''
                        echo "Checking if Appium is online..."
                        curl --silent http://127.0.0.1:4723/status | grep -q '"ready":true'
                        '''
                    } catch (err) {
                        sleep(time: 5, unit: 'SECONDS')
                        throw err
                    }
                }

                sh '''
                cd Testing
                .venv/bin/python test.py || true
                '''
                }
            }
        }
    stage('Code Quality') {
        steps {
            sh '''
            echo "Installing SonarQube CLI..."
            wget -qO- "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.1.0.4889-linux-x64.zip" | bsdtar -xvf -
            chmod -R 755 ./sonar-scanner-7.1.0.4889-linux-x64/
            '''

            sh '''
            echo "Running SonarQube Scanner..."
            ./sonar-scanner-7.1.0.4889-linux-x64/bin/sonar-scanner -Dsonar.host.url="http://${LOCAL_SERVER}:9000"
            '''
        }
    }
    stage('Security Scan') {
        steps {
            script {
                parallel(
                    IonicReactApp: {
                        sh '''
                        echo "Dependency checking for Ionic React..."
                        cd EcoRound
                        npx snyk monitor
                        npm audit || true
                        '''
                    },
                    FlaskBackend: {
                        sh '''
                        echo "Dependency checking for Python Flask..."
                        cd Backend
                        . .venv/bin/activate
                        npx snyk monitor --all-projects
                        '''
                    }
                )
            }
        }
    }
    stage('Deploy') {
        steps {
            script {
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                }

                parallel(
                    DockerOTP: {
                        sh '''
                        echo "Setting up Docker for OpenTripPlanner staging..."
                        cd otp
                        docker build -t $DOCKER_USERNAME/ecoroundotp:v$APP_VERSION.$BUILD_NUMBER .
                        docker push $DOCKER_USERNAME/ecoroundotp:v$APP_VERSION.$BUILD_NUMBER
                        docker rmi -f $DOCKER_USERNAME/ecoroundotp:v$APP_VERSION.$BUILD_NUMBER
                        '''
                    },
                    DockerFlask: {
                        sh '''
                        echo "Setting up Docker for Flask staging..."
                        cd Backend
                        docker build -t $DOCKER_USERNAME/ecoroundflask:v$APP_VERSION.$BUILD_NUMBER .
                        docker push $DOCKER_USERNAME/ecoroundflask:v$APP_VERSION.$BUILD_NUMBER
                        docker rmi -f $DOCKER_USERNAME/ecoroundflask:v$APP_VERSION.$BUILD_NUMBER
                        '''
                    }
                )

                sshagent(credentials: ['MACBOOK_SSH']) {
                    sh '''
                    echo "Starting processes on staging server..."
                    ssh -o StrictHostKeyChecking=no ssh-user@$LOCAL_SERVER_SSH "bash -lc '
                    docker network create ecoroundstage-network || true &&

                    docker stop ecoroundotpstage || true &&
                    docker rm -f ecoroundotpstage || true &&
                    docker pull $DOCKER_USERNAME/ecoroundotp:v$APP_VERSION.$BUILD_NUMBER &&
                    docker run -d --name ecoroundotpstage --network ecoroundstage-network $DOCKER_USERNAME/ecoroundotp:v$APP_VERSION.$BUILD_NUMBER &&

                    docker stop ecoroundflaskstage || true &&
                    docker rm -f ecoroundflaskstage || true &&
                    docker pull $DOCKER_USERNAME/ecoroundflask:v$APP_VERSION.$BUILD_NUMBER &&
                    docker run -d --name ecoroundflaskstage --network ecoroundstage-network -e ORS_API_KEY=$ORS_API_KEY -e OTP_SERVER=ecoroundotpstage:8080 -p 0.0.0.0:$FLASK_PORT:5000 $DOCKER_USERNAME/ecoroundflask:v$APP_VERSION.$BUILD_NUMBER
                    '"
                    '''
                }

                sh '''
                echo "Building APK for staging..."
                export VITE_BACKEND_URL=http://$LOCAL_SERVER:5001/api
                cd EcoRound
                npx ionic build
                npx ionic cap build android --no-open

                cd android
                ./gradlew clean assembleDebug

                cd app/build/outputs/apk/debug/
                mv app-debug.apk EcoRound-v$APP_VERSION.$BUILD_NUMBER.apk
                '''

                archiveArtifacts artifacts: "EcoRound/android/app/build/outputs/apk/debug/EcoRound-v${APP_VERSION}.${BUILD_NUMBER}.apk", fingerprint: true
            }
        }
    }
    stage('Release') {
        steps {
            script {
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'
                }

                parallel(
                    DockerOTP: {
                        sh '''
                        echo "Setting up Docker for OpenTripPlanner production..." 
                        cd otp
                        docker build -t $DOCKER_USERNAME/ecoroundotp:latest .
                        docker push $DOCKER_USERNAME/ecoroundotp:latest
                        docker rmi -f $DOCKER_USERNAME/ecoroundotp:latest
                        '''
                    },
                    DockerFlask: {
                        sh '''
                        echo "Setting up Docker for Flask production..."
                        cd Backend
                        docker build -t $DOCKER_USERNAME/ecoroundflask:latest .
                        docker push $DOCKER_USERNAME/ecoroundflask:latest
                        docker rmi -f $DOCKER_USERNAME/ecoroundflask:latest
                        '''
                    }
                )

                sshagent(credentials: ['MACBOOK_SSH']) {
                    sh '''
                    echo "Setting up production server..."
                    ssh -o StrictHostKeyChecking=no ssh-user@$LOCAL_SERVER_SSH "bash -lc 'mkdir -p .jenkins/EcoRound'"
                    scp -o StrictHostKeyChecking=no docker-compose.yml ssh-user@$LOCAL_SERVER_SSH:.jenkins/EcoRound
                    ssh -o StrictHostKeyChecking=no ssh-user@$LOCAL_SERVER_SSH "bash -lc '
                    cd .jenkins/EcoRound
                    export ORS_API_KEY=$ORS_API_KEY
                    export PROD_SUBDOMAIN=$PROD_SUBDOMAIN
                    mkdir -p logs
                    chmod -R 777 logs
                    docker-compose down
                    docker-compose pull
                    docker-compose up -d
                    '"
                    '''
                }

                withCredentials([file(credentialsId: 'androidkey', variable: 'KEYSTORE_PATH')]) {
                    sh '''
                    echo "Building APK for release in GitHub..."
                    export VITE_BACKEND_URL=https://$PROD_SUBDOMAIN.$LOCALTUNNEL_DOMAIN/api
                    cd EcoRound
                    npx ionic build --prod
                    npx ionic cap build android --no-open --prod

                    cd android
                    ./gradlew clean assembleRelease -Pandroid.injected.signing.store.file=$KEYSTORE_PATH -Pandroid.injected.signing.store.password=$KEYSTORE_PASSWORD -Pandroid.injected.signing.key.alias=$KEY_ALIAS -Pandroid.injected.signing.key.password=$KEY_PASSWORD

                    cd app/build/outputs/apk/release/
                    mv app-release.apk EcoRound-v$APP_VERSION.$BUILD_NUMBER.apk

                    gh release create "v${APP_VERSION}.${BUILD_NUMBER}" "EcoRound-v${APP_VERSION}.${BUILD_NUMBER}.apk" --prerelease --title "v${APP_VERSION}.${BUILD_NUMBER}"
                    '''
                }
            }
        }
    }
    stage('Monitor') {
        steps {
            sh '''
            echo "Checking if production server is online..."
            curl https://$PROD_SUBDOMAIN.$LOCALTUNNEL_DOMAIN/api/verify || echo "Request failed. Is the server on?"
            '''

            sh'''
            echo "Checking if server monitor is online..."
            curl -s -o /dev/null http://10.141.39.58:19999/api/v1/info || echo "Request failed. Is the server on?"
            '''
        }
    }
    }
    post {
        always {
            sh '''
            echo "Cleaning..."
            avdmanager delete avd -n $AVD_NAME
            adb kill-server
            '''
            cleanWs()
        }
    }
}
