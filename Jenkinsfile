pipeline {
    agent any

    environment {
        DOCKER_CREDS_ID = 'docker-creds'
    }

    stages {
        stage('Build & Push to Docker Hub') {
            steps {
                script {
                    echo "Starting Build & Push Process..."
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        
                        // Login to Docker Hub
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"

                        parallel(
                            "Backend Build": {
                                // Simplified build command as requested
                                sh 'docker build -t indhujavs/skill-backend:latest ./backend'
                                sh 'docker push indhujavs/skill-backend:latest'
                            },
                            "Frontend Build": {
                                // Simplified build command as requested
                                sh 'docker build -t indhujavs/skill-frontend:latest ./frontend'
                                sh 'docker push indhujavs/skill-frontend:latest'
                            }
                        )
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
