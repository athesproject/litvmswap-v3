# Security policy

Please report vulnerabilities privately through GitHub: **Security** tab, **Report a vulnerability**. Do not open a
public issue or pull request for a security problem. (`v3-core-main/bug-bounty.md` is Uniswap Labs' program for
Uniswap's own deployments and does not cover LitVMSwap.)

Include the contract and network, what an attacker can do, and the steps or a test that shows it. We confirm receipt
within 72 hours and keep you informed until the issue is fixed.

In scope: the LitVMSwap deployments listed in [DEPLOYMENTS.md](DEPLOYMENTS.md). The V3 factory is owned by the fee
vault `0xF2DF37067a8Af0e9ae617c96C887B2FdA8eA3f10`, which is administered through the 48-hour timelock
`0x35774e0172571314fcDa7d602ea4D3410EE37188` by the LitVM 2-of-3 Safe `0x868b8B48db5DDE602D24960A606A5A8F93333bf9`.
