/**
 * CI 配置生成器
 * 
 * 生成各种 CI/CD 平台的配置文件
 */

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs'
import { logger } from '../../utils/logger'

// ========== GitHub Actions 模板 ==========

const GITHUB_ACTIONS_BUILD = `name: Build

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npx ldesign-builder typecheck --ci
      
      - name: Build
        run: npx ldesign-builder build
      
      - name: Check bundle size
        run: npx ldesign-builder size --ci
      
      - name: Security audit
        run: npx ldesign-builder audit --ci
        continue-on-error: true
`

const GITHUB_ACTIONS_RELEASE = `name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npx ldesign-builder build
      
      - name: Publish to npm
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}
      
      - name: Generate changelog
        run: npx ldesign-builder changelog --output RELEASE_NOTES.md
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body_path: RELEASE_NOTES.md
          files: |
            dist/*.js
            dist/*.d.ts
`

const GITHUB_ACTIONS_TEST = `name: Test

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check circular dependencies
        run: npx ldesign-builder circular --fail-on-circular
      
      - name: Type check
        run: npx ldesign-builder typecheck --ci
      
      - name: Run tests
        run: npm test
      
      - name: Check outdated dependencies
        run: npx ldesign-builder outdated
        continue-on-error: true
`

// ========== GitLab CI 模板 ==========

const GITLAB_CI = `image: node:20

stages:
  - install
  - test
  - build
  - release

cache:
  key: \${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/

install:
  stage: install
  script:
    - npm ci --cache .npm --prefer-offline
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

typecheck:
  stage: test
  script:
    - npx ldesign-builder typecheck --ci
  dependencies:
    - install

circular:
  stage: test
  script:
    - npx ldesign-builder circular --fail-on-circular
  dependencies:
    - install

audit:
  stage: test
  script:
    - npx ldesign-builder audit --ci
  allow_failure: true
  dependencies:
    - install

build:
  stage: build
  script:
    - npx ldesign-builder build
    - npx ldesign-builder size --ci
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  dependencies:
    - install

publish:
  stage: release
  script:
    - echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc
    - npm publish --access public
  only:
    - tags
  dependencies:
    - build
`

// ========== CircleCI 模板 ==========

const CIRCLECI = `version: 2.1

orbs:
  node: circleci/node@5.1

jobs:
  build-and-test:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - node/install-packages:
          pkg-manager: npm
      - run:
          name: Type check
          command: npx ldesign-builder typecheck --ci
      - run:
          name: Check circular dependencies
          command: npx ldesign-builder circular --fail-on-circular
      - run:
          name: Build
          command: npx ldesign-builder build
      - run:
          name: Check bundle size
          command: npx ldesign-builder size --ci
      - persist_to_workspace:
          root: .
          paths:
            - dist

  publish:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Publish to npm
          command: |
            echo "//registry.npmjs.org/:_authToken=\$NPM_TOKEN" > .npmrc
            npm publish --access public

workflows:
  build-test-publish:
    jobs:
      - build-and-test
      - publish:
          requires:
            - build-and-test
          filters:
            tags:
              only: /^v.*/
            branches:
              ignore: /.*/
`

// ========== Azure Pipelines 模板 ==========

const AZURE_PIPELINES = `trigger:
  branches:
    include:
      - main
      - master
  tags:
    include:
      - v*

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    jobs:
      - job: BuildJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
            displayName: 'Install Node.js'
          
          - script: npm ci
            displayName: 'Install dependencies'
          
          - script: npx ldesign-builder typecheck --ci
            displayName: 'Type check'
          
          - script: npx ldesign-builder build
            displayName: 'Build'
          
          - script: npx ldesign-builder size --ci
            displayName: 'Check bundle size'
          
          - task: PublishBuildArtifacts@1
            inputs:
              pathtoPublish: 'dist'
              artifactName: 'build'

  - stage: Publish
    condition: startsWith(variables['Build.SourceBranch'], 'refs/tags/v')
    jobs:
      - job: PublishJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: '20.x'
          
          - script: |
              echo "//registry.npmjs.org/:_authToken=\$(NPM_TOKEN)" > .npmrc
              npm publish --access public
            displayName: 'Publish to npm'
`

// ========== Travis CI 模板 ==========

