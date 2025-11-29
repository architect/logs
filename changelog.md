# Architect Logs changelog

---

## [7.0.0 - 7.0.1] 2025-11-28

- Updated to node >= 22
- Moved to native node test runner

---

## [6.0.0] 2024-09-24

### Fixed

- Updated deps and moved to node > 20

---

## [5.0.5] 2024-04-30

### Fixed

- Removed unnecessary legacy validation

---

## [5.0.4] 2024-04-29

### Changed

- Updated dependencies
- Updated `package.json` `engines.node` property to reflect changes from v5

---

## [5.0.3] 2024-03-25

### Changed

- Updated dependencies

---

## [5.0.0 - 5.0.2] 2024-01-08

### Changed

- Transitioned from `aws-sdk` to [`aws-lite`](https://aws-lite.org)
- Added Node.js 20.x to test matrix
- Breaking change: removed support for Node.js 14.x (now EOL, and no longer available to created in AWS Lambda)

---

## [4.1.0] 2023-11-02

### Added

- If no Lambda is specified, default to `@http` root handler (if possible)
- Added ability to specify an absolute file path for logs

---

## [4.0.10] 2023-08-14

### Changed

- Updated dependencies

---

## [4.0.7 - 4.0.9] 2023-04-22

### Changed

- Updated dependencies

---

## [4.0.6] 2023-01-18

### Changed

- Updated dependencies

---

## [4.0.5] 2022-11-24

### Added

- Added Node.js 18.x to test matrix


### Changed

- Updated dependencies

---

## [4.0.4] 2022-09-07

### Changed

- Updated dependencies

---

## [4.0.3] 2022-07-26

### Changed

- Updated dependencies

---

## [4.0.2] 2022-05-10

### Changed

- Updated dependencies; sub-dep `lambda-runtimes` adds `nodejs16.x`.

---

## [4.0.1] 2022-03-31

### Changed

- Updated dependencies

---

## [4.0.0] 2022-01-23

### Added

- Architect 10 plugin API support!
- Added `npx arc-logs` direct invocation


### Changed

- Breaking change: bare CLI arguments (e.g. `logs {Lambda src} production`) as aliases to flags are now discarded, please use CLI flags (e.g. `logs {Lambda src} --production` or `logs {Lambda src} -p`)
- Internal change: AWS calls now rely on Inventory region, not `AWS_REGION`
- Stop publishing to the GitHub Package registry
- Updated dependencies

---

## [3.0.3] 2021-11-16

### Changed

- Updated dependencies

---

## [3.0.2] 2021-10-12

### Changed

- Updated dependencies

---

## [3.0.0 - 3.0.1] 2021-07-26

### Changed

- Breaking change: removed support for Node.js 10.x (now EOL, and no longer available to created in AWS Lambda) and Node.js 12.x
- Breaking change: removed support for deprecated `--nuke` flag
- Updated dependencies

---

## [2.1.2 - 2.1.3] 2020-12-04

### Changed

- Updated dependencies

---

## [2.1.1] 2021-05-24

### Added

- `@plugins`-defined Lambdas can now use both `functions` and `pluginFunctions`
    plugin interface methods

---

## [2.1.0] 2021-02-09

### Added

- Support for pulling logs from custom `@plugins`-defined Lambdas

---

## [2.0.1] 2020-12-04

### Changed

- Updated dependencies

---

## [2.0.0] 2020-11-22

### Added

- Added support for new Arc 8.3+ CloudFormation resource names


### Changed

- Implemented Inventory (`@architect/inventory`)
- Updated dependencies
- Breaking API change: `nuke` method has been deprecated in favor of `destroy`
  - `nuke` CLI flags will work for a while longer

---

## [1.0.12 - 1.0.14] 2020-11-16

### Changed

- Updated dependencies


### Fixed

- Improved support for projects with enough CloudFormation resources to paginate calls
  - Thanks @tobytailor + @filmaj!

---

## [1.0.11] 2020-03-24

### Changed

- Updated dependencies

---

## [1.0.10] 2020-03-22

### Changed

- Updated dependencies

---

## [1.0.9] 2020-03-19

### Changed

- Updated dependencies

---

## [1.0.8] 2020-02-05

### Changed

- Updated dependencies

---
