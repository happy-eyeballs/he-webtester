
import * as main from './main.js';

document.getElementById("startTestBtn").addEventListener("click", main.measureHappyEyeballs);
document.getElementById("transmitResultsBtn").addEventListener("click", main.transmitResults);
document.getElementById("downloadResultsBtn").addEventListener("click", main.downloadResults);
document.getElementById("downloadConfigBtn").addEventListener("click", main.downloadConfiguration);

document.addEventListener('DOMContentLoaded', main.setup);

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
        const repetitionConf = [];
        for (const delay of configuredDelays) {
            if (randomizeDomains) {
                var runUId = main.getRandomRunId();
            } else {
                var runUId = runUIdMapping[delay];
            }
            const url = `https://id-${runUId}.delay-${delay}.v1.${basedomain}:443/ping`;
            repetitionConf.push({'delay': delay, 'url': url});
        }
        configurationMapping.push({'repetition': i, 'delayConfiguration': repetitionConf});
    }
    return configurationMapping
}

let ipv1UserFormIds = ["startTestBtn", "transmitResultsBtn", "repetitions", "domainRandomization", "userInfo", "autoTransmit", "downloadResultsBtn"];
main.setUserFormIds(ipv1UserFormIds);
main.setResultsPath("results");
main.setTestName("ip-v1");
main.setConfigFunc(getTestConfig);
