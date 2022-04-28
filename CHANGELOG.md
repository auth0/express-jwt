# Change Log

All notable changes to this project will be documented in this file starting from version **v4.0.0**.
This project adheres to [Semantic Versioning](http://semver.org/).

## 7.5.2 - 2022-04-27

- export another type for credentialsRequired: false / ExpressJwtRequestUnrequired ([1bdb6f3d0cc5f61b7a7b097f700d20cb337d4bef](https://github.com/auth0/express-jwt/commit/1bdb6f3d0cc5f61b7a7b097f700d20cb337d4bef))

## 7.5.1 - 2022-04-27

- make req.auth optional in the ExpressJwtRequest type ([496fda4a0a20292ca70055b6ab8fdf50414ffa2b](https://github.com/auth0/express-jwt/commit/496fda4a0a20292ca70055b6ab8fdf50414ffa2b))
- update changelog ([727b57ddfec1f1c5ee4e16cb335ad1ae5a3c131f](https://github.com/auth0/express-jwt/commit/727b57ddfec1f1c5ee4e16cb335ad1ae5a3c131f))

## 7.5.0 - 2022-04-25

- export TokenGetter ([eb7479b834fb0e052ffad4279394ce353bb13770](https://github.com/auth0/express-jwt/commit/eb7479b834fb0e052ffad4279394ce353bb13770))
- improve readme and some types. Closes #283 ([1a67f69c8781179d3ce7e5f3de8ece40d31c1772](https://github.com/auth0/express-jwt/commit/1a67f69c8781179d3ce7e5f3de8ece40d31c1772)), closes [#283](https://github.com/auth0/express-jwt/issues/283)
- restore requestProperty ([bf143d07497046b3e7921d3dd4bcbc18e2daeb67](https://github.com/auth0/express-jwt/commit/bf143d07497046b3e7921d3dd4bcbc18e2daeb67))

## 7.4.3 - 2022-04-21

- improve readme ([bd2515bec698604c645decd5be93e4f401263662](https://github.com/auth0/express-jwt/commit/bd2515bec698604c645decd5be93e4f401263662))

## 7.4.2 - 2022-04-20

- include '/dist' in package, closes #280 ([cf2665d5581e76ed5742e7c2f34b8d05f91cfd18](https://github.com/auth0/express-jwt/commit/cf2665d5581e76ed5742e7c2f34b8d05f91cfd18)), closes [#280](https://github.com/auth0/express-jwt/issues/280)

## 7.4.1 - 2022-04-20

- fix readme definition for revoked and secret callbacks ([9015cf729cfbbf1b28a9646cccbf26d523dce1de](https://github.com/auth0/express-jwt/commit/9015cf729cfbbf1b28a9646cccbf26d523dce1de))
- update changelog ([05d7a78baaf76a2a881a95666b0ec7349729d957](https://github.com/auth0/express-jwt/commit/05d7a78baaf76a2a881a95666b0ec7349729d957))

## 7.4.0 - 2022-04-20

- handle authorization header in cors when is upper cased. fixes #180, #173 ([ab0ee806416e3a5a48ef8a1017a298e1a666b17a](https://github.com/auth0/express-jwt/commit/ab0ee806416e3a5a48ef8a1017a298e1a666b17a)), closes [#180](https://github.com/auth0/express-jwt/issues/180) [#173](https://github.com/auth0/express-jwt/issues/173)

## 7.3.0 - 2022-04-20

- add support for capital Authorization header. closes #200 ([6c0698b513e11ff1d4b152e070a627f5092be801](https://github.com/auth0/express-jwt/commit/6c0698b513e11ff1d4b152e070a627f5092be801)), closes [#200](https://github.com/auth0/express-jwt/issues/200)

## 7.2.0 - 2022-04-20

- Add example on how to enable jwt for specific path ([280511342522f11a90da93187a44af1a1b3cf5eb](https://github.com/auth0/express-jwt/commit/280511342522f11a90da93187a44af1a1b3cf5eb))
- Fix link to auth0.com ([b04cb9dea9a9fb2dc999a8dbf30ba6f204f50d15](https://github.com/auth0/express-jwt/commit/b04cb9dea9a9fb2dc999a8dbf30ba6f204f50d15))
- remove travis badge ([a854342c28f7186ec70e298124b4d650a26767b2](https://github.com/auth0/express-jwt/commit/a854342c28f7186ec70e298124b4d650a26767b2))
- Update docs to continue error handling on mismatch ([627b358d07b19d299964a5ef18a772db9b6426e2](https://github.com/auth0/express-jwt/commit/627b358d07b19d299964a5ef18a772db9b6426e2))
- Update README.md ([8d7af267189a49f42b88807d236647bd7398fde3](https://github.com/auth0/express-jwt/commit/8d7af267189a49f42b88807d236647bd7398fde3))

## 7.1.0 - 2022-04-20

- add support for async, closes #249 ([72236ec1cfb0e7847351c83908be1d84141e30f1](https://github.com/auth0/express-jwt/commit/72236ec1cfb0e7847351c83908be1d84141e30f1)), closes [#249](https://github.com/auth0/express-jwt/issues/249)
- update changelog ([cb50ed43b2de9ae9be8643e7834640fa912ef367](https://github.com/auth0/express-jwt/commit/cb50ed43b2de9ae9be8643e7834640fa912ef367))

## 7.0.0 - 2022-04-20

- Convert the project to typescript and improve typescript ([2b43ccb7252f2cc2fb3c2655a252fd7ae58ce0dd](https://github.com/auth0/express-jwt/commit/2b43ccb7252f2cc2fb3c2655a252fd7ae58ce0dd))

## 6.1.2 - 2022-04-20

- fix: package.json & package-lock.json to reduce vulnerabilities ([c7881ad378063236d85b1e1b0f4a252b63b8e75b](https://github.com/auth0/express-jwt/commit/c7881ad378063236d85b1e1b0f4a252b63b8e75b))

## 6.1.1 - 2022-02-21

- Fix prototype pollution vulnerability. ([551bf40a74553a13e7314488b32648d474c182f7](https://github.com/auth0/express-jwt/commit/551bf40a74553a13e7314488b32648d474c182f7))

## 6.1.0 - 2021-08-11

- Update readme on 6.0.0 changes ([43b7921c2cb60d781655ac5527a8a47d9fb428fc](https://github.com/auth0/express-jwt/commit/43b7921c2cb60d781655ac5527a8a47d9fb428fc))
- Updated changelog ([ed743a8fa28d32de3166ab6cf5bae1315669678a](https://github.com/auth0/express-jwt/commit/ed743a8fa28d32de3166ab6cf5bae1315669678a))

## 6.0.0 - 2020-06-29

- Made algorithms mandatory ([304a1c5968aed7c4c520035426fc09142156669d](https://github.com/auth0/express-jwt/commit/304a1c5968aed7c4c520035426fc09142156669d))

## 5.3.3 - 2020-04-07

- Add a note about OAuth2 bearer tokens ([c5d841966b70584fa51f766d7cb2b17ae1db6681](https://github.com/auth0/express-jwt/commit/c5d841966b70584fa51f766d7cb2b17ae1db6681))
- Make clearer sections in the Readme ([8662579f1af7ba1d8b6a35718243bd719600a23f](https://github.com/auth0/express-jwt/commit/8662579f1af7ba1d8b6a35718243bd719600a23f))
- Update Readme and use a consistent JS style for code examples ([888f0e9d2cb3026a50b2812a0eebe7a5d5011744](https://github.com/auth0/express-jwt/commit/888f0e9d2cb3026a50b2812a0eebe7a5d5011744))
- Update README.md ([d3e86bffb6f0c629cbb95e9b27432e4860d8bc5a](https://github.com/auth0/express-jwt/commit/d3e86bffb6f0c629cbb95e9b27432e4860d8bc5a))

## 5.3.2 - 2020-04-07

- fix dependencies vulnerabilities and test against 8, 10 and 12 from now on ([178928266c3cf2fed3f9e013722cc8d29d4672ba](https://github.com/auth0/express-jwt/commit/178928266c3cf2fed3f9e013722cc8d29d4672ba))
- fix license field ([f4f4d1d6bf78d498688f1b1936551546715d01e9](https://github.com/auth0/express-jwt/commit/f4f4d1d6bf78d498688f1b1936551546715d01e9))
