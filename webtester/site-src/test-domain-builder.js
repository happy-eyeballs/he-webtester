import * as main from './main.js';

function getNearestValue(selectedValue, acceptedValues) {
    if (!Array.isArray(acceptedValues) || acceptedValues.length === 0) {
        throw new Error("acceptedValues must be a non-empty array");
    }

    return acceptedValues.reduce((nearest, current) => {
        return Math.abs(current - selectedValue) < Math.abs(nearest - selectedValue)
        ? current
        : nearest;
    });
}

const delayRange = document.getElementById('delayRange');
const delayNumber = document.getElementById('delayNumber');
const resultBox = document.getElementById('resultBox');
const resultText = document.getElementById('resultText');
const resultInfo = document.getElementById('resultInfo');
const measurementTypeSelect = document.getElementById('measurementType');
const recordTypeContainer = document.getElementById('recordTypeContainer');
const recordType = document.getElementById('recordType');
const resultError = document.getElementById('resultError');


document.addEventListener('DOMContentLoaded', main.setup);

delayRange.addEventListener('input', () => {
    delayNumber.value = delayRange.value;
});

delayNumber.addEventListener('input', () => {
    let value = parseInt(delayNumber.value, 10);

    if (isNaN(value)) value = 0;
    if (value < delayRange.min) value = delayRange.min;
    if (value > delayRange.max) value = delayRange.max;

    delayRange.value = value;
    delayNumber.value = value;
});

// Show/hide RD options based on selection
measurementTypeSelect.addEventListener('change', () => {
    if (measurementTypeSelect.value === "rd") {
        recordTypeContainer.classList.remove("hidden");
    } else {
        recordTypeContainer.classList.add("hidden");
    }
  });

document.getElementById('measurementForm').addEventListener("submit", (event) => {
    event.preventDefault();

    const measurementType = measurementTypeSelect.value;
    const delay = delayNumber.value;
    const configuredDelays = main.getConfiguredDelays();
    const basedomain = main.getBasedomain();

    let url = ''
    const runUId = main.getRandomRunId();

    resultError.classList.add("hidden");
    if (measurementType == 'cad') {
        if (configuredDelays.includes(delay)) {
            url = `https://id-${runUId}.delay-${delay}.v1.${basedomain}:443/ping`;
        } else {
            const nearestValue = getNearestValue(delay, configuredDelays)
            resultError.innerText = `Using ${nearestValue} ms as delay. Currently, we have no IP address configured with delay ${delay}. Available delays are ${configuredDelays}`;
            resultError.classList.remove("hidden");
            url = `https://id-${runUId}.delay-${nearestValue}.v1.${basedomain}:443/ping`;
        }
    } else if (measurementType == 'rd') {
        const delayType = recordType.value
        url = `https://v2delay_${delayType}-${runUId}_${delay}.v2.${basedomain}:443/ping`;
    } else {
        return;
    }

    resultText.innerText = url;
    resultText.href = url;
    resultBox.style.display = 'block';
});

resultBox.addEventListener('click', () => {
    const textToCopy = resultText.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        const prevText = resultInfo.innerText;
        resultInfo.innerText = "Copied!";
        setTimeout(() => {
            resultInfo.innerText = prevText;
        }, 1500);
    });
});