"use strict";

$.ajax({
  url: "/assets/전국대학리스트.csv",
  dataType: "text",
}).done(appendSelectOption);

// 이메일 유효성 체크
function email_check(email) {
  var regex =
    /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  return email != "" && email != "undefined" && regex.test(email);
}

function appendSelectOption(data) {
  var allRows = data.split(/\r?\n|\r/);

  for (var singleRow = 1; singleRow < allRows.length; singleRow++) {
    var rowCells = allRows[singleRow].split(",");
    var rowCell = 0;
    var option = `<option value="${rowCells[rowCell]}">`;
    option += rowCells[rowCell];
    option += "</option>";
    $("#univ").append(option);
  }
}

const id = document.querySelector("#id"),
  name = document.querySelector("#name"),
  psword = document.querySelector("#psword"),
  confirmPsword = document.querySelector("#confirm-psword"),
  registerBtn = document.querySelector("#button"),
  email = document.querySelector("#email"),
  gender = document.querySelector("#gender"),
  univ = document.querySelector("#univ");

registerBtn.addEventListener("click", register);

function register() {
  if (!id.value) return alert("아이디를 입력해주십시오.");
  if (!name.value) return alert("닉네임을 입력해주십시오.");
  if (!psword.value) return alert("비밀번호 입력해주십시오.");
  if (!email.value) return alert("이메일을 입력해주십시오.");
  if (!gender.value) return alert("성별을 입력해주십시오.");
  if (!univ.value) return alert("대학교를 입력해주십시오.");
  if (psword.value !== confirmPsword.value) return alert("비밀번호가 일치하지 않습니다.");
  if (!email_check(email.value)) {
    return alert("이메일 형식으로 적어주십시오.");
  }

  const req = {
    id: id.value,
    name: name.value,
    psword: psword.value,
    email: email.value,
    gender: gender.value,
    univ: univ.value,
  };

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        location.href = "/login";
      } else {
        if (res.err) return alert(res.err);
        alert(res.msg);
      }
    })
    .catch((err) => {
      console.error("회원가입 중 에러 발생");
    });
}
