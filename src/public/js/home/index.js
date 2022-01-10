sessionStorage.clear();

var user_num = 0; // 사용자 수
var storage_num = 0; // 스토리지에서 키값
var base_loc; // geolocation으로 현재 위치를  받아와서 기본 위치로 설정
var user_road_address = []; // 사용자 출발 위치의 도로명주소 저장 리스트
var tmp_road_address = []; // 사용자 출발 위치 확정 전 선택된 place 객체의 도로명주소 저장 리스트
var user_place_name = []; // 사용자 출발 위치의 장소 이름 저장 리스트
var tmp_place_name = []; // 사용자 출발 위치 확정 전 선택된 place 객체의 장소 이름 저장 리스트
var tmp_coords = []; // 사용자 출발 위치 확정 전 선택된 place 객체의 위도 경도 값
var user_coords = []; // 사용자 출발 위치의 위도 경도 값
var storage = window.sessionStorage; // 세션 스토리지

// 마커 생성
var marker = new kakao.maps.Marker(),
  infowindow = new kakao.maps.InfoWindow({
    zIndex: 1,
    disableAutoPan: true,
  });

var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.5662, 126.9784), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
  };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 마커를 담을 배열입니다
var markers = [];

function current_position() {
  // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
  if (navigator.geolocation) {
    // GeoLocation을 이용해서 접속 위치를 얻어옵니다
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = position.coords.latitude, // 위도
        lon = position.coords.longitude; // 경도

      var locPosition = new kakao.maps.LatLng(lat, lon); // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
      base_loc = locPosition; // 현재 위치를 기본 위치로 설정

      // 지도 중심좌표를 접속위치로 변경합니다
      map.setCenter(locPosition);
      map.setLevel(3);
    });
  } else {
    // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

    var locPosition = new kakao.maps.LatLng(37.5662, 126.9784),
      message = "geolocation을 사용할수 없어요..";

    displayMarker(locPosition, message);
  }
}

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {
  var keyword = document.getElementById("keyword").value;

  if (!keyword.replace(/^\s+|\s+$/g, "")) {
    alert("장소를 입력해주세요!");
    return false;
  }

  // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
  ps.keywordSearch(keyword, placesSearchCB);
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
  if (status === kakao.maps.services.Status.OK) {
    // 정상적으로 검색이 완료됐으면
    // 검색 목록과 마커를 표출합니다
    displayPlaces(data);
    // 페이지 번호를 표출합니다
    displayPagination(pagination);
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert("검색 결과가 존재하지 않습니다.");
    return;
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert("검색 결과 중 오류가 발생했습니다.");
    return;
  }
}

// 검색 결과 목록과 마커를 표출하는 함수입니다
function displayPlaces(places) {
  var listEl = document.getElementById("placesList"),
    menuEl = document.getElementById("menu_wrap"),
    fragment = document.createDocumentFragment(),
    bounds = new kakao.maps.LatLngBounds(),
    listStr = "",
    selectedMarker = null; // 선택된 장소의 존재여부

  // 검색 결과 목록에 추가된 항목들을 제거합니다
  removeAllChildNods(listEl);

  // 지도에 표시되고 있는 마커를 제거합니다
  removeMarker();

  for (var i = 0; i < places.length; i++) {
    // 마커를 생성하고 지도에 표시합니다
    var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
      itemEl = getListItem(i, places[i]), // 검색 결과 항목 Element를 생성합니다
      marker = addMarker(placePosition, i, places[i].place_name, itemEl);

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
    // LatLngBounds 객체에 좌표를 추가합니다
    bounds.extend(placePosition);

    // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
    function addMarker(position, idx, title, itemEl) {
      var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png", // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(36, 37), // 마커 이미지의 크기
        imgOptions = {
          spriteSize: new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
          spriteOrigin: new kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
          offset: new kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
          position: position, // 마커의 위치
          image: markerImage,
        });

      var normalImage = markerImage;

      var marker = new kakao.maps.Marker({
        map: map,
        position: position, // 마커의 위치
        image: normalImage,
        title: title,
      });

      marker.normalImage = normalImage;
      (function (marker, title) {
        kakao.maps.event.addListener(marker, "mouseover", function () {
          displayInfowindow(marker, title);
        });

        kakao.maps.event.addListener(marker, "mouseout", function () {
          infowindow.close();
        });

        // 마커에 click 이벤트를 등록합니다
        kakao.maps.event.addListener(marker, "click", function () {
          // 클릭된 마커가 없고, click 마커가 클릭된 마커가 아니면
          // 마커의 이미지를 클릭 이미지로 변경합니다
          if (!selectedMarker || selectedMarker !== marker) {
            setMarkers(null);

            // 현재 클릭된 마커의 이미지는 클릭 이미지로 변경합니다
            marker.setImage(normalImage);
            marker.setMap(map);
          }

          // 클릭된 마커를 현재 클릭된 마커 객체로 설정합니다
          selectedMarker = marker;
        });

        itemEl.onmouseover = function () {
          if (!selectedMarker) {
            displayInfowindow(marker, title);
          }
        };

        itemEl.onmouseout = function () {
          if (!selectedMarker) {
            infowindow.close();
          }
        };

        itemEl.onclick = function () {
          map.setBounds(bounds);

          // 클릭된 마커가 없고, click 마커가 클릭된 마커가 아니면
          // 마커의 이미지를 클릭 이미지로 변경합니다
          if (!selectedMarker || selectedMarker !== marker) {
            setMarkers(null); // 모든 마커 숨김

            // 현재 클릭된 마커의 이미지는 클릭 이미지로 변경합니다
            marker.setImage(normalImage);
            marker.setMap(map);
            displayInfowindow(marker, title); // 선택한 마커만 표시
            tmp_road_address.push(itemEl.road_address_name); // 임시 저장 리스트에 선택한 장소의 도로명주소 저장
            tmp_place_name.push(itemEl.place_name); // 임시 저장 리스트에 선택한 장소의 장소명 저장
            tmp_coords.push(itemEl.y);
            tmp_coords.push(itemEl.x);

            // 클릭된 마커를 현재 클릭된 마커 객체로 설정합니다
            selectedMarker = marker;
          } else if (selectedMarker && selectedMarker === marker) {
            // 클릭한 마커가 이미 선택된 마커일 경우
            setMarkers(map); // 숨겼던 마커 다시 표시
            selectedMarker = null;
          }
        };
      })(marker, places[i].place_name);

      fragment.appendChild(itemEl);

      marker.setMap(map); // 지도 위에 마커를 표출합니다
      markers.push(marker); // 배열에 생성된 마커를 추가합니다

      return marker;
    }
  }

  // 검색결과 항목들을 검색결과 목록 Elemnet에 추가합니다
  listEl.appendChild(fragment);
  menuEl.scrollTop = 0;

  // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
  map.setBounds(bounds);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(index, places) {
  var el = document.createElement("li"),
    itemStr =
      '<span class="markerbg marker_' +
      (index + 1) +
      '"></span>' +
      '<div class="info">' +
      "   <h6>" +
      places.place_name +
      "</h6>";

  el.place_name = places.place_name;
  el.x = places.x;
  el.y = places.y;

  if (places.road_address_name) {
    itemStr +=
      "    <span>" +
      places.road_address_name +
      "</span>" +
      '   <span class="jibun gray">' +
      places.address_name +
      "</span>";
    el.road_address_name = places.road_address_name;
  } else {
    itemStr += "    <span>" + places.address_name + "</span>";
    el.road_address_name = places.address_name;
  }

  itemStr += '  <span class="tel">' + places.phone + "</span>" + "</div>";

  el.innerHTML = itemStr;
  el.className = "item";

  return el;
}

