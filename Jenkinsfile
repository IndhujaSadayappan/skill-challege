pipeline {
    agent any

    environment {
        DOCKER_CREDS_ID = 'docker-creds'
        DOCKER_HUB_USER = "indhujavs"
        BACKEND_IMAGE   = "${DOCKER_HUB_USER}/skill-backend"
        FRONTEND_IMAGE  = "${DOCKER_HUB_USER}/skill-frontend"
        DOCKER_BUILDKIT = 1 
    }

    stages {
        stage('Build & Push to Docker Hub') {
            steps {
                script {
                    echo "Starting Build & Push Process..."
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        def HUB_USER = env.DOCKER_USER
                        
                        // Login once to avoid rate limits
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"

                        parallel(
                            "Backend Build": {
                                // Cache from previous build
                                sh "docker pull ${HUB_USER}/skill-backend:latest || true"
                                sh """
                                    export DOCKER_BUILDKIT=1
                                    docker build \
                                    --cache-from ${HUB_USER}/skill-backend:latest \
                                    -t ${HUB_USER}/skill-backend:latest \
                                    -t ${HUB_USER}/skill-backend:${BUILD_NUMBER} \
                                    ./backend
                                """
                                sh "docker push ${HUB_USER}/skill-backend:latest"
                                sh "docker push ${HUB_USER}/skill-backend:${BUILD_NUMBER}"
                            },
                            "Frontend Build": {
                                // Cache from previous build
                                sh "docker pull ${HUB_USER}/skill-frontend:latest || true"
                                sh """
                                    export DOCKER_BUILDKIT=1
                                    docker build \
                                    --cache-from ${HUB_USER}/skill-frontend:latest \
                                    -t ${HUB_USER}/skill-frontend:latest \
                                    -t ${HUB_USER}/skill-frontend:${BUILD_NUMBER} \
                                    ./frontend
                                """
                                sh "docker push ${HUB_USER}/skill-frontend:latest"
                                sh "docker push ${HUB_USER}/skill-frontend:${BUILD_NUMBER}"
                            }
                        )
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace and logout
            sh 'docker logout || true'
            cleanWs()
        }
    }
}
