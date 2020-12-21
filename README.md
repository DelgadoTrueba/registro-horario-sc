# registro-horario-sc

## Dependencias

- **Globales**
- node: 12
- npm: 6
- **Locales**
- truffle: 5
- ganche: 6

**Comandos Útiles**

```JSON
{
    "style-fix": "prettier --write ./contracts/**/*.sol",
}
```

## Test

### Entorno Ganache

```bash
npx ganache-cli --host 0.0.0.0 -p 9545
```

```bash
rm -rf build/contracts/
npx truffle test --network ganache
```

### Entorno Hyperledger Besu

```bash
docker pull hyperledger/besu:20.10.3
docker run --name besu --rm -it -p 8545:8545 hyperledger/besu:20.10.3 --network=dev --miner-enabled --miner-coinbase=0xfe3b557e8fb62b89f4916b721be55ceb828dbd73 --rpc-http-cors-origins='all' --host-allowlist='*' --rpc-ws-enabled --rpc-http-enabled --rpc-http-api='ETH, NET, WEB3, DEBUG' --data-path=/tmp/tmpDatdir
```

```bash
rm -rf build/contracts/
truffle test --network besu
```
