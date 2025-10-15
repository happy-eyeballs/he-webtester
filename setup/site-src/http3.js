import * as main from './main.js';

document.getElementById("startTestBtn").addEventListener("click", main.measureHappyEyeballsV3);
document.getElementById("transmitResultsBtn").addEventListener("click", main.transmitResults);
document.getElementById("downloadResultsBtn").addEventListener("click", main.downloadResults);
document.getElementById("autofillUserInfo").addEventListener("click", main.autofillUserInfo);

document.addEventListener('DOMContentLoaded', async () => {
    await main.setup();
    await main.setupHappyEyeballsV3();
});

const hev3UserFormIds = ["startTestBtn", "transmitResultsBtn", "repetitions", "userInfo", "autoTransmit", "downloadResultsBtn", "autofillUserInfo"];
main.setUserFormIds(hev3UserFormIds);
main.setResultsPath("/results/v3_quic");
main.setTestName("http3");
main.setConfigFunc(null);
