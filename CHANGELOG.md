# Change Log

All notable changes to this project will be documented in this file starting from version **v4.0.0**.
This project adheres to [Semantic Versioning](http://semver.org/).

## 8.1.0 - 2022-12-22

- update type to match jwks-rsa ([bcad8af9cad82b3777cc38d1c05864a35f82bc53](https://github.com/auth0/express-jwt/commit/bcad8af9cad82b3777cc38d1c05864a35f82bc53))
- feat: export middleware options type. closes #308 ([25a30f0d50c02cc75ab17b09f3592e76e09f9666](https://github.com/auth0/express-jwt/commit/25a30f0d50c02cc75ab17b09f3592e76e09f9666)), closes [#308](https://github.com/auth0/express-jwt/issues/308)

## 8.0.0 - 2022-12-22

- Upgrade jsonwebtoken to v9. https://github.com/advisories/GHSA-27h2-hvpr-p74q .

## 7.7.3 - 2022-05-30

- Fix tsc build error for express-unless ([e1fe1d264bc5363e008d23fea9d8c5d2ac0d8198](https://github.com/auth0/express-jwt/commit/e1fe1d264bc5363e008d23fea9d8c5d2ac0d8198))
- Remove esModuleInterop and fix assert import in tests ([9ccf0cfd6aaa4cc61fce2f8ccdb961c4b0358201](https://github.com/auth0/express-jwt/commit/9ccf0cfd6aaa4cc61fce2f8ccdb961c4b0358201))

## 7.7.2 - 2022-05-19

- fix instaceof comparison for UnauthorizedError. closes #292 ([6c87fe401ecba868feda1ffa530082c7c539321a](https://github.com/auth0/express-jwt/commit/6c87fe401ecba868feda1ffa530082c7c539321a)), closes [#292](https://github.com/auth0/express-jwt/issues/292)
- update changelog ([b1344fa7f6f9dd3d27115a9107b3ef4323733895](https://github.com/auth0/express-jwt/commit/b1344fa7f6f9dd3d27115a9107b3ef4323733895))

## 7.7.1 - 2022-05-13

- fix readme and package-lock ([7a02ca76c5d7842cfa8b256dcc89dcef1ffbcdc1](https://github.com/auth0/express-jwt/commit/7a02ca76c5d7842cfa8b256dcc89dcef1ffbcdc1))
- build(deps): required runtime types ([f3f5af5c214241b4f92b91c49db8586ec20e4526](https://github.com/auth0/express-jwt/commit/f3f5af5c214241b4f92b91c49db8586ec20e4526))
- docs: fix tiny typo ([07e771857489b6344a8dc457069d040a76e84230](https://github.com/auth0/express-jwt/commit/07e771857489b6344a8dc457069d040a76e84230))

## 7.7.0 - 2022-05-06

- deprecate ExpressJwtRequest in favor of Request with optional auth, closes #284 ([de169def56f98f4237741aa6755d0c5e248bd561](https://github.com/auth0/express-jwt/commit/de169def56f98f4237741aa6755d0c5e248bd561)), closes [#284](https://github.com/auth0/express-jwt/issues/284)

## 7.6.2 - 2022-05-02

- remove undefined from algorhitms fix #285 ([587238bd0ad7a59f784daf9f626b9bf9abc7e029](https://github.com/auth0/express-jwt/commit/587238bd0ad7a59f784daf9f626b9bf9abc7e029)), closes [#285](https://github.com/auth0/express-jwt/issues/285)

## 7.6.1 - 2022-05-02

- add note about @types/jsonwebtoken in readme ([03c8419d6fc78c9029a7b474d3aede7f94e80121](https://github.com/auth0/express-jwt/commit/03c8419d6fc78c9029a7b474d3aede7f94e80121))
- make algorithms a required parameter in types. closes #285 ([097a1df0d7ba511afce9578e4cf45bca2589b253](https://github.com/auth0/express-jwt/commit/097a1df0d7ba511afce9578e4cf45bca2589b253)), closes [#285](https://github.com/auth0/express-jwt/issues/285)
- update changelog ([9d0f02debb7a3db83edbc9f9b4b6d46993e6a4f4](https://github.com/auth0/express-jwt/commit/9d0f02debb7a3db83edbc9f9b4b6d46993e6a4f4))

## 7.6.0 - 2022-05-02

- add ExpressJwtRequestUnrequired to the readme ([3890f53f87b0a84dccaafd8de5a43d3c1dfeae89](https://github.com/auth0/express-jwt/commit/3890f53f87b0a84dccaafd8de5a43d3c1dfeae89))
- add SecretCallback[Long] back for backward compatibility ([c24078e285908cad1c2ac0e63482a75ebf7d7328](https://github.com/auth0/express-jwt/commit/c24078e285908cad1c2ac0e63482a75ebf7d7328))
- update changelog ([d3a8e80dec3a6c261f840ad763487a16a47bbc4b](https://github.com/auth0/express-jwt/commit/d3a8e80dec3a6c261f840ad763487a16a47bbc4b))

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
