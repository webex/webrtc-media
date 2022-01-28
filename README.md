![Logo of the project](https://avatars.githubusercontent.com/u/15900782?s=100&v=4)
# webrtc-media-core

> A framework for interacting with WebRTC across multiple browsers.

> https://confluence-eng-gpk2.cisco.com/conf/display/WBXT/Webrtc+Media+Core+Framework

 
## Developing

```shell
git clone https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core
cd webrtc-media-core/
yarn install
```

### Building

If your project needs some additional steps for the developer to build the
project after some code changes, state them here:

```shell
yarn build
```

### Testing

```shell
yarn test
```

### Testing in debug mode

```shell
yarn test:debug
```

1.	After the above command, open up http://localhost:9876/debug.html in browser and do inspect element. (Note - HTTP & not HTTPS)
1.	Here, the test files would be available in sources tab, where debuggers can be set and refresh the page to run tests again.
1.	It also looks out for changes. So, whenever the test file changes, the test cases re-run in terminal and latest changes reflect in debug.html upon page refresh.

### Deploying / Publishing

In case there's some step you have to take that publishes this project to a
server, this is the right time to state it.

```shell
yarn release
```
