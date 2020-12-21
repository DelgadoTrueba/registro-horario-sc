/* Besu TestNet Account => https://github.com/hyperledger/besu/blob/master/config/src/main/resources/dev.json
**
** Account 1
** Private Key '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63',
** Address 0xfe3b557e8fb62b89f4916b721be55ceb828dbd73
** Balance 0xad78ebc5ac6200000 (2785365088392105618523029504 in decimal)
**
** Account 2
** Private Key '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
** Address 0x627306090abaB3A6e1400e9345bC60c78a8BEf57
** Balance 0xad78ebc5ac6200000 (2785365088392105618523029504 in decimal)
**
** Account 3
** Private Key '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
** Address 0xf17f52151EbEF6C7334FAD080c5704D77216b732
** Balance 0xad78ebc5ac6200000 (2785365088392105618523029504 in decimal)
*/

const PrivateKeyProvider = require("@truffle/hdwallet-provider");

const HOST = '127.0.0.1';
const PORT = '8545'

const privateKeyBesuProvider = () => new PrivateKeyProvider(
    [
    '0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63',
    '0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    '0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f'
    ],
    `http://${HOST}:${PORT}`,
    0,
    3
)

module.exports = {
    provider: privateKeyBesuProvider,
    host: HOST,
    port: PORT
}