# Deployments

## LitVM LiteForge (chain 4441, testnet)

| Contract | Address |
|---|---|
| UniswapV3Factory | `0xDE6763A041f8Fc94CA2EE5933736F78f6D1A11c5` |
| UniswapV3Pool (every pool; e.g. wzkLTC/ZKUSDC 0.3%) | `0x24ABC8e68f659D4Ca97192A5d4125DD834504C8E` |
| SwapRouter | `0x60F8A7642F0aeC06cE628224E743326B23Fe5208` |
| NonfungiblePositionManager | `0x1089f046B597f259BeFDC15Bf9C90E33616BA366` |
| NonfungibleTokenPositionDescriptor | `0xEC66f561432c3205838127fFa108877e421dC16a` |
| V3Migrator | `0x89dd9B1757C94b1F570090cc6C74B1dE2910429c` |

Pool init code hash: `0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54` (Uniswap's).
Factory owner: the fee vault `0xF2DF37067a8Af0e9ae617c96C887B2FdA8eA3f10` (protocol fee 1/4 of LP fees on every pool).
The factory, SwapRouter and position manager are also verified on the LitVM explorer.
`node scripts/verify-deployed.js` checks the factory, a pool, the SwapRouter, the position manager and the migrator
against this build.
