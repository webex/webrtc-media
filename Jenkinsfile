#!groovy
library identifier: 'sparkPipeline', changelog: false

sparkPipeline {
  name = 'webrtc-media-core'
  services = []
  junitPattern = '**/junit.xml'
  numToKeep = 5
  notifySparkRoomId = 'Y2lzY29zcGFyazovL3VzL1JPT00vM2I2ZmY0MjAtZjI2YS0xMWViLWI1MWMtZmZjMTg3YWY3Yjgw'
  builder = 'NODE_JS_BUILDER'

  build = { services ->
    this.sh './pipeline/setup.sh'
    this.sh './pipeline/unit-test.sh'

    if(this.isMasterBranch()) {
      this.sh './pipeline/build.sh'
      this.sh './pipeline/release.sh'
      integration.deployMode = 'skip'
      production.deployMode = 'skip'
    }
  }
}
