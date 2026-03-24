pipeline {
    agent any

    environment {
        DOCKER_USER = 'indhujavs'
        DOCKER_PASS = credentials('docker-creds')
    }

    stages {

        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/IndhujaSadayappan/skill-challege.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t indhujavs/skill-backend:latest ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t indhujavs/skill-frontend:latest ./frontend'
            }
        }

        stage('Push Images') {
            steps {
                sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                sh 'docker push indhujavs/skill-backend:latest'
                sh 'docker push indhujavs/skill-frontend:latest'
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}