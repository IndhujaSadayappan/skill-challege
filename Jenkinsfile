pipeline {
    agent any

    environment {
        // Set this to your Docker Hub username or retrieve it from Jenkins Credentials
        DOCKER_HUB_USER = 'indhujavs' 
        
        // Define images with tags for consistency
        BACKEND_IMAGE  = "${DOCKER_HUB_USER}/skill-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/skill-frontend"
        
        // Jenkins Credentials ID
        DOCKER_CREDS_ID = 'docker-creds'
        
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
                script {
                    echo 'Installing project dependencies in parallel...'
                    // Parallelizing backend and frontend installs saves time
                    // Omitted 'npm cache clean --force' as it slows down CI significantly
                    // Omitted root 'npm ci' as 'concurrently' is not needed for the pipeline
                    parallel(
                        "Backend Deps": {
                            dir('backend') {
                                sh 'npm ci --prefer-offline --no-audit --no-fund'
                            }
                        },
                        "Frontend Deps": {
                            dir('frontend') {
                                sh 'npm ci --prefer-offline --no-audit --no-fund'
                            }
                        }
                    )
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
                    echo "Starting Parallel Docker Build and Push..."
                    // This pulls the Docker Hub username and password from Jenkins credentials
                    // Ensuring we use the credentials provided in the script
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                        
                        def HUB_USER = env.DOCKER_USER
                        // Login once before starting parallel builds
                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"

                        parallel(
                            "Backend Build & Push": {
                                echo "--- Processing Backend Image ---"
                                // Pull latest image to use as cache source to save time
                                sh "docker pull ${HUB_USER}/skill-backend:latest || true"
                                // Build with BuildKit and Cache-From
                                sh """
                                    export DOCKER_BUILDKIT=1
                                    docker build \
                                    --cache-from ${HUB_USER}/skill-backend:latest \
                                    -t ${HUB_USER}/skill-backend:latest \
                                    -t ${HUB_USER}/skill-backend:${BUILD_NUMBER} \
                                    ./backend
                                """
                                // Push both tags
                                sh "docker push ${HUB_USER}/skill-backend:latest"
                                sh "docker push ${HUB_USER}/skill-backend:${BUILD_NUMBER}"
                            },
                            "Frontend Build & Push": {
                                echo "--- Processing Frontend Image ---"
                                // Pull latest image to use as cache source to save time
                                sh "docker pull ${HUB_USER}/skill-frontend:latest || true"
                                // Build with BuildKit and Cache-From
                                sh """
                                    export DOCKER_BUILDKIT=1
                                    docker build \
                                    --cache-from ${HUB_USER}/skill-frontend:latest \
                                    -t ${HUB_USER}/skill-frontend:latest \
                                    -t ${HUB_USER}/skill-frontend:${BUILD_NUMBER} \
                                    ./frontend
                                """
                                // Push both tags
                                sh "docker push ${HUB_USER}/skill-frontend:latest"
                                sh "docker push ${HUB_USER}/skill-frontend:${BUILD_NUMBER}"
                            }
                        )
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
