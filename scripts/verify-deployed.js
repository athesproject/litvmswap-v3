#!/usr/bin/env node
/**
 * Compares this repository's build with the LitVMSwap V3 contracts deployed on LitVM (chain 4441).
 *
 * Read-only: one eth_getCode per contract over a public RPC, no keys. Values fixed at deployment (immutables) and
 * linked library addresses are masked at exactly the positions the compiler reports; every other byte must match.
 * Also checks that the pool init code hash every pool address is derived from is the hash of the pool built here.
 *
 *   (cd v3-core-main && yarn install --frozen-lockfile && npx hardhat compile)
 *   (cd v3-periphery-main && yarn install --frozen-lockfile && npx hardhat compile)
 *   node scripts/verify-deployed.js            # LITVM_RPC_URL overrides the RPC
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const RPC = process.env.LITVM_RPC_URL || 'https://liteforge.rpc.caldera.xyz/infra-partner-http'
const { utils } = require(path.join(ROOT, 'v3-core-main/node_modules/ethers'))

const CONTRACTS = [
  ['UniswapV3Factory', 'v3-core-main/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json', '0xDE6763A041f8Fc94CA2EE5933736F78f6D1A11c5'],
  ['UniswapV3Pool (wzkLTC/ZKUSDC 0.3%)', 'v3-core-main/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json', '0x24ABC8e68f659D4Ca97192A5d4125DD834504C8E'],
  ['SwapRouter', 'v3-periphery-main/artifacts/contracts/SwapRouter.sol/SwapRouter.json', '0x60F8A7642F0aeC06cE628224E743326B23Fe5208'],
  ['NonfungiblePositionManager', 'v3-periphery-main/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json', '0x1089f046B597f259BeFDC15Bf9C90E33616BA366'],
  ['V3Migrator', 'v3-periphery-main/artifacts/contracts/V3Migrator.sol/V3Migrator.json', '0x89dd9B1757C94b1F570090cc6C74B1dE2910429c'],
]

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'))

/** The compiler output for an artifact, from its Hardhat build info. */
function compiled(artifactPath) {
  const art = read(artifactPath)
  const dbg = read(artifactPath.replace(/\.json$/, '.dbg.json'))
  const info = read(path.join(path.dirname(artifactPath), dbg.buildInfo))
  return { art, evm: info.output.contracts[art.sourceName][art.contractName].evm }
}

function mask(hex, ranges) {
  const b = Buffer.from(hex.replace(/^0x/, ''), 'hex')
  for (const r of ranges) b.fill(0, r.start, r.start + r.length)
  return b.toString('hex')
}

function maskedRanges(deployed) {
  const ranges = []
  for (const refs of Object.values(deployed.immutableReferences || {})) ranges.push(...refs)
  for (const libs of Object.values(deployed.linkReferences || {})) for (const refs of Object.values(libs)) ranges.push(...refs)
  return ranges
}

async function getCode(address) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'user-agent': 'litvmswap-verify-deployed' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getCode', params: [address, 'latest'] }),
  })
  return (await res.json()).result
}

async function main() {
  let ok = true
  const pool = compiled('v3-core-main/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json').art
  const lib = fs.readFileSync(path.join(ROOT, 'v3-periphery-main/contracts/libraries/PoolAddress.sol'), 'utf8')
  const expected = lib.match(/POOL_INIT_CODE_HASH = (0x[0-9a-fA-F]{64})/)[1].toLowerCase()
  const actual = utils.keccak256(pool.bytecode)
  console.log(`${actual === expected ? 'ok  ' : 'FAIL'} pool init code hash ${actual} (PoolAddress.sol: ${expected})`)
  ok = ok && actual === expected

  for (const [name, artifact, address] of CONTRACTS) {
    const { evm } = compiled(artifact)
    const ranges = maskedRanges(evm.deployedBytecode)
    const live = await getCode(address)
    const same = mask(live, ranges) === mask(evm.deployedBytecode.object.replace(/__\$[0-9a-f]{34}\$__/g, '0'.repeat(40)), ranges)
    console.log(`${same ? 'ok  ' : 'FAIL'} ${name} at ${address}: ${(live.length - 2) / 2} bytes, ${ranges.length} masked positions`)
    ok = ok && same
  }
  console.log(ok ? 'All deployed V3 contracts are this build.' : 'MISMATCH: see above.')
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
