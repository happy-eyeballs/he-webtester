
import * as main from './main.js';

document.getElementById("startTestBtn").addEventListener("click", main.measureHappyEyeballsV2);
document.getElementById("transmitResultsBtn").addEventListener("click", main.transmitResults);
document.getElementById("downloadResultsBtn").addEventListener("click", main.downloadResults);
document.getElementById("downloadConfigBtn").addEventListener("click", main.downloadConfiguration);

function getTestConfig(configuredDelays, basedomain) {
    const repetitions = Number(document.getElementById('repetitions').value);
    const randomizeDomains = document.getElementById('domainRandomization').checked;

    const configurationMapping = [];
    const runUIdMapping = {};
    if (!randomizeDomains) {
        for (const delay of configuredDelays) {
            runUIdMapping[delay] = main.getRandomRunId();
        }
    }

    for (var i = 0; i < repetitions; i++) {
        const repetitionConf = {};
        for (const delayType of ['a', 'aaaa']) {
            const rtype_conf = [];
            for (const delay of configuredDelays) {
                if (randomizeDomains) {
                    var runUId = main.getRandomRunId();
                } else {
                    var runUId = runUIdMapping[delay];
                }
                const url = `https://v2delay_${delayType}-${runUId}_${delay}.v2.${basedomain}:443/ping`;
                rtype_conf.push({'delay': delay, 'rtype': delayType, 'url': url});
            }
            repetitionConf[delayType] = rtype_conf;
        }
        configurationMapping.push({'repetition': i, 'delayConfiguration': repetitionConf});
    }
    return configurationMapping
}

let ipv2UserFormIds = ["startTestBtn", "transmitResultsBtn", "repetitions", "domainRandomization", "userInfo", "resolverInfo", "autoTransmit", "downloadResultsBtn"];
main.setUserFormIds(ipv2UserFormIds);
main.setResultsPath("v2results");
main.setTestName("ip-v2");
main.setConfigFunc(getTestConfig);

document.addEventListener('DOMContentLoaded', main.setup);
