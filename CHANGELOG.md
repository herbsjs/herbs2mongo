## [3.0.1](https://github.com/herbsjs/herbs2mongo/compare/v3.0.0...v3.0.1) (2022-06-25)


### Bug Fixes

* fix method find when return is zero ([d8b2cf2](https://github.com/herbsjs/herbs2mongo/commit/d8b2cf2b340b34fd3d2bba12015fd7f5f43cacd6))

# [3.0.0](https://github.com/herbsjs/herbs2mongo/compare/v2.2.1...v3.0.0) (2022-06-22)


### Features

* change findById return ([9339459](https://github.com/herbsjs/herbs2mongo/commit/933945929b75913dbc9d3da4d659d49ce62dd0a6))


### BREAKING CHANGES

* now findById returns an array instead only element

## [2.2.1](https://github.com/herbsjs/herbs2mongo/compare/v2.2.0...v2.2.1) (2022-06-19)


### Bug Fixes

* update method now uses findOneAndUpdate instead updateOne ([fca1c9b](https://github.com/herbsjs/herbs2mongo/commit/fca1c9b465ec8d035f05c5aabe370915825afbec))

# [2.2.0](https://github.com/herbsjs/herbs2mongo/compare/v2.1.0...v2.2.0) (2022-06-18)


### Features

* add delete method ([d873a9a](https://github.com/herbsjs/herbs2mongo/commit/d873a9af18d01e483fc1545058261380b969e766))


### Reverts

* revert peerDependencie of mongodb ([f375b99](https://github.com/herbsjs/herbs2mongo/commit/f375b99ef96570b7e0afb4538f2cc0a7a74dc960))

# [2.1.0](https://github.com/herbsjs/herbs2mongo/compare/v2.0.1...v2.1.0) (2022-06-17)


### Features

* add native parameter to filters and improve the connection method ([5adcde2](https://github.com/herbsjs/herbs2mongo/commit/5adcde2a3f6273077d7420a20d1fe369b1844ab6))

## [2.0.1](https://github.com/herbsjs/herbs2mongo/compare/v2.0.0...v2.0.1) (2022-06-13)


### Bug Fixes

* **deps:** bump @herbsjs/herbs from 1.4.5 to 1.5.0 ([93e86c9](https://github.com/herbsjs/herbs2mongo/commit/93e86c94d78837dd82182f1e12bd80ec829fbe8c))

# [2.0.0](https://github.com/herbsjs/herbs2mongo/compare/v1.0.3...v2.0.0) (2022-05-15)


### Bug Fixes

* 🐛 update dependencies (herbs and semantic release) ([491b612](https://github.com/herbsjs/herbs2mongo/commit/491b612e7cff705d7579b542970958a0f63b8564))


### Features

* 🎸 new mongodb version driver ([d7053b0](https://github.com/herbsjs/herbs2mongo/commit/d7053b0b904649d8af38bb686be1e16576ffcdd6))


### BREAKING CHANGES

* 🧨 insertMany has a breaking change because of update of driver.

## [1.0.3](https://github.com/herbsjs/herbs2mongo/compare/v1.0.2...v1.0.3) (2022-05-15)


### Bug Fixes

* returning null when do not found a document ([5ddb8c9](https://github.com/herbsjs/herbs2mongo/commit/5ddb8c950c6fa6bb59527e9cfa10b96f0531d764)), closes [#12](https://github.com/herbsjs/herbs2mongo/issues/12)
* update function dont returns the upsertedCount prop ([4981bc8](https://github.com/herbsjs/herbs2mongo/commit/4981bc80979e76057f4dffa7e6fa0f5eeda5e08c))
* using ObjectID in queryies ([f979b69](https://github.com/herbsjs/herbs2mongo/commit/f979b698f58da5b63df4465fda6b80bb35b78384)), closes [#14](https://github.com/herbsjs/herbs2mongo/issues/14)

## [1.0.2](https://github.com/herbsjs/herbs2mongo/compare/v1.0.1...v1.0.2) (2022-01-15)


### Bug Fixes

* update herbs dependencie ([2279e07](https://github.com/herbsjs/herbs2mongo/commit/2279e07cd63a471a0f47a38c9aaabf5487c09709))

## [1.0.1](https://github.com/herbsjs/herbs2mongo/compare/v1.0.0...v1.0.1) (2021-08-31)


### Bug Fixes

* **repository.js:** change scope of var ([dc35b3c](https://github.com/herbsjs/herbs2mongo/commit/dc35b3c44e9bc842009bd6451685531fc80be440))

# 1.0.0 (2021-08-04)


### Features

* add insert many and update many ([c1952ef](https://github.com/herbsjs/herbs2mongo/commit/c1952ef6ecd4c8aa5090c156e4073e2ee8a2963c))
* initial version ([b094461](https://github.com/herbsjs/herbs2mongo/commit/b094461e584afb70de9dfecbd8ecf5126caa61a1))
