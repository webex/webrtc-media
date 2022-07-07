# Contributing
Thank you for considering contributing to this repository!

We'd love for you to contribute to our source code and to make **webrtc media core library** even better than it is today!
If you would like to contribute to this repository by adding features, enhancements, or bug fixes, you must follow our process:

  1. Draft a proposal (Confluence or Jira) explaining your contribution and business value
  2. Share your proposal in the [WebRTC Library Developers space](webexteams://im?space=94531ea0-e0e5-11eb-aebd-436680c81de9)
  3. If your task is approved you should start coding at this point
  4. We recommend opening a draft PR to receive feedback before finalizing your solution
      - When opening a draft PR, specify with PR comments wherein the code you would like to get feedback
  5. Before opening a PR ensure **all** [PR guidelines](#submitting-a-pull-request) are followed
  6. Let members know about your PR by posting a message in the [WebRTC Library Developers space](webexteams://im?space=94531ea0-e0e5-11eb-aebd-436680c81de9)
  7. Members will review the pull request and provide feedback when necessary
      - If a PR is too large, you may be asked to break it down into multiple smaller-scoped PRs
  8. Once the PR is approved by a member, it will be merged
  9. Celebrate! Your code is released 🎈🎉🍻


  ## Table of Contents

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [Contributing Guide](#contributing-guide)
    - [Project Dependencies](#project-dependencies)
    - [Getting Started](#getting-started)
    - [Environment Variables](#environment-variables)
    - [Running Tests](#running-tests)
      - [Testing in debug mode](#testing-in-debug-mode)
      - [Integration Testing](#integration-testing)
        - [Integration Testing with Sauce Labs](#integration-testing-with-sauce-labs)
    - [Git Commit Guidelines](#git-commit-guidelines)
      - [Commit Message Format](#commit-message-format)
      - [Revert](#revert)
      - [Type](#type)
      - [Scope](#scope)
      - [Subject](#subject)
      - [Body](#body)
      - [Footer](#footer)
      - [Special Commit Messages](#special-commit-messages)
        - [`[skip npm]`](#skip-npm)
        - [`[skip ci]`](#skip-ci)
    - [Submitting a Pull Request](#submitting-a-pull-request)
    - [Pull Request Checklist](#pull-request-checklist)

## Contributing Guide

### Project Dependencies

Before you can build the Cisco webRTC media core library, you will need the following dependencies:
Detailed dependencies mentioned in [package.json](./package.json)

- [Node.js](https://nodejs.org/) (LTS)
  - We recommend using [nvm](https://github.com/creationix/nvm) (or [nvs](https://github.com/jasongin/nvs) on Windows _(not WSL)_) to easily switch between Node.js versions
  - Run `nvm use` to set your node version to the one this package expects
    - If the required node version is not installed, `nvm`/`nvs` will tell you the command needed to install it
- [Git](https://git-scm.com/)
- [Yarn](https://yarnpkg.com/)
    - We recommend using [Yarn](https://yarnpkg.com/) as package manager for adding removing and installing packages.


### Getting Started

Ensure that you have followed all the steps outlined in [Project Dependencies](#project-dependencies).

Fork the [webrtc-media-core](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core) repository and `git clone` your fork:

```bash
git@sqbu-github.cisco.com:<CEC ID>/webrtc-media-core.git
```

Install dependencies with:

```bash
cd webrtc-media-core/
yarn install
```

Building:

```bash
yarn build
```

### Environment Variables

You will need to create a file called `.env` that defines, at a minimum:

- `SAUCE_USERNAME`
- `SAUCE_ACCESS_KEY`

```bash
#.env
# Update your SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables below
SAUCE_USERNAME="YOUR_SAUCE_USERNAME"
SAUCE_ACCESS_KEY="YOUR_SAUCE_ACCESS_KEY"
```

Make sure your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables are set in ```.env``` file.

### Running Tests

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

Read this before testing in debug mode -

`--browser --karma-debug` will run the browser tests with `{singleRun: false}`, thus allowing automatic rerunning everytime you save a file (though, karma does eventually get confused and you need to interrupt and restart the command).

You can use the `--browsers` _(not to be confused with the `--browser` tag)_ allows you to specify which browsers you want to run locally. This is restricted to what browsers are installed and available to you on your OS.
The default browsers that launch are _Headless_ version of Firefox and Chrome, so `--browsers Chrome Edge` will only launch a normal version of Chrome along with Edge. If you add `defaults` to the browsers flag, it will also launch `ChromeHeadless` and `FirefoxHeadless` along with other browsers you've specified. All browsers include flags to enable WebRTC features and permissions.

### Integration Testing

```shell
yarn run test:integration
```

### Integration Testing with Sauce Labs

1. Add ```.env``` file in your project.
```shell
#.env
# Update your SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables below
SAUCE_USERNAME="YOUR_SAUCE_USERNAME"
SAUCE_ACCESS_KEY="YOUR_SAUCE_ACCESS_KEY"
```
2. Make sure your SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set in ```.env``` file.
`SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` are credentials from your [SauceLabs account](https://docs.saucelabs.com/basics/environment-variables/)

3. Run the below command in the terminal.
```shell
SAUCE=true yarn run test:integration
```
4. Sauce labs link in the results or Open your Sauce labs and filter test with your name and see the test case.

Read this before testing with [SauceLabs] -

To run tests on [SauceLabs](https://saucelabs.com/) locally, you'll need to add a inline environment variable, `SAUCE=true`. Like mentioned above you can specify which browsers you'd like to test on with the `--browers` flag, but with SauceLabs service available to you, you can also specify which OS you'd like to test on. With the `--os` flag you have the option on testing on `Mac` and `Windows`. You can filter down the browsers that get launched by using the `--browsers` flag, so if you use `--os Windows --browsers Edge IE` it will launch only `Edge` and `IE`. Specifying just `--browsers` with `SAUCE=true` will launch that browsers in all available OSs, so `--browsers Firefox` will launch `Firefox` in `Mac` and `Windows`.
> **The default SauceLabs configuration _"`SAUCE=true yarn run test:integration`"_ is the latest versions of `Chrome` and `Firefox` on both `Mac` and `Windows`, along with `Edge` and `IE 11` on Windows, and `Safari` on Mac**
>
> `--os Mac` will launch `Chrome`, `Firefox`, and `Safari`
>
> `--os Windows` will launch `Chrome`, `Firefox`, `Edge`, and `IE 11`
>
> `--os Linux` WILL NEED `--browsers Firefox` as SauceLabs only supports `Firefox 45` for Linux. This is why it's also not included by default and requires two flags

### Git Commit Guidelines

We follow the (Conventional Commits)[https://www.conventionalcommits.org/] specification when writing commits and are run/linted through [conventional changelog](https://github.com/conventional-changelog/conventional-changelog)
to generate the changelog. Please adhere to the following guidelines when formatting your commit messages.

#### Commit Message Format

Each commit message consists of a **header**, a **body** and a **footer**. The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the scope of the header is optional.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier to read on GitHub as well as in various git tools.

#### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>`., where the hash is the SHA of the commit being reverted.

#### Type

> Examples can be found on the (Conventional Commits website)[https://www.conventionalcommits.org/en/v1.0.0/#examples]
The following types will cause a version bump:

- **fix**: Patches a bug in the code and directly corresponds to the **PATCH**
- **perf**: A code change that improves performance and corresponds to the **PATCH**
- **feat**: Describes a new feature and corresponds to the **MINOR**
- **BREAKING CHANGE**: a commit that has a footer `BREAKING CHANGE:`, or appends a `!` after the type/scope, introduces a breaking API change (correlating with **MAJOR** in semantic versioning).

> Appending a `!` and/or a `BREAKING CHANGE:` footer to **ANY TYPE** will denote a **BREAKING CHANGE** and will cause a **MAJOR** bump
The following types will _**not**_ cause a version bump:

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **refactor**: A code change that neither fixes a bug, adds a feature, nor changes affecting the public API and corresponds to the **PATCH**
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests

#### Scope

The scope should indicate what is being changed. Generally, these should match module names. For example, `media`, `track`, `device`, etc. Other than module names, the name of the tooling tends to be the most common.


#### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

#### Body

Just as in the **subject** the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

#### Footer

The footer should contain any information about **Breaking changes** and is also the place to reference GitHub issues that this commit **closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

#### Special Commit Messages

These are commit messages that will have an impact on how the build pipeline behaves. They are not to be used without prior approval.

All of these commit messages should include an explanation for why you're using them. You'll need to commit with `-n` or `--no-verify` to bypass the commit message linter.
> For example
> `git commit -m "docs(webex-core): [skip npm] - docs change" --no-verify`
##### `[skip npm]`

This will run through the all the Github Checks, but will skip any version bumping, tagging, and subsequent publishing to npm after a pull request is merged.

##### `[skip ci]`

This will skip the CircleCI pipeline entirely.

### Submitting a Pull Request

Before developing a new feature, be sure to search the [Pull Requests](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/pulls) for your idea to ensure you're not creating a duplicate change. Then, create a development branch in your forked repository for your idea and start coding!

When you're ready to submit your change, first check that new commits haven't been made in the upstream's `master` branch. If there are new commits, rebase your development branch to ensure a fast-forward merge when your Pull Request is approved:

```bash
# Fetch upstream master and update your local master branch
git fetch upstream
git checkout master
git merge upstream/master
# Rebase your development branch
git checkout feature
git rebase master
```

Finally, open a [new Pull Request](https://sqbu-github.cisco.com/WebExSquared/webrtc-media-core/compare) with your changes. Be sure to mention the issues this request addresses in the body of the request. Once your request is opened, a developer will review, comment, and, when approved, merge your changes!

### Pull Request Checklist

Before you open that new pull request, make sure to have completed the following checklist:

- Code follows the style guidelines of this project
- I have performed a self-review of my code
- I have commented my code, particularly in hard-to-understand areas
- I have made corresponding changes to the documentation
- My changes generate no new warnings
- I have added tests that prove my fix is effective or that my feature works
- New and existing unit tests pass locally with my changes
- Any dependent changes have been merged and published in downstream modules


[README.md](./README.md) file with details. Thank you again!!