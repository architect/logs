# `@architect/logs` [![GitHub CI status](https://github.com/architect/logs/workflows/Node%20CI/badge.svg)](https://github.com/architect/logs/actions?query=workflow%3A%22Node+CI%22)
<!-- [![codecov](https://codecov.io/gh/architect/logs/branch/master/graph/badge.svg)](https://codecov.io/gh/architect/logs) -->

[@architect/logs][npm] is a module that retrieves and clears logs associated to
your @architect functions across environments.

## Installation

    npm i @architect/logs
    let logs = require('@architect/logs')

# API

## `logs({pathToCode, verbose, destroy, production}, callback)`

Takes a parameter object as first argument which accepts the following properties:

- `pathToCode`: **required** the local path to architect Function code relative
    to the current working directory, i.e. `src/http/get-index`
- `verbose`: verbose super chatty mode
- `destroy`: if truthy will delete logs via [`logs.destroy`][destroy], otherwise will
    read logs via [`logs.read`][read]
- `production`: if truthy will target your arc project's production environment,
    otherwise will default to staging

By default will [read][read] logs from the staging environment. If the `destroy`
property is truthy, logs instead will be [destroyed][destroy].

## `logs.read({name, pathToCode, ts}, callback)`

Will read logs from [`aws.CloudWatchLogs`][cloudwatchlogs], invoking
[`getLogEvents`][getlogevents] for log retrieval.

Takes a parameter object as first argument which accepts the following properties:

- `name`: the CloudFormation `StackName` passed to
    [`listStackResources`][liststack] within which to search Function logs. Note
    that this is inferred from your application name, environment and specific
    function you are querying - tread carefully!
- `pathToCode`: **required** the local path to architect Function code relative
    to the current working directory, i.e. `src/http/get-index`
- `ts`: timestamp to use as a start time for displaying length of time details
    (i.e. `Date.now()`)

`callback` will be invoked with an error if an error arises during execution.
Otherwise, `callback` will be invoked without arguments.

## `logs.destroy({name, pathToCode, ts}, callback)`

Will delete logs from [`aws.CloudWatchLogs`][cloudwatchlogs], invoking
[`deleteLogGroup`][deleteloggroup].

Takes a parameter object as first argument which accepts the following properties:

- `name`: the CloudFormation `StackName` passed to
    [`listStackResources`][liststack] within which to search Function logs. Note
    that this is inferred from your application name, environment and specific
    function you are querying - tread carefully!
- `pathToCode`: **required** the local path to architect Function code relative
    to the current working directory, i.e. `src/http/get-index`
- `ts`: timestamp to use as a start time for displaying length of time details
    (i.e. `Date.now()`)

`callback` will be invoked with an error if an error arises during execution.
Otherwise, `callback` will be invoked without arguments.

[npm]: https://www.npmjs.com/package/@architect/logs
[read]: #logsreadname-pathtocode-ts-callback
[destroy]: #logsdestroyname-pathtocode-ts-callback
[liststack]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFormation.html#listStackResources-property
[cloudwatchlogs]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html
[getlogevents]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#getLogEvents-property
[deleteloggroup]: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatchLogs.html#deleteLogGroup-property
