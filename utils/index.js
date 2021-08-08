const axios = require("axios");

const fetchData = (URL) => {
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

const getAllData = (URLs) => {
  return Promise.all(URLs.map(fetchData));
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

module.exports = { getAllData, formatHash };
