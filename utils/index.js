const axios = require("axios");

const fetchBinancePoolData = (URL) => {
  return axios
    .get(URL)
    .then((response) => {
      return {
        success: true,
        data: response.data.data,
      };
    })
    .catch(() => {
      return { success: false };
    });
};

const getAllBinancePoolData = (URLs) => {
  return Promise.all(URLs.map(fetchBinancePoolData));
};

const fetchXmrPoolData = (URL) => {
  return axios
    .get(URL)
    .then((response) => {
      return {
        success: true,
        data: response.data,
      };
    })
    .catch(() => {
      return { success: false };
    });
};

const getAllXmrPoolData = (URLs) => {
  return Promise.all(URLs.map(fetchXmrPoolData));
};

const formatHash = (a, b = 2, k = 1000) => {
  with (Math) {
    let d = floor(log(a) / log(k));
    return 0 == a
      ? "0 Hash"
      : parseFloat((a / pow(k, d)).toFixed(max(0, b))) +
          " " +
          ["H", "KH", "MH", "GH", "TH", "PH", "EH", "ZH", "YH"][d] +
          "/s";
  }
};

const formatXmrValue = (xmrValue) => parseFloat(xmrValue) / 1000000000000;

module.exports = {
  getAllBinancePoolData,
  getAllXmrPoolData,
  formatHash,
  formatXmrValue,
};
