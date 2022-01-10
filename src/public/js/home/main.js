function goIndex() {
  location.href = "index";
}

function goList() {
  location.href = "list";
}

function info() {
  alert("로그인 후 이용해 주십시오.");
  location.href = "login";
}
function login() {
  location.href = "login";
}
/*--------------------------------------------------------------
# Mainpage 깜박이는 효과 
--------------------------------------------------------------*/
let target = document.querySelector("#dynamic");

function randomString() {
  let stringArr = ["Univ Meeting Place", "데이터로 확인하는 ", "미팅 플레이스로 미팅하다"];
  let selectString = stringArr[Math.floor(Math.random() * stringArr.length)];
  let selectStringArr = selectString.split(""); /*하나하나 쪼개져서 배열로 변환*/

  return selectStringArr;
}
function resetTyping() {
  target.textContent = "";
  dynamic(randomString());
}
//한글자씩 텍스트 출력
function dynamic(randomArr) {
  if (randomArr.length > 0) {
    target.textContent += randomArr.shift();
    setTimeout(function () {
      dynamic(randomArr);
    }, 80);
  } else {
    setTimeout(resetTyping, 3000);
  }
}
dynamic(randomString());

//커서의 깜빡임
function blink() {
  target.classList.toggle("active");
}
setInterval(blink, 500);
