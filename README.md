# litvmswap-v3

LitVMSwap's Uniswap V3: `v3-core-main` (factory and pools) and `v3-periphery-main` (SwapRouter, position manager,
migrator), deployed on LitVM.

## Provenance

The Solidity contracts are Uniswap V3 core 1.0.0 ([Uniswap/v3-core](https://github.com/Uniswap/v3-core)) and Uniswap
V3 periphery ([Uniswap/v3-periphery](https://github.com/Uniswap/v3-periphery)) without changes; only deployment
values differ (factory, wrapped token wzkLTC, position descriptor). Pool addresses come from Uniswap's own pool init
code hash, `0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54`, which is the hash of the pool built
here. Licenses: core BUSL-1.1, which turned into GPL-2.0-or-later on its change date (2023-04-01); periphery
GPL-2.0-or-later.

`v3-core-main/bug-bounty.md` and `v3-core-main/audits/` are Uniswap Labs' documents for Uniswap's own deployments; they
do not cover LitVMSwap. Report LitVMSwap issues as described in [SECURITY.md](SECURITY.md).

## Build and verify

```shell
(cd v3-core-main && yarn install --frozen-lockfile && npx --no-install hardhat compile)
(cd v3-periphery-main && yarn install --frozen-lockfile && npx --no-install hardhat compile)
node scripts/verify-deployed.js
```

`scripts/verify-deployed.js` is read-only (one `eth_getCode` per contract over a public RPC, no keys). It masks only
the values the compiler marks as immutable and checks every other byte of the factory, a live pool, the SwapRouter,
the position manager and the migrator, plus the pool init code hash. Compiler: solc 0.7.6 with Uniswap's settings
(core 800 runs; periphery 1,000,000 runs, position manager 2,000, descriptor 1,000), no metadata hash.

## Deployments

See [DEPLOYMENTS.md](DEPLOYMENTS.md).

## Dependencies

Yarn with frozen lockfiles, exact direct versions, the official registry and no install scripts (`.yarnrc`,
`.npmrc`). Every locked package was checked against npmjs on 2026-10-24: identical integrity hashes; one git
dependency (`ethereumjs-abi`) is pinned to a full commit.
CI enforces this on every push: `.github/policy.py` fails on an action, submodule or dependency that is not
pinned, another registry, a lockfile entry without an integrity hash, install scripts or a workflow that can write.

Advisories that remain are in Uniswap's original 2021 build and test stack, not in the contracts:

| Package | Critical / high (unique) | Where from | Why it stays | Review by |
|---|---|---|---|---|
| `v3-core-main` | 12 / 72 | mostly `ethereum-waffle` 3, Hardhat 2.2, `solhint`, `mocha` 6 | needed only to build and run Uniswap's original tests on frozen contracts; installed without scripts, no keys or secrets present; the deployed code is checked independently | 2027-03-31 (replace the legacy test stack) |
| `v3-periphery-main` | 15 / 103 | the same, plus `solidity-coverage` and the gas reporter | as above | 2027-03-31 |

## Security

See [SECURITY.md](SECURITY.md).
