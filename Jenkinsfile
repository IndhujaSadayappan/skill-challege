pipeline {
    agent any

    environment {
        DOCKER_USER = 'indhujavs'
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

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh 'docker push indhujavs/skill-backend:latest'
                sh 'docker push indhujavs/skill-frontend:latest'
            }
        }
    }
}
