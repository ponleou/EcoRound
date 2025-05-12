pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Installing node modules...'
                sh '(cd EcoRound && npm install)'
                echo 'Building web assets...'
                sh '(cd EcoRound && npx ionic build)'
                echo 'Building for Android'
                sh '(cd EcoRound && npx ionic cap build android --no-open)'
                sh'(cd EcoRound/android && ./gradlew assembleDebug)'
            }
        }
        stage('Unit and Integration Tests') {
            steps {
                echo 'Testing functionalities of different components of app in isolation and combined (e.g. Selenium)'
            }
        }
        stage('Code Analysis') {
            steps {
                echo 'Check the quality of the code by scanning source code for vulnerbilities before compilation with SAST (e.g. SonarQube)'
            }
        }
        stage('Security Scan') {
            steps {
                echo "Check security of app by checking app's dependencies for potential vulnerabilities with SCA (e.g. Snyk)"
            }
        }
        stage('Deploy to Staging') {
            steps {
                echo 'A cloud server to host the staging environment for public use in the cloud (e.g. AWS Lightsail)'
            }
        }
        stage('Integration Tests on Staging') {
            steps {
                echo 'Integrated testing in the deployed environment to ensure deployment works (e.g. Selenium)'
            }
        }
        stage('Deploy to Production') {
            steps {
                echo 'Deploying the application on a different server separate from the staging server (e.g. AWS Lightsail)'
            }
        }
    }
}
