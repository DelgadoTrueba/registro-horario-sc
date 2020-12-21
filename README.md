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
