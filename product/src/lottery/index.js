import "./index.css";
import "../css/animate.min.css";
import "./canvas.js";
import {
  addQipao,
  setPrizes,
  showPrizeList,
  setPrizeData,
  resetPrize,
} from "./prizeList";
import { NUMBER_MATRIX } from "./config.js";
//Thoi gian xoay bong
const ROTATE_TIME = 4000;
const BASE_HEIGHT = 1080;

let TOTAL_CARDS,
  btns = {
    enter: document.querySelector("#enter"),
    lotteryBar: document.querySelector("#lotteryBar"),
  },
  prizes,
  EACH_COUNT,
  ROW_COUNT = 7,
  COLUMN_COUNT = 31,
  COMPANY,
  HIGHLIGHT_CELL = [],
  Resolution = 1;

let camera,
  scene,
  renderer,
  controls,
  threeDCards = [],
  targets = {
    table: [],
    sphere: [],
  };

let selectedCardIndex = [],
  rotate = false,
  basicData = {
    prizes: [], //Thông tin giải thưởng
    users: [], //Tất cả nhân viên
    luckyUsers: {}, //Những người may mắn trúng
    leftUsers: [], //Những người không thắng
  },
  interval,
  // Các giải thưởng hiện tại được rút thăm từ giải thưởng thấp nhất cho đến khi giải thưởng lớn được rút ra
  currentPrizeIndex,
  currentPrize,
  // Rút thăm
  isLotting = false,
  currentLuckys = [],
  selectedCard = [];
initAll();

/**
 * Khởi tạo DOM
 */
function initAll() {
  window.AJAX({
    url: "/getTempData",
    success(data) {
      console.log({data});
      
      // Nhận dữ liệu cơ bản
      prizes = data.cfgData.prizes;
      console.log({prizes});
      
      EACH_COUNT = data.cfgData.EACH_COUNT;
      COMPANY = data.cfgData.COMPANY;
      HIGHLIGHT_CELL = createHighlight();
      basicData.prizes = prizes;
      setPrizes(prizes);500

      TOTAL_CARDS = ROW_COUNT * COLUMN_COUNT;

      // Đọc kết quả xổ số hiện được thiết lập
      basicData.leftUsers = data.leftUsers;
      basicData.luckyUsers = data.luckyData;

      let prizeIndex = basicData.prizes.length - 1;
      for (; prizeIndex > -1; prizeIndex--) {
        if (
          data.luckyData[prizeIndex] &&
          data.luckyData[prizeIndex].length >=
            basicData.prizes[prizeIndex].count
        ) {
          continue;
        }
        currentPrizeIndex = prizeIndex;
        currentPrize = basicData.prizes[currentPrizeIndex];
        break;
      }

      showPrizeList(currentPrizeIndex);
      let curLucks = basicData.luckyUsers[currentPrize.type];
      setPrizeData(currentPrizeIndex, curLucks ? curLucks.length : 0, true);
    },
  });

  window.AJAX({
    url: "/getUsers",
    success(data) {
      basicData.users = data;
      initCards();
      // startMaoPao();
      animate();
      shineCard();
    },
  });
}

function initCards() {
  let member = basicData.users,
    showCards = [],
    length = member.length;

  let isBold = false,
    showTable = basicData.leftUsers.length === basicData.users.length,
    index = 0,
    totalMember = member.length,
    position = {
      x: (180 * COLUMN_COUNT - 20) / 2,
      y: (220 * ROW_COUNT - 20) / 2,
    };

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3000;

  scene = new THREE.Scene();

  for (let i = 0; i < ROW_COUNT; i++) {
    for (let j = 0; j < COLUMN_COUNT; j++) {
      isBold = HIGHLIGHT_CELL.includes(j + "-" + i);
      var element = createCard(
        member[index % length],
        isBold,
        index,
        showTable
      );
      var object = new THREE.CSS3DObject(element);
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add(object);
      threeDCards.push(object);
      //

      var object = new THREE.Object3D();
      object.position.x = j * 160 - position.x;
      object.position.y = -(i * 180) + position.y;
      targets.table.push(object);
      index++;
    }
  }

  // sphere

  var vector = new THREE.Vector3();

  for (var i = 0, l = threeDCards.length; i < l; i++) {
    var phi = Math.acos(-1 + (2 * i) / l);
    var theta = Math.sqrt(l * Math.PI) * phi;
    var object = new THREE.Object3D();
    object.position.setFromSphericalCoords(800 * Resolution, phi, theta);
    vector.copy(object.position).multiplyScalar(2);
    object.lookAt(vector);
    targets.sphere.push(object);
  }

  renderer = new THREE.CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("container").appendChild(renderer.domElement);

  //

  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 0.5;
  controls.minDistance = 500;
  controls.maxDistance = 6000;
  controls.addEventListener("change", render);

  bindEvent();

  if (showTable) {
    switchScreen("enter");
  } else {
    switchScreen("lottery");
  }
}