function setMarkers(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination(pagination) {
  var paginationEl = document.getElementById("pagination"),
    fragment = document.createDocumentFragment(),
    i;

  // 기존에 추가된 페이지번호를 삭제합니다
  while (paginationEl.hasChildNodes()) {
    paginationEl.removeChild(paginationEl.lastChild);
  }

  for (i = 1; i <= pagination.last; i++) {
    var el = document.createElement("a");
    el.href = "#";
    el.innerHTML = i;

    if (i === pagination.current) {
      el.className = "on";
    } else {
      el.onclick = (function (i) {
        return function () {
          pagination.gotoPage(i);
        };
      })(i);
    }

    fragment.appendChild(el);
  }
  paginationEl.appendChild(fragment);
}

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title) {
  var content = '<div style="padding:5px;z-index:1;">' + title + "</div>";

  infowindow.setContent(content);
  infowindow.open(map, marker);
}

// 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild);
  }
}

function add_user() {
  if (tmp_road_address.length < 1) {
    alert("장소를 선택해주세요!");
  } else {
    user_num++; // 사용자 인원 추가

    user_road_address.push(tmp_road_address[tmp_road_address.length - 1]); // 사용자 최종 출발위치 도로명주소 저장
    user_place_name.push(tmp_place_name[tmp_place_name.length - 1]); // 사용자 최종 출발위치 장소명 저장
    storage.setItem(
      user_num,
      JSON.stringify([tmp_coords[tmp_coords.length - 2], tmp_coords[tmp_coords.length - 1]])
    );

    // 임시 리스트 초기화
    tmp_road_address = [];
    tmp_place_name = [];
    tmp_coords = [];

    var adduser = document.createElement("div");

    adduser.setAttribute("id", "div_" + user_num);
    adduser.innerHTML =
      "<img src='/assets/person.png'>멤버" +
      user_num +
      " : " +
      user_place_name[user_num - 1] +
      " (" +
      user_road_address[user_num - 1] +
      ")<hr>";
    // adduser.style.borderBottom = "1px solid #2e6076";
    //클릭시 사용자 삭제
    adduser.addEventListener("click", function () {
      var p = this.parentElement;
      p.removeChild(this);
      storage.removeItem(adduser.id.split("_")[1]);
      user_num--;
      user_place_name.pop();
      user_road_address.pop();
    });
    document.getElementById("userlist").appendChild(adduser);
  }
}

function reset_all() {
  // 전역변수 초기화
  user_num = 0;
  tmp_road_address = [];
  tmp_place_name = [];
  user_road_address = [];
  user_place_name = [];

  storage.clear(); // 세션 스토리지 초기화

  removeMarker();
  removeAllChildNods(document.getElementById("placesList"));
  var result = document.getElementById("field");
  document.getElementById("keyword").value = "";
  while (result.hasChildNodes()) {
    result.removeChild(result.firstChild);
  }
  map.setCenter(base_loc);
  map.setLevel(3);

  //사용자 위치 출력 디브 리셋
  var cell = document.getElementById("userlist");
  while (cell.hasChildNodes()) {
    cell.removeChild(cell.firstChild);
  }
}

function goPage() {
  if (user_num < 2) {
    alert("최소 2명 이상의 사용자를 등록하세요!");
  } else {
    location.href = "midpoint";
  }
}
