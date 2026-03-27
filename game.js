import {PHI} from "/@phi/src/script/PHI.js" // webgl2 기반 그래픽조정 모듈

(async () => {
const phi = new PHI("display-canvas"); // 캔버스 연결
phi.display([innerWidth, innerHeight]); // 초기 화면 설정
phi.textDisplay("text-canvas"); // 캔버스에서 텍스트렌더링 사용

const IMG = { // 게임내의 모든 이미지저장
    GROUND : await phi.imgLoad("src/img/ground/0.png"),
    MOUSE : await phi.imgLoad("src/img/mouse/0.png"),
    UI : {
        common_cancel : await phi.imgLoad("src/img/ui/common_cancel.png"),
        common_checkbox_off : await phi.imgLoad("src/img/ui/common_checkbox_off.png"),
        common_checkbox_on : await phi.imgLoad("src/img/ui/common_checkbox_on.png"),
        common_msgbox : await phi.imgLoad("src/img/ui/common_msgbox.png"),
        main_back : await phi.imgLoad("src/img/ui/main_back.png"),
        main_title : await phi.imgLoad("src/img/ui/main_title.png"),
        player_craft : await phi.imgLoad("src/img/ui/player_craft.png"),
        player_state : await phi.imgLoad("src/img/ui/player_state.png"),
        player_inventory_select : await phi.imgLoad("src/img/ui/player_inventory_select.png"),
        player_inventory : await phi.imgLoad("src/img/ui/player_inventory.png"),
    },
    TILE : {
        tree_m : await phi.imgLoad("src/img/tile/tree_m.png"),
        chest : await phi.imgLoad("src/img/tile/chest.png"),
    }
    
}

const MAP_DATA_TRANSLATOR = {
    0 : null,
    1 : 'chest',
    2 : 'tree_m',

}

let SCENE = 'game_main'; // 현재장면
const SCENE_LIST = [ // 모든 장면을 처음에 선언(장면사용시 필수)
    'menu_start','menu_main','menu_load',
    'game_main'
]
const SCENE_INF = {}// 장면전환,플래그등 장면에 대한 부가정보 저장
for (let scene of SCENE_LIST){
    SCENE_INF[scene] = {
        'reset_flag' : false,
        'sub_scene' : '',
    }
}

let COBJ= { // Common OBJ. 자동으로 그려지고 위치가 조정되는 OBJ를 저장.
    'menu_start':{ // 이코드에서는 선언과 이미지적용만 한다
        back : phi.obj(IMG.UI.main_back,[0,0]), 
        title : phi.obj(IMG.UI.main_title,[0,0]),
        list_btn : phi.obj(IMG.UI.common_msgbox,[0,0]),
        // title : phi.obj(IMG.UI.main_title,[0,0]),
    },
}

function CBOJ_RESIZE(){ // COBJ에서 장면에 따라 위치가 자동으로 조정되게 하는 함수. 
    phi.goto(COBJ['menu_start'].back,  [(phi.width-IMG.UI.main_back.width)/2,(phi.height-IMG.UI.main_back.height)/2])
    phi.goto(COBJ['menu_start'].title,  [(phi.width-IMG.UI.main_title.width)/2,phi.height*0.1])
    phi.goto(COBJ['menu_start'].list_btn,  [(phi.width-IMG.UI.common_msgbox.width)/2,phi.height*0.6])
}

CBOJ_RESIZE() 
window.addEventListener('resize',()=>{
    phi.reSizeDisplay() // 화면 비율및 해상도 자동조정
    CBOJ_RESIZE() // 자동 위치재조정
    window.horTileCount = Math.round(phi.width  / tileSize /phi.dpr) + 2; // 화면의 가로에 채워지는 타일수
    window.verTileCount = Math.round(phi.height / tileSize  /phi.dpr) + 2; // 화면의 세로에 채워지는 타일수
    TILE = [];
    for (let i=0; i<window.horTileCount; i++){ // 화면의 가로안에 들어가는 타일수 만큼 반복
        for (let j=0; j<window.verTileCount; j++){ // 화면의 세로안에 들어가는 타일수 만큼 반복
            TILE.push({
                obj: phi.object(IMG.GROUND,[(i*tileSize*phi.dpr)+ cameraAdjX,(j*tileSize*phi.dpr) + cameraAdjY],[tileSize,tileSize]), // 로직및 시스템용 obj
                horNum:i, // 가로줄 
                verNum:j, // 세로줄
                innerChunckId:0,
                chunckId:[],
                id:[],
                Isblock:false, // 일반 통과가능 여부
                TILE:0, // 타일종류
                TILEOBJ:phi.obj(null,[0,0],[0,0]) // 렌더링용 obj
            });
        }
    }
    console.log(horTileCount*verTileCount);
    
})

function tileRelaod(tile){ // 게임내의 시스템에서 사용하는 타일특성 초기화 함수
    tile.Isblock = false
}

function mod(n, m){return ((n % m) + m) % m;}// % 보정함수. 나머지가 음수여도 다시양수로 변환.ex) (-1 % 5 = -1 [x]) => (-1 % 5 = 4 [o])

let mousePos = [0,0]; // 마우스좌표
let click = true; // 클릭여부(한번)
let flip = false // 내캐릭터 뒤집힘여부
let isMove = false
let interaction = false

let upKey = false;
let leftKey= false;
let downKey = false;
let rightKey = false;

let moveR = 0; // 이동로직에 쓰이는 변수
let moveL = 0; //
let moveU = 0; //
let moveD = 0; //

// ============================================================== CAMERA ============================================================== //
//  <!! 주의 !! >
// 로직에서 실제 움직임과 카메라의 움직임은 완전 개별이다.
// 플레이어가 아무리 많이 움직여도 카메라가 움직이지 않는다면 계속 같은곳만 렌더링 된다.
// 타일의 렌더링 기준은 "카메라" 다. 유저의 눈에만 맵이 보이면 되므로 그외의 타일은 렌더링 하지 않는다.
// 또한 항상 최소의 타일만 렌더링하도록 모니터의 크기에 맞추어서 렌더링 한다.
let moveRc = 0; // 카메라의 이동로직에 쓰이는 변수
let moveLc = 0; //
let moveUc = 0; //
let moveDc = 0; //
let cameraX = 0;
let cameraY = 0;
// ============================================================== CAMERA ============================================================== //

// 모든맵데이터 저장
window.MAP_DATA = {}
window.reqeustChunckId=[] // 데이터 요청을 보낸 청크아이디(중복요청 방지)

let TILE = []; // 타일객체 저장
let smooth = 0.9 // 움직임 보정용(부드럽기)
let speed = 15 // 플레이어 이동속도

const chunkSize = 24; // 청크사이즈 // 청크는 맵생성 최적화를 위해 사용한다.(마인크래프트 생각하세요.꽤 유사할 겁니다.)
// 청크 시스템 예시(청크사이즈 = 10)
// 1 2 3 4 5 ...
// 10 11 12 ...
// 타일내에서 청크저장 : [<청크가로ID>,<청크세로ID>,<청크내부에서 부여숫자>]

const tileSize = 160; // 타일크기는 120의 배수를 상용한다(권장사항). FHD(1920X1080) 의최대공약수.
// 아래두 변수는 무조건 정수여야 한다.
// 메모 : 뒷쪽의 정수는 설정에 따라 직접 조정하여 사용한다. 2정도로 설정하면 왠만하면 자연스럽게 렌더링된다.
window.horTileCount = Math.round(phi.width  / tileSize /phi.dpr) + 2; // 화면의 가로에 채워지는 타일수
window.verTileCount = Math.round(phi.height / tileSize  /phi.dpr) + 2; // 화면의 세로에 채워지는 타일수

const adjX = -tileSize*1.5; // 전체타일의 위치조정
const adjY = -tileSize*1.5;  // 전체타일의 위치조정

let cameraAdjX = (phi.width - 100) / 2 // 카메라 위치조정
let cameraAdjY = (phi.height - 100) / 2 // 카메라 위치조정

for (let i=0; i<horTileCount; i++){ // 화면의 가로안에 들어가는 타일수 만큼 반복
    for (let j=0; j<verTileCount; j++){ // 화면의 세로안에 들어가는 타일수 만큼 반복
        // ================= DEV ================= //
        // 테스트용 이미지 랜덤을 지정
        let img = null; 
        if (phi.random(0,1) == 0){
            img = IMG.TILE.basic
        } else {
            img = IMG.TILE.basic2
        }
        // ================= DEV ================= //

        TILE.push({
            obj: phi.object(IMG.GROUND,[(i*tileSize*phi.dpr)+ cameraAdjX,(j*tileSize*phi.dpr) + cameraAdjY],[tileSize,tileSize]), // 로직및 시스템용 obj
            horNum:i, // 가로줄 
            verNum:j, // 세로줄
            innerChunckId:0,
            chunckId:[],
            id:[],
            Isblock:false, // 일반 통과가능 여부
            TILE:0, // 타일종류
            TILEOBJ:phi.obj(null,[0,0],[0,0]) // 렌더링용 obj
        });
    }
}

let objSortList = []

function sortRender(obj){
    objSortList.push(obj)
}




class entitySys {
    constructor() {
        this.allEntity = {}
    }

    newEntity(type_,name_,pos_,motion_,tag_,id_){
        const e = {
            type:type_,
            name:name_,
            pos:pos_,
            motion:motion_,
            tag:tag_,
            id_:id_,
            renderObj:phi.obj(null,[0,0],[0,0]),
        }
        this.allEntity[id_] = e;
        return e;
    }

    rednerEntity(){
        null;
    }

    removeEntity(id_){
        delete this.allEntity[id_];
    }

}

window.entity = new entitySys();

// =========================== test =================================== //
entity.newEntity('player','user192',[0,0],{},{},'12983871o8739');
// =========================== test =================================== //

document.body.style.cursor = "none";
let pointerObj = phi.obj(IMG.MOUSE,[0,0])
const testObj = phi.obj(IMG.UI.common_cancel,[0,0]) // 개발용 테스팅 OBJ. 이미지 크기 테스트및 기술테스트용
phi.loop(() => {
    if (rightKey || leftKey || upKey || downKey) {
        isMove = true
    } else {
        isMove = false
    }
    phi.fill(255,255,255);
    
    switch (SCENE){ // 스위치 케이스 문을 사용하여 장면나누기
        case 'menu_start' : {// 접속시 첫메뉴
            for (const name in COBJ['menu_start']){
                const obj = COBJ['menu_start'][name] 
                phi.blit(obj)
            }
        }
        
        case 'game_main' : { // 실제 인게임
            // #region 키입력
            if (upKey){moveU = speed; moveUc = speed} else {moveU = moveU * smooth; moveUc = moveUc * smooth}
            if (leftKey){moveL  = speed;moveLc  = speed} else {moveL = moveL * smooth;moveLc = moveLc * smooth}
            if (downKey){moveD  = speed;moveDc  = speed} else {moveD = moveD * smooth;moveDc = moveDc * smooth}
            if (rightKey){moveR  = speed;moveRc  = speed} else {moveR = moveR * smooth;moveRc = moveRc * smooth}
            // #endregion
            

            for (let TINF of TILE){ //Tile INFormation
                const obj = TINF.obj // 타일 물리엔진. 타일이 통과불가능 특성일때 플레이어가 통과하지 못하도록 막음.
                if (TINF.id in MAP_DATA && TINF.Isblock){
                    phi.moveY(obj,speed)
                    if (phi.isEncounterObj(obj,playerObj[nickname].obj)){
                        moveU = 0
                        moveUc = 0
                    }
                    phi.moveY(obj,-speed)

                    phi.moveY(obj,-speed)
                    if (phi.isEncounterObj(obj,playerObj[nickname].obj)){
                        moveD = 0
                        moveDc = 0
                    }
                    phi.moveY(obj,speed)

                    phi.moveX(obj,-speed)
                    if (phi.isEncounterObj(obj,playerObj[nickname].obj)){
                        moveR = 0
                        moveRc = 0
                    }
                    phi.moveX(obj,speed)
                
                    phi.moveX(obj,speed)
                    if (phi.isEncounterObj(obj,playerObj[nickname].obj)){
                        moveL = 0
                        moveLc = 0
                    }
                    phi.moveX(obj,-speed)
                }
                // #region 타일물리엔진
                phi.moveY(obj,-moveDc); // 실제 이동량 적용
                phi.moveY(obj,moveUc); // 실제 이동량 적용
                phi.moveX(obj,moveLc); // 실제 이동량 적용
                phi.moveX(obj,-moveRc); // 실제 이동량 적용
                TINF.innerChunckId = mod(TINF.verNum,chunkSize) * chunkSize + mod(TINF.horNum, chunkSize) // 타일이 속한 청크내에서의 ID
                TINF.chunckId = [Math.floor(TINF.horNum / chunkSize),Math.floor(TINF.verNum / chunkSize)] // 타일이 속한 청크의 ID
                TINF.id = [TINF.chunckId[0],TINF.chunckId[1],TINF.innerChunckId] // 타일의 ID. 리스트 형대로 저장되고 [<청크내애서의_아이디1>,<청크내애서의_아이디2>,<청크>]
                // 타일이 화면 끝에 있을때 반대쪽화면으로 이동 하는 코드
                if (obj.x > (horTileCount*tileSize*phi.dpr) + adjX){
                    phi.moveX(obj,-horTileCount*tileSize*phi.dpr)
                    TINF.horNum -= horTileCount
                    tileRelaod(TINF)
                } else if (obj.x < adjX){
                    phi.moveX(obj,horTileCount*tileSize*phi.dpr)
                    TINF.horNum += horTileCount
                    tileRelaod(TINF)
                } else if (obj.y > verTileCount*tileSize*phi.dpr + adjY){
                    phi.moveY(obj,-verTileCount*tileSize*phi.dpr)
                    TINF.verNum -= verTileCount
                    tileRelaod(TINF)
                } else if (obj.y < adjY){ 
                    phi.moveY(obj,verTileCount*tileSize*phi.dpr)
                    TINF.verNum += verTileCount
                    tileRelaod(TINF) 
                }  
                // #endregion

                // TINF.innerChunckId // 타일이 속한 청크내에서의 ID
                // TINF.chunckId // 타일이 속한 청크의 ID
                // TINF.id // 타일의 ID. 리스트 형대로 저장되고 [<청크내애서의_아이디1>,<청크내애서의_아이디2>,<청크>]

                // console.log(String(TINF.chunckId))
                if (String(TINF.chunckId) in MAP_DATA){ // 청크데이터가 있는지 확인
                    // ============================ DEV ============================  //
                    phi.blit(obj); // 기본 바닥
                    phi.text(`${TINF.id}`,[obj.x+obj.width/2 - 40,obj.y+obj.height/2],'20px');
                    // console.log(TINF.id)
                    
                    const TILE_DATA = MAP_DATA[String(TINF.chunckId)][TINF.innerChunckId]; // 진짜 맵데이터
                    const TILE = MAP_DATA_TRANSLATOR[TILE_DATA.tile]; // (정수x) 엔티티 이름 문자열
                    if (TILE != null){
                        if (TINF.TILE == TILE_DATA.tile){
                            phi.goto(TINF.TILEOBJ,[obj.x,obj.y]);
                        } else {
                            TINF.TILE = TILE_DATA.tile;
                            TINF.TILEOBJ = phi.obj(IMG.TILE[TILE],[obj.x,obj.y],null);
                        }
                        phi.move(TINF.TILEOBJ,[
                            -(TINF.TILEOBJ.width-tileSize)/2,
                            -TINF.TILEOBJ.height + tileSize*0.6,
                            // 0
                        ])
                        phi.rotate(TINF.TILEOBJ,20,'center',[0,0])
                        // phi.flip(TINF.TILEOBJ)
                        sortRender(TINF.TILEOBJ);
                    }
                    // ============================ DEV ============================  //

                } else {
                    window.paper.send({ // 데이터 요청
                        "type":"noChunkData",
                        "data":String(TINF.chunckId)
                    })
                    reqeustChunckId.push(String(TINF.chunckId)) // 중복요청 방지
                }
            }
            
            // 엔티티 시스템
            for (let key in entity.allEntity){
                let ntt = entity.allEntity[key];
                
                // 엔티티에 따라 렌더링 
            
            
            }



            // #region 오브젝트 렌더링 우선순위 정리및 렌더링
            objSortList = objSortList.sort((a,b) => (a.y + a.height) - (b.y + b.height));
            for (let obj of objSortList){
                phi.blit(obj);
            }
            objSortList = [];
            // #endregion
            
        }

        phi.goto(pointerObj,mousePos)
        phi.blit(pointerObj)
    }
});

document.addEventListener('mousemove',(e)=>{mousePos = [e.offsetX*phi.dpr,e.offsetY*phi.dpr]}); // 마우스좌표
document.addEventListener('mousedown',(e) => {click = true}); // 클릭
document.addEventListener('keydown',(e)=>{ // 움직임(누르기)
    if (e.key == 'w' || e.key == 'W')upKey = true;
    if(e.key == 'a' || e.key == 'A') leftKey= true;
    if(e.key == 's' || e.key == 'S') downKey = true;
    if(e.key == 'd' || e.key == 'D') rightKey = true;
    if(e.key == 'e' || e.key == 'E') interaction = true;
})
document.addEventListener('keyup',(e)=>{// 움직임(뗴기)
    if (e.key == 'w' || e.key == 'W') upKey = false;
    if(e.key == 'a' || e.key == 'A') leftKey = false;
    if(e.key == 's' || e.key == 'S') downKey = false;
    if(e.key == 'd' || e.key == 'D') rightKey = false;
})
})();


