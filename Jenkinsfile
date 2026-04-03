pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout()
    }

    parameters {
        string(name: 'AWS_REGION', defaultValue: 'ap-southeast-1', description: 'AWS region for S3 and CloudFront')
        string(name: 'S3_BUCKET', defaultValue: 'bitenex-prod-admin-640168447652', description: 'S3 bucket for static admin assets')
        string(name: 'CLOUDFRONT_DISTRIBUTION_ID', defaultValue: 'E3BIV8XFFLG4RF', description: 'CloudFront distribution id')
        string(name: 'API_BASE_URL', defaultValue: 'https://api.catcosy.shop/api/v1', description: 'Public API base URL used by Nuxt runtime config')
        string(name: 'DEPLOY_BRANCHES', defaultValue: 'develop,main,master', description: 'Comma-separated branches allowed to deploy')
    }

    environment {
        AWS_REGION = 'ap-southeast-1'
        S3_BUCKET = 'bitenex-prod-admin-640168447652'
        CLOUDFRONT_DISTRIBUTION_ID = 'E3BIV8XFFLG4RF'
        API_BASE_URL = 'https://api.catcosy.shop/api/v1'
        DEPLOY_BRANCHES = 'develop,master'
    }

    stages {
        stage('Build') {
            steps {
                checkout scm
                script {
                    def resolvedBranch = env.CHANGE_TARGET?.trim()

                    if (!resolvedBranch) {
                        resolvedBranch = env.BRANCH_NAME?.trim()
                    }

                    if (!resolvedBranch) {
                        def gitBranch = env.GIT_BRANCH?.trim()
                        if (gitBranch?.startsWith('origin/')) {
                            gitBranch = gitBranch.substring('origin/'.length())
                        }
                        resolvedBranch = gitBranch
                    }

                    if (!resolvedBranch) {
                        resolvedBranch = 'develop'
                    }

                    def shortCommit = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
                    def awsRegion = params.AWS_REGION?.trim() ?: env.AWS_REGION
                    def bucket = params.S3_BUCKET?.trim() ?: env.S3_BUCKET
                    def distribution = params.CLOUDFRONT_DISTRIBUTION_ID?.trim() ?: env.CLOUDFRONT_DISTRIBUTION_ID
                    def apiBase = params.API_BASE_URL?.trim() ?: env.API_BASE_URL
                    def deployBranches = params.DEPLOY_BRANCHES?.trim() ?: env.DEPLOY_BRANCHES

                    echo "CHANGE_TARGET=${env.CHANGE_TARGET ?: ''}"
                    echo "BRANCH_NAME=${env.BRANCH_NAME ?: ''}"
                    echo "GIT_BRANCH=${env.GIT_BRANCH ?: ''}"
                    echo "Deploy branch resolved from Jenkins context: ${resolvedBranch}"
                    echo "Commit: ${shortCommit}"
                    echo "AWS region: ${awsRegion}"
                    echo "S3 bucket: ${bucket}"
                    echo "CloudFront distribution: ${distribution}"
                    echo "API base URL: ${apiBase}"
                    echo "Deploy branches: ${deployBranches}"

                    writeFile file: '.jenkins-build.env', text: """BUILD_BRANCH=${resolvedBranch}
                      SHORT_COMMIT=${shortCommit}
                      AWS_REGION=${awsRegion}
                      S3_BUCKET=${bucket}
                      CLOUDFRONT_DISTRIBUTION_ID=${distribution}
                      API_BASE_URL=${apiBase}
                      DEPLOY_BRANCHES=${deployBranches}
                      """
                }

                sh '''#!/usr/bin/env bash
                    set -euo pipefail
                    set -a
                    . ./.jenkins-build.env
                    set +a

                    allowed_csv=",${DEPLOY_BRANCHES},"
                    current_branch=",${BUILD_BRANCH},"

                    if [[ "${allowed_csv}" != *"${current_branch}"* ]]; then
                        echo "Branch ${BUILD_BRANCH} is not in deploy allowlist (${DEPLOY_BRANCHES}). Skipping build."
                        exit 0
                    fi

                    npm ci
                    NUXT_PUBLIC_API_BASE="${API_BASE_URL}" npm run generate
                    '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''#!/usr/bin/env bash
                    set -euo pipefail
                    set -a
                    . ./.jenkins-build.env
                    set +a

                    allowed_csv=",${DEPLOY_BRANCHES},"
                    current_branch=",${BUILD_BRANCH},"

                    if [[ "${allowed_csv}" != *"${current_branch}"* ]]; then
                        echo "Branch ${BUILD_BRANCH} is not in deploy allowlist (${DEPLOY_BRANCHES}). Skipping deployment."
                        exit 0
                    fi

                    aws sts get-caller-identity --region "${AWS_REGION}"

                    aws s3 sync .output/public/ "s3://${S3_BUCKET}" --delete
                    aws s3 cp .output/public/ "s3://${S3_BUCKET}" \
                        --recursive \
                        --exclude "*" \
                        --include "*.html" \
                        --cache-control "public,max-age=0,must-revalidate"
                    aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*"
                    '''
            }
        }
    }

    post {
        success {
            echo 'bitenex-admin deployment completed.'
        }
        failure {
            echo 'bitenex-admin deployment failed. Check stage logs for details.'
        }
    }
}
