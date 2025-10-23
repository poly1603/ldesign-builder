/**
 * GitHub Actions 集成模板
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 生成 GitHub Actions 工作流
 */
export function generateGitHubActionsWorkflow(options: {
  name?: string
  nodeVersions?: string[]
  enableCache?: boolean
  runTests?: boolean
  publishNPM?: boolean
}): string {
  const opts = {
    name: options.name || 'Build and Test',
    nodeVersions: options.nodeVersions || ['18.x', '20.x'],
    enableCache: options.enableCache !== false,
    runTests: options.runTests !== false,
    publishNPM: options.publishNPM || false
  }

  return `name: ${opts.name}

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [${opts.nodeVersions.map(v => `'${v}'`).join(', ')}]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        ${opts.enableCache ? 'cache: \'pnpm\'' : ''}
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Build with @ldesign/builder
      run: pnpm run build
    
    ${opts.runTests ? `- name: Run tests
      run: pnpm test` : ''}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-\${{ matrix.node-version }}
        path: |
          dist/
          es/
          lib/
          *.tgz
    
    ${opts.publishNPM ? `- name: Publish to NPM
      if: github.ref == 'refs/heads/main' && matrix.node-version == '20.x'
      run: |
        npm config set //registry.npmjs.org/:_authToken \${{ secrets.NPM_TOKEN }}
        npm publish --access public
      env:
        NPM_TOKEN: \${{ secrets.NPM_TOKEN }}` : ''}
`
}

/**
 * 生成性能测试工作流
 */
export function generatePerformanceWorkflow(): string {
  return `name: Performance Benchmark

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0' # 每周日运行

jobs:
  benchmark:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Run benchmark
      run: pnpm run benchmark
    
    - name: Store benchmark result
      uses: benchmark-action/github-action-benchmark@v1
      with:
        tool: 'customSmallerIsBetter'
        output-file-path: benchmark-results.json
        github-token: \${{ secrets.GITHUB_TOKEN }}
        auto-push: true
`
}