function setLotteryStatus(status = false) {
  isLotting = status;
}

/**
 * 事件绑定
 */
function bindEvent() {
  document.querySelector("#menu").addEventListener("click", function (e) {
    e.stopPropagation();
    // Nếu xổ số đang quay, tất cả các hoạt động đều bị cấm
    if (isLotting) {
      addQipao("Đang quay, đợi 1 xíu");
      return false;
    }

    let target = e.target.id;
    switch (target) {
      // Hiển thị tường kỹ thuật số
      case "welcome":
        switchScreen("enter");
        rotate = false;
        break;
      // Bắt đầu quay
      case "enter":
        document.querySelector("#prizeBar").style.display = "block";
        document.querySelector("#headTitle").style.display = "none";
        removeHighlight();
        document
          .querySelectorAll(".none")
          .forEach((node) => node.classList.remove("none"));
        // addQipao(`Bắt đầu với hạng mục ${currentPrize.text},Đừng rời đi.`);
        // rotate = !rotate;
        rotate = true;
        switchScreen("lottery");
        break;
      // Đặt lại
      case "reset":
        let doREset = window.confirm(
          "Xác nhận đặt lại dữ liệu. Sau khi đặt lại, tất cả các giải thưởng đã quay sẽ bị xóa."
        );
        if (!doREset) {
          return;
        }
        document.querySelector("#prizeBar").style.display = "none";
        document.querySelector("#headTitle").style.display = "flex";
        addQipao("Khởi động lại");
        addHighlight();
        document
          .querySelectorAll(".normal")
          .forEach((node) => node.classList.add("none"));
        resetCard();
        // Đặt lại tất cả dữ liệu
        currentLuckys = [];
        basicData.leftUsers = Object.assign([], basicData.users);
        basicData.luckyUsers = {};
        currentPrizeIndex = basicData.prizes.length - 1;
        currentPrize = basicData.prizes[currentPrizeIndex];

        resetPrize(currentPrizeIndex);
        reset();
        switchScreen("enter");
        break;
      // Quay
      case "lottery":
        setLotteryStatus(true);
        // Lưu dữ liệu xổ số cuối cùng trước mỗi lần quay thưởng
        saveData();
        // Sửa đổi số lượng và phần trăm giải thưởng bên trái
        changePrize();
        resetCard().then((res) => {
          // quay
          lottery();
        });
        // addQipao(`Giải thưởng ${currentPrize.text}`);
        break;
      case "reLottery":
        if (currentLuckys.length === 0) {
          // addQipao(`Chưa có bốc thăm trúng thưởng nên không bốc thăm lại ~~`);
          return;
        }
        setErrorData(currentLuckys);
        // addQipao(`Quay lại hạng mục[${currentPrize.title}],chuẩn bị nào!!!!!!`);
        setLotteryStatus(true);
        resetCard().then((res) => {
          lottery();
        });
        break;
      case "save":
        saveData().then((res) => {
          resetCard().then((res) => {
            currentLuckys = [];
          });
          exportData();
          // addQipao(`Dữ liệu đã được lưu trong EXCEL.`);
        });
        break;
      case "showUser":
        alert(basicData.leftUsers.length);
        break;
    }
  });

  window.addEventListener("resize", onWindowResize, false);
}

function switchScreen(type) {
  switch (type) {
    case "enter":
      btns.enter.classList.remove("none");
      btns.lotteryBar.classList.add("none");
      transform(targets.table, 2000);
      break;
    default:
      btns.enter.classList.add("none");
      btns.lotteryBar.classList.remove("none");
      transform(targets.sphere, 2000);
      break;
  }
}

/**
 * 创建元素
 */
function createElement(css, text) {
  let dom = document.createElement("div");
  dom.className = css || "";
  dom.innerHTML = text || "";
  return dom;
}

