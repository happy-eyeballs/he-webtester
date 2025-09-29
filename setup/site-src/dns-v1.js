
import * as main from './main.js';

document.getElementById("startTestBtn").addEventListener("click", main.measureHappyEyeballsDNS);
document.getElementById("transmitResultsBtn").addEventListener("click", main.transmitResults);
// document.getElementById("downloadResultsBtn").addEventListener("click", main.downloadResults);
document.getElementById("downloadConfigBtn").addEventListener("click", main.downloadConfiguration);

document.addEventListener('DOMContentLoaded', main.setup);

function getTestConfig(configuredDelays, basedomain) {
    const repetitions = Number(document.getElementById('repetitions').value);

    const configurationMapping = [];
    let runUId = main.getRandomRunId();
    for (var i = 0; i < repetitions; i++) {
        const repetitionConf = [];
        for (const delay of configuredDelays) {
            const url = `https://id-${runUId}.dns-delay-${delay}.v1-rdns.${basedomain}:443/ping`;
            repetitionConf.push({'delay': delay, 'url': url});
        }
        configurationMapping.push({'repetition': i, 'delayConfiguration': repetitionConf});
    }
    return configurationMapping
}

let dnsv1UserFormIds = ["startTestBtn", "repetitions", "runRandomization", "resolverInfo", "autoTransmit"];
main.setUserFormIds(dnsv1UserFormIds);
main.setResultsPath("dnsresults");
main.setTestName("dns-v1");
main.setConfigFunc(getTestConfig);
