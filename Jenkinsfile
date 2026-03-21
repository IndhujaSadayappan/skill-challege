pipeline {
    agent any

    environment {
        // Set this to your Docker Hub username or retrieve it from Jenkins Credentials
        DOCKER_HUB_USER = 'indhujavs' 
        
        // Define images with tags for consistency
        BACKEND_IMAGE  = "${DOCKER_HUB_USER}/skill-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/skill-frontend"
        
        // Jenkins Credentials ID
        DOCKER_CREDS_ID = 'docker-hub-credentials'
        
        // CI environment variable
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing root and sub-project dependencies...'
                // Using 'npm ci' instead of 'npm install' as it's more reliable in CI environments
                // It deletes existing node_modules and ensures a clean, consistent install from package-lock.json
                sh 'npm ci'
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Tests') {
            parallel {
                stage('Backend Analysis') {
                    steps {
                        dir('backend') {
                            sh 'npm test -- --passWithNoTests'
                        }
                    }
                }
                stage('Frontend Analysis') {
                    steps {
                        dir('frontend') {
                            sh 'npm test -- --passWithNoTests'
                        }
                    }
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    // This pulls the Docker Hub username and password from Jenkins credentials
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        
                        // Use the credential-provided username for image naming
                        def HUB_USER = env.DOCKER_USER

                        // Login to Docker Hub
                        echo 'Logging into Docker Hub...'
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"

                        // --- Backend Image ---
                        echo "Building Backend Image: ${HUB_USER}/skill-backend..."
                        sh "docker build -t ${HUB_USER}/skill-backend:latest -t ${HUB_USER}/skill-backend:${BUILD_NUMBER} ./backend"
                        
                        echo "Pushing Backend Images to Docker Hub..."
                        sh "docker push ${HUB_USER}/skill-backend:latest"
                        sh "docker push ${HUB_USER}/skill-backend:${BUILD_NUMBER}"

                        // --- Frontend Image ---
                        echo "Building Frontend Image: ${HUB_USER}/skill-frontend..."
                        sh "docker build -t ${HUB_USER}/skill-frontend:latest -t ${HUB_USER}/skill-frontend:${BUILD_NUMBER} ./frontend"
                        
                        echo "Pushing Frontend Images to Docker Hub..."
                        sh "docker push ${HUB_USER}/skill-frontend:latest"
                        sh "docker push ${HUB_USER}/skill-frontend:${BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Initiating Kubernetes Deployment...'
                    
                    // We assume K8s manifests will be stored in a directory named 'k8s'
                    // Apply common configurations, services, etc.
                    sh 'kubectl apply -f k8s/backend-deployment.yaml || echo "Backend manifest not found"'
                    sh 'kubectl apply -f k8s/frontend-deployment.yaml || echo "Frontend manifest not found"'
                    
                    // Specific image update to ensure the latest CI build is rolled out
                    // Replace 'backend-container' and 'frontend-container' with your container names from the YAMLs
                    sh "kubectl set image deployment/backend-deployment backend-container=${DOCKER_HUB_USER}/skill-backend:${BUILD_NUMBER}"
                    sh "kubectl set image deployment/frontend-deployment frontend-container=${DOCKER_HUB_USER}/skill-frontend:${BUILD_NUMBER}"
                    
                    echo 'Deployment triggered. Monitoring rollout status...'
                    sh "kubectl rollout status deployment/backend-deployment"
                    sh "kubectl rollout status deployment/frontend-deployment"
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution finished. Cleaning up workspace...'
            sh 'docker logout'
            cleanWs()
        }
        success {
            echo 'Full CI/CD Lifecycle Completed Successfully!'
        }
        failure {
            echo 'Pipeline Failure Detected. Please check console output for errors.'
        }
    }
}