/**
 * 创建名牌
 */
function createCard(user, isBold, id, showTable) {
  var element = createElement();
  element.id = "card-" + id;
  element.addEventListener("click", (e) => {
    e.stopPropagation();
    // Nếu xổ số đang quay, tất cả các hoạt động đều bị cấm
    if (isLotting) {
      addQipao("Đang quay, đợi 1 xíu");
      return false;
    }
    const index = selectedCardIndex.findIndex((item) => item === id);
    let doREset = window.confirm(
      "Bạn có chắc chắn muốn loại người chơi " +
        currentLuckys[index][1] +
        " không?"
    );
    if (!doREset) {
      return;
    }
    backCardToBall(id, 2000);
    currentLuckys.splice(index, 1);
    selectedCardIndex.splice(index, 1);
    let luckys = basicData.luckyUsers[currentPrize.type];
    let luckyCount = (luckys ? luckys.length : 0) + currentLuckys.length;

    // Sửa đổi số lượng và phần trăm giải thưởng bên trái
    setPrizeData(currentPrizeIndex, luckyCount);
  });
  if (isBold) {
    element.className = "element lightitem";
    if (showTable) {
      element.classList.add("highlight");
    }
  } else {
    element.className = "element none normal";
    element.style.backgroundColor =
      "rgba(0,127,127," + (Math.random() * 0.7 + 0.25) + ")";
  }
  element.appendChild(createElement("company", COMPANY));

  element.appendChild(createElement("name", user[1]));

  element.appendChild(createElement("details", user[0] + "<br/>" + user[2]));
  return element;
}

function removeHighlight() {
  document.querySelectorAll(".highlight").forEach((node) => {
    node.classList.remove("highlight");
  });
}

function addHighlight() {
  document.querySelectorAll(".lightitem").forEach((node) => {
    node.classList.add("highlight");
  });
}

/**
 * 渲染地球等
 */