const TRAVIS_CI = `language: node_js

node_js:
  - '20'
  - '18'

cache:
  npm: true

install:
  - npm ci

script:
  - npx ldesign-builder typecheck --ci
  - npx ldesign-builder circular --fail-on-circular
  - npx ldesign-builder build
  - npx ldesign-builder size --ci

jobs:
  include:
    - stage: deploy
      node_js: '20'
      if: tag =~ ^v
      script:
        - npx ldesign-builder build
      deploy:
        provider: npm
        email: "\$NPM_EMAIL"
        api_key: "\$NPM_TOKEN"
        on:
          tags: true
`

// ========== 命令定义 ==========

export const ciCommand = new Command('ci')
  .description('CI/CD 配置生成')
  .addCommand(
    new Command('init')
      .description('生成 CI 配置文件')
      .option('--github', '生成 GitHub Actions 配置')
      .option('--gitlab', '生成 GitLab CI 配置')
      .option('--circleci', '生成 CircleCI 配置')
      .option('--azure', '生成 Azure Pipelines 配置')
      .option('--travis', '生成 Travis CI 配置')
      .option('--all', '生成所有平台配置')
      .action((options) => {
        const projectPath = process.cwd()
        const generated: string[] = []

        console.log('')
        console.log('🔧 生成 CI/CD 配置')
        console.log('─'.repeat(50))
        console.log('')

        // GitHub Actions
        if (options.github || options.all || Object.keys(options).length === 0) {
          const workflowDir = resolve(projectPath, '.github', 'workflows')
          if (!existsSync(workflowDir)) {
            mkdirSync(workflowDir, { recursive: true })
          }
          
          writeFileSync(join(workflowDir, 'build.yml'), GITHUB_ACTIONS_BUILD)
          writeFileSync(join(workflowDir, 'release.yml'), GITHUB_ACTIONS_RELEASE)
          writeFileSync(join(workflowDir, 'test.yml'), GITHUB_ACTIONS_TEST)
          
          generated.push('.github/workflows/build.yml')
          generated.push('.github/workflows/release.yml')
          generated.push('.github/workflows/test.yml')
        }

        // GitLab CI
        if (options.gitlab || options.all) {
          writeFileSync(resolve(projectPath, '.gitlab-ci.yml'), GITLAB_CI)
          generated.push('.gitlab-ci.yml')
        }

        // CircleCI
        if (options.circleci || options.all) {
          const circleDir = resolve(projectPath, '.circleci')
          if (!existsSync(circleDir)) {
            mkdirSync(circleDir, { recursive: true })
          }
          writeFileSync(join(circleDir, 'config.yml'), CIRCLECI)
          generated.push('.circleci/config.yml')
        }

        // Azure Pipelines
        if (options.azure || options.all) {
          writeFileSync(resolve(projectPath, 'azure-pipelines.yml'), AZURE_PIPELINES)
          generated.push('azure-pipelines.yml')
        }

        // Travis CI
        if (options.travis || options.all) {
          writeFileSync(resolve(projectPath, '.travis.yml'), TRAVIS_CI)
          generated.push('.travis.yml')
        }

        for (const file of generated) {
          console.log(`   ✅ ${file}`)
        }

        console.log('')
        logger.success(`已生成 ${generated.length} 个配置文件`)
        console.log('')
        console.log('💡 配置说明:')
        console.log('   - 需要在 CI 平台设置 NPM_TOKEN 密钥')
        console.log('   - GitHub Release 需要 contents: write 权限')
        console.log('   - 根据项目需求调整配置')
        console.log('')
      })
  )
  .addCommand(
    new Command('show')
      .description('显示 CI 配置模板')
      .argument('<platform>', '平台名称 (github/gitlab/circleci/azure/travis)')
      .action((platform: string) => {
        const templates: Record<string, string> = {
          github: GITHUB_ACTIONS_BUILD,
          gitlab: GITLAB_CI,
          circleci: CIRCLECI,
          azure: AZURE_PIPELINES,
          travis: TRAVIS_CI
        }

        const template = templates[platform.toLowerCase()]
        if (!template) {
          logger.error(`不支持的平台: ${platform}`)
          console.log('支持的平台: github, gitlab, circleci, azure, travis')
          process.exit(1)
        }

        console.log(template)
      })
  )

/**
 * 注册 CI 命令
 */
export function registerCICommand(program: Command): void {
  program.addCommand(ciCommand)
}
