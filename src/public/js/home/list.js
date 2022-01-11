var mapCount = 1;
var geocoder = new kakao.maps.services.Geocoder();
var con_count = 1;
Kakao.init("c06242e4a9d597f942abd0370042edbf");

async function getHistoryDb() {
  const res = await fetch("list", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
}

async function load() {
  const db = await getHistoryDb();
  for (var i = 0; i < db.length; i++) {
    $("#appointment_list").append(
      `<button type="button" class="list-group-item list-group-item-action list_title" id="list${
        i + 1
      }" onclick="popUpDetail(${i + 1})">${db[i].place_name}</button><div class="form-group" id="div${
        i + 1
      }"></div>`
    );
  }
}

async function removePlace(cnt) {
  if (confirm(`약속을 삭제하시겠습니까?`) == true) {
    const req = {
      cnt: cnt,
    };
    const res = await fetch("list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    });
    const data = await res.json();
    location.reload();
    return data;
  } else {
    return;
  }
}

async function popUpDetail(listOrder) {
  const detailDiv = document.getElementById(`detail${listOrder}`);

  if (detailDiv) {
    detailDiv.remove();
  } else {
    const db = await getHistoryDb();
    var index = listOrder - 1;
    var cnt = db[index].cnt;

    var detail = document.createElement("div");
    detail.setAttribute("id", `detail${listOrder}`);
    document.getElementById(`div${listOrder}`).appendChild(detail);

    detail.innerHTML +=
      '<div id="' +
      detail.id +
      '_map" style="margin-top:20px; width:300px; height:300px; position:relative; overflow:hidden; display:inline-block;"></div>';
    var mapContainer = document.getElementById(detail.id + "_map"), // 지도를 표시할 div
      mapOption = {
        center: new kakao.maps.LatLng(db[index].lat, db[index].lng), // 지도의 중심좌표
        draggable: false,
        level: 3, // 지도의 확대 레벨
      };

    // 지도를 생성합니다
    var map = new kakao.maps.Map(mapContainer, mapOption);
    var iwContent = '<div style="padding:5px; text-align:center;">' + db[index].place_name + "</div>";

    var markerPosition = new kakao.maps.LatLng(db[index].lat, db[index].lng);
    var marker = new kakao.maps.Marker({
        position: markerPosition,
      }),
      infowindow = new kakao.maps.InfoWindow({
        position: markerPosition,
        content: iwContent,
        zIndex: 1,
        disableAutoPan: true,
      });

    marker.setMap(map);
    infowindow.open(map, marker);

    var addr = document.createElement("div");

    addr.setAttribute("id", "addr");
    addr.innerHTML =
      "<h5 style='font-size:16px'>약속 장소</h5>" + db[index].place_name + "(" + db[index].addr + ")<hr>";
    document.getElementById(detail.id).appendChild(addr);

    var users = document.createElement("div");

    users.setAttribute("id", "users");

    var starting_position = JSON.parse(db[index].starting_position);
    var starting_lat = {};
    var starting_lng = {};
    var userCnt = 1;

    for (var i in starting_position) {
      var coord = starting_position[i].split(",");
      starting_lat[i] = coord[0];
      starting_lng[i] = coord[1];
    }

    for (var i in starting_lat) {
      var coord = new kakao.maps.LatLng(starting_lat[i], starting_lng[i]);
      var callback = function coord2AddressCallback(result, status) {
        if (status === kakao.maps.services.Status.OK) {
          users.innerHTML += "<div id='userbar'><h5 style='font-size:16px'>멤버" + userCnt + "</h5>";
          if (result[0].road_address == null) {
            users.innerHTML += result[0].address.address_name;
            var user_addr = result[0].address.address_name;
          } else {
            users.innerHTML += result[0].road_address.address_name;
            var user_addr = result[0].road_address.address_name;
          }

          var mapUrl = `https://map.kakao.com/?sName=${user_addr}&eName=${db[index].addr}`;
          var mobileUrl = `https://m.map.kakao.com/actions/publicRoute?startLoc=${user_addr}&sxEnc=MMSNLS&syEnc=QOQRQPS&endLoc=${db[index].addr}&exEnc=MOPLUM&eyEnc=QNOMSNN`;

          users.innerHTML += `<a href='https://map.kakao.com/?sName=${user_addr}&eName=${db[index].addr}'; target='_blank'>
              <img src="/assets/kakaomap.png" style="width:34px"/>
            </a>
          <a id="kakao-link-btn${con_count}" href='javascript:sendLink("${db[index].addr}", "${db[index].place_name}", "${mapUrl}", "${mobileUrl}")'>
          <img class='kakao' src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png" /align="middle"></a><hr>`;
          // createLink(db[index], con_count, mapUrl, mobileUrl);
          userCnt++;
          con_count++;
        }
      };

      geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
    }

    var deleteButton = document.createElement("div");
    deleteButton.setAttribute("id", "deleteButton");
    deleteButton.innerHTML += `<button type='button' class="btn btn-outline-danger" onclick='removePlace(${cnt})' style='width:100%'>삭제</button>`;

    document.getElementById(detail.id).appendChild(users);
    document.getElementById(detail.id).appendChild(deleteButton);
    // createLink(db[index], index);
  }
}

function createLink(db, i, mapUrl, mobileUrl) {
  Kakao.Link.createDefaultButton({
    container: `#kakao-link-btn${i}`,
    objectType: "location",
    address: db.addr,
    content: {
      title: db.place_name,
      description: db.addr,
      imageUrl:
        "https://user-images.githubusercontent.com/81161651/148731626-67f478bb-4d60-4b84-8733-31362eaba70e.png",
      link: {
        mobileWebUrl: mobileUrl,
        webUrl: mapUrl,
      },
    },
  });
}

function sendLink(addr, title, mapUrl, mobileUrl) {
  Kakao.Link.sendDefault({
    objectType: "location",
    address: addr,
    addressTitle: title,
    content: {
      title: title,
      description: addr,
      imageUrl:
        "https://user-images.githubusercontent.com/81161651/148731626-67f478bb-4d60-4b84-8733-31362eaba70e.png",
      link: {
        mobileWebUrl: mobileUrl,
        webUrl: mapUrl,
      },
    },
    buttons: [
      {
        title: "웹으로 보기",
        link: {
          mobileWebUrl: mobileUrl,
          webUrl: mapUrl,
        },
      },
    ],
  });
}
