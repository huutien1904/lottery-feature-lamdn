const prizes = [
  {
    type: 0,
    count: 0,
    title: "Giải đặc biệt",
    text: "Giải đặc biệt",
  },
  {
    type: 3,
    count: 4,
    text: "Giải nhì",
    title: "Giải nhì",
    img: "../img/2.png",
  },
  {
    type: 4,
    count: 6,
    text: "Giải ba",
    title: "Giải ba",
    img: "../img/3.png",
  },
  // {
  //   type: 5,
  //   count: 10,
  //   text: "Giải tư",
  //   title: "Giải tư",
  //   img: "../img/4.png"
  // },
  // {
  //   type: 6,
  //   count: 40,
  //   text: "Giải năm",
  //   title: "Giải năm",
  //   img: "../img/4.png"
  // },
  // {
  //   type: 7,
  //   count: 60,
  //   text: "Giải khuyến khích",
  //   title: "Giải khuyến khích",
  //   img: "../img/5.png"
  // },
];

/**
 * 一Số giải mỗi lần quay
 */
// Mỗi lần quay sẽ bốc tối đa EACH_COUNT theo index của currentPrizeIndex.
// Với danh sách hiện tại [default, giải nhì, giải ba], index tương ứng là [0,1,2].
const EACH_COUNT = [1, 4, 6];

const COMPANY = "VNSKY";

module.exports = {
  prizes,
  EACH_COUNT,
  COMPANY,
};