function transform(targets, duration) {
  // TWEEN.removeAll();
  for (var i = 0; i < threeDCards.length; i++) {
    var object = threeDCards[i];
    var target = targets[i];

    new TWEEN.Tween(object.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    // new TWEEN.Tween(object.rotation)
    //     .to({
    //         x: target.rotation.x,
    //         y: target.rotation.y,
    //         z: target.rotation.z
    //     }, Math.random() * duration + duration)
    //     .easing(TWEEN.Easing.Exponential.InOut)
    //     .start();
  }

  new TWEEN.Tween(this)
    .to({}, duration * 2)
    .onUpdate(render)
    .start();
}

function rotateBall() {
  return new Promise((resolve, reject) => {
    scene.rotation.y = 0;
    new TWEEN.Tween(scene.rotation)
      .to(
        {
          y: Math.PI * 80,
        },
        calcDuration(currentPrizeIndex)
      )
      .onUpdate(render)
      .easing(TWEEN.Easing.Exponential.InOut)
      .start()
      .onComplete(() => {
        resolve();
      });
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function animate() {
  // rotate && (scene.rotation.y += 0.088);

  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();

  // render();
}

function render() {
  renderer.render(scene, camera);
}

function selectCard(duration) {
  rotate = false;
  let width = 150,
    tag = -(currentLuckys.length - 1) / 2,
    locates = [];

  // Tính toán thông tin vị trí, hiển thị nhiều hơn 5 trong hai hàng
  if (currentLuckys.length > 5) {
    let yPosition = [-110, 110],
      l = selectedCardIndex.length,
      mid = Math.ceil(l / 2);
    tag = -(mid - 1) / 2;
    for (let i = 0; i < mid; i++) {
      locates.push({
        x: tag * width * Resolution,
        y: yPosition[0] * Resolution,
      });
      tag++;
    }

    tag = -(l - mid - 1) / 2;
    for (let i = mid; i < l; i++) {
      locates.push({
        x: tag * width * Resolution,
        y: yPosition[1] * Resolution,
      });
      tag++;
    }
  } else {
    for (let i = selectedCardIndex.length; i > 0; i--) {
      locates.push({
        x: tag * width * Resolution,
        y: 0 * Resolution,
      });
      tag++;
    }
  }
  //
  // let text = currentLuckys.map(item => item[1]);
  // addQipao(
  //   `Chúc mừng những bạn ${text.join("、")}đã đạt được ${currentPrize.title}, Năm mới an khang thịnh vượng.`
  // );
  let idx = 0;
  showCard(idx, locates, duration, tag);

  // selectedCardIndex.forEach((cardIndex, index) => {
  //     changeCard(cardIndex, currentLuckys[index]);
  //     var object = threeDCards[cardIndex];
  //     new TWEEN.Tween(object.position)
  //         .to(
  //             {
  //                 x: locates[index].x,
  //                 y: locates[index].y * Resolution,
  //                 z: 2200
  //             },
  //             Math.random() * duration + duration
  //         )
  //         .easing(TWEEN.Easing.Exponential.InOut)
  //         .start();
  //
  //     new TWEEN.Tween(object.rotation)
  //         .to(
  //             {
  //                 x: 0,
  //                 y: 0,
  //                 z: 0
  //             },
  //             Math.random() * duration + duration
  //         )
  //         .easing(TWEEN.Easing.Exponential.InOut)
  //         .start();
  //
  //     object.element.classList.add("prize");
  //     tag++;
  // });
  //
  // new TWEEN.Tween(this)
  //     .to({}, duration * 2)
  //     .onUpdate(render)
  //     .start()
  //     .onComplete(() => {
  //         // 动画结束后可以操作
  //         setLotteryStatus();
  //     });
}

function showCard(idx, locates, duration, tag) {
  if (idx === selectedCardIndex.length) {
    setLotteryStatus();
  } else {
    const cardIndex = selectedCardIndex[idx];
    changeCard(cardIndex, currentLuckys[idx]);
    var object = threeDCards[cardIndex];
    new TWEEN.Tween(object.position)
      .to(
        {
          x: locates[idx].x,
          y: locates[idx].y * Resolution,
          z: 2200,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: 0,
          y: 0,
          z: 0,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
    console.log(object);
    object.element.classList.add("prize");
    // object.element.append('<img id="theImg" src="img/highlight_background_remove.jpg" />')
    object.element.innerHTML += `
        <div class="name">${currentLuckys[idx][1]}</div>
            <div class="details">
                ${currentLuckys[idx][2] || "Mobi"}
            </div>
        `;
    // object.element.style.backgroundImage =
    //   'url("img/highlight_background_remove.jpg")';
    // object.element.style.backgroundRepeat = "no-repeat";
    // object.element.style.backgroundAttachment = "fixed";
    // object.element.style.backgroundSize = "contain";
    // object.element.style.zIndex = "3";
    tag++;
    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(render)
      .start()
      .onComplete(() => {
        // 动画结束后可以操作
        showCard(idx + 1, locates, duration, tag);
      });
  }
}

function backCardToBall(index, duration) {
  let object = threeDCards[index],
    target = targets.sphere[index];

  new TWEEN.Tween(object.position)
    .to(
      {
        x: target.position.x,
        y: target.position.y,
        z: target.position.z,
      },
      Math.random() * duration + duration
    )
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

  new TWEEN.Tween(object.rotation)
    .to(
      {
        x: target.rotation.x,
        y: target.rotation.y,
        z: target.rotation.z,
      },
      Math.random() * duration + duration
    )
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

  new TWEEN.Tween(this)
    .to({}, duration * 2)
    .onUpdate(render)
    .start()
    .onComplete(() => {
      let object = threeDCards[index];
      object.element.classList.remove("prize");
    });
}

/**
 * 重置抽奖牌内容
 */
function resetCard(duration = 500) {
  if (currentLuckys.length === 0) {
    return Promise.resolve();
  }
  selectedCardIndex.forEach((index) => {
    let object = threeDCards[index],
      target = targets.sphere[index];

    new TWEEN.Tween(object.position)
      .to(
        {
          x: target.position.x,
          y: target.position.y,
          z: target.position.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();

    new TWEEN.Tween(object.rotation)
      .to(
        {
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z,
        },
        Math.random() * duration + duration
      )
      .easing(TWEEN.Easing.Exponential.InOut)
      .start();
  });

  return new Promise((resolve, reject) => {
    resolve();
    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(render)
      .start()
      .onComplete(() => {
        console.log(selectedCard);
        console.log(currentLuckys);
        selectedCardIndex.forEach((index) => {
          let object = threeDCards[index];
          object.element.classList.remove("prize");
          const value = selectedCard.findIndex((item) => item.id === index);
          console.log(value);
          object.element.innerHTML = `
            <div class="dev-img" style="background: url('${selectedCard[value].info[3]}') no-repeat top center;
            background-size: cover;"></div>
            `;
        });
        resolve();
      });
  });
}

function lottery() {
  //kiểm tra loại thưởng giải
  if (currentPrize.type === 0) return;
  rotateBall().then(() => {
    // Bỏ trống bản ghi trước
    currentLuckys = [];
    selectedCardIndex = [];
    console.log({EACH_COUNT});
    console.log({currentPrizeIndex});
    console.log({basicData});
    
    // Số lần quay thưởng đồng thời hiện tại, có thể tiếp tục quay thưởng sau lần quay thưởng hiện tại, nhưng không có dữ liệu nào được ghi lại
    // perCount : mảng số giải thưởng trên mỗi lần quay
    // 
    let perCount = EACH_COUNT[currentPrizeIndex],
      luckyData = basicData.luckyUsers[currentPrize.type],
      leftCount = basicData.leftUsers.length,
      leftPrizeCount = currentPrize.count - (luckyData ? luckyData.length : 0);
    console.log({perCount});
    console.log({luckyData});
    console.log({leftPrizeCount});
    console.log({leftCount});
    
    if (leftCount === 0) {
      // addQipao("Các nhân viên đã được rút, và bây giờ tất cả các nhân viên có thể được đặt lại cho lần rút thứ hai!");
      basicData.leftUsers = basicData.users;
      leftCount = basicData.leftUsers.length;
    }

    for (let i = 0; i < perCount; i++) {
      //random id trong danh sách còn lại
      let luckyId;
      if (currentPrize.type < 8) {
        const excluding = findLessPrize(basicData.leftUsers, currentPrize.type);
        console.log("excluding");
        console.log(excluding);
        luckyId = randomExcluding(leftCount, excluding);
        console.log(luckyId);
      } else {
        luckyId = random(leftCount);
      }
      console.log("basicData.leftUsers");
      console.log(basicData.leftUsers);
      currentLuckys.push(basicData.leftUsers.splice(luckyId, 1)[0]);
      leftCount--;
      leftPrizeCount--;
      let cardIndex = random(TOTAL_CARDS);
      while (selectedCardIndex.includes(cardIndex)) {
        cardIndex = random(TOTAL_CARDS);
      }
      selectedCardIndex.push(cardIndex);
      selectedCard.push({
        id: cardIndex,
        info: currentLuckys[currentLuckys.length - 1],
      });

      if (leftPrizeCount === 0) {
        break;
      }
    }

    selectCard(2000);
  });
}

function calcDuration(typePrize) {
  if (typePrize === 1) return 20000;
  if (typePrize === 2) return 15000;
  if (typePrize === 3) return 10000;
  return 5000;
  // if (typePrize === 1) return 1000;
  // if (typePrize === 2) return 1000;
  // if (typePrize === 3) return 1000;
  // return 1000;
}
/**
 * Lưu kết quả rút thăm cuối
 */
function saveData() {
  if (!currentPrize) {
    //Nếu kết thúc mở thưởng sẽ không có dữ liệu nào được ghi lại, nhưng vẫn có thể tiến hành quay thưởng
    return;
  }

  let type = currentPrize.type,
    curLucky = basicData.luckyUsers[type] || [];

  curLucky = curLucky.concat(currentLuckys);

  basicData.luckyUsers[type] = curLucky;

  if (currentPrize.count <= curLucky.length) {
    currentPrizeIndex--;
    if (currentPrizeIndex <= -1) {
      currentPrizeIndex = 0;
    }
    currentPrize = basicData.prizes[currentPrizeIndex];
  }

  if (currentLuckys.length > 0) {
    // todo by xc Thêm cơ chế tiết kiệm dữ liệu để tránh mất dữ liệu khi máy chủ bị treo
    return setData(type, currentLuckys);
  }
  return Promise.resolve();
}

function changePrize() {
  let luckys = basicData.luckyUsers[currentPrize.type];
  let luckyCount = (luckys ? luckys.length : 0) + EACH_COUNT[currentPrizeIndex];
  // Sửa đổi số lượng và phần trăm giải thưởng bên trái
  setPrizeData(currentPrizeIndex, luckyCount);
}

function random(num) {
  return Math.floor(Math.random() * num);
}
function randomExcluding(num, arrayNumber) {
  console.log("arrayNumber");
  console.log(arrayNumber);
  const random_ = Math.floor(Math.random() * num);
  if (num > arrayNumber.length && arrayNumber.includes(random_)) {
    return randomExcluding(num, arrayNumber);
  }
  return random_;
}
function findLessPrize(leftUser, currentPrize) {
  return leftUser.reduce((previousValue, currentValue, currentIndex) => {
    if (currentPrize === 4) {
      if (currentValue[6]) {
        return [...previousValue, currentIndex];
      } else {
        return previousValue;
      }
    } else {
      if (currentValue[6] || currentValue[5]) {
        return [...previousValue, currentIndex];
      } else {
        return previousValue;
      }
    }
  }, []);
}

function changeCard(cardIndex, user) {
  let card = threeDCards[cardIndex].element;

  card.innerHTML = `
    <div class="dev-img" style="background: url('${user[3]}') no-repeat top center;
  background-size: cover;"></div>`;
}

/**
 * Chuyển đổi nền bảng tên
 */
function shine(cardIndex, color) {
  let card = threeDCards[cardIndex].element;
  card.style.backgroundColor =
    color || "rgba(0,127,127," + (Math.random() * 0.7 + 0.25) + ")";
}

/**
 * Chuyển đổi ngẫu nhiên thông tin nền và thông tin nhân sự
 */
function shineCard() {
  let maxCard = 10,
    maxUser;
  let shineCard = 10 + random(maxCard);

  setInterval(() => {
    if (isLotting) {
      return;
    }
    maxUser = basicData.leftUsers.length;
    for (let i = 0; i < shineCard; i++) {
      let index = random(maxUser),
        cardIndex = random(TOTAL_CARDS);
      if (selectedCardIndex.includes(cardIndex)) {
        continue;
      }
      shine(cardIndex);
      changeCard(cardIndex, basicData.leftUsers[index]);
    }
  }, 1000);
}

function setData(type, data) {
  return new Promise((resolve, reject) => {
    window.AJAX({
      url: "/saveData",
      data: {
        type,
        data,
      },
      success() {
        resolve();
      },
      error() {
        reject();
      },
    });
  });
}

function setErrorData(data) {
  return new Promise((resolve, reject) => {
    window.AJAX({
      url: "/errorData",
      data: {
        data,
      },
      success() {
        resolve();
      },
      error() {
        reject();
      },
    });
  });
}

function exportData() {
  window.AJAX({
    url: "/export",
    success(data) {
      if (data.type === "success") {
        location.href = data.url;
      }
    },
  });
}

function reset() {
  window.AJAX({
    url: "/reset",
    success(data) {},
  });
}

function createHighlight() {
  let year = "0123";
  let step = 6;
  let yoffset = 0;
  let highlight = [];

  // Tính tổng chiều rộng dãy chữ
  let totalWidth = year.length * step; // mỗi chữ cách nhau 6 đơn vị

  // Tính toán xoffset sao cho chữ được căn giữa
  let screenWidth = 32; // Độ rộng của màn hình (có thể thay đổi)
  let xoffset = Math.floor((screenWidth - totalWidth) / 2); // Tính xoffset để căn giữa

  year.split("").forEach((n) => {
    highlight = highlight.concat(
      NUMBER_MATRIX[n].map((item) => {
        return `${item[0] + xoffset}-${item[1] + yoffset}`;
      })
    );
    xoffset += step; // Di chuyển xoffset cho chữ tiếp theo
  });

  return highlight;
}


let onload = window.onload;

window.onload = function () {
  onload && onload();

  let music = document.querySelector("#music");

  let rotated = 0,
    stopAnimate = false,
    musicBox = document.querySelector("#musicBox");

  function animate() {
    requestAnimationFrame(function () {
      if (stopAnimate) {
        return;
      }
      rotated = rotated % 360;
      musicBox.style.transform = "rotate(" + rotated + "deg)";
      rotated += 1;
      animate();
    });
  }

  musicBox.addEventListener(
    "click",
    function (e) {
      if (music.paused) {
        music.play().then(
          () => {
            stopAnimate = false;
            animate();
          },
          () => {
            // addQipao("Nhạc đã bật！");
          }
        );
      } else {
        music.pause();
        stopAnimate = true;
      }
    },
    false
  );

  setTimeout(function () {
    musicBox.click();
  }, 1000);
};
