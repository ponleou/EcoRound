pipeline {
    agent any
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

                '''
            }
        }
        stage('Code Quality') {
            steps {
            }
        }
        stage('Security Scan') {
            steps {
            }
        }
        stage('Deploy') {
            steps {
            }
        }
        stage('Release') {
            steps {
            }
        }
        stage('Monitor') {
            steps {
            }
        }
    }
}
