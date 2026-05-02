import {paperSignal} from "/@paperSignal/src/script/paperSignal.js"

(async () => {
    window.paper = new paperSignal();
    window.startLoadFinish = false // 게임파일의 완전한 로딩 끝남 여부
    window.playerId = ''//  내 아이디 
    window.clientId = ''// 클라이언트 고요 ID
    window.join = false
    await paper.connect('ws://localhost:8080');



    paper.recv((recvData)=>{
        const TYPE = recvData.type // type은 무조건 받음.
        const DATA = recvData.data
        
        // console.log(recvData)


        switch(TYPE){
            case('chunckData'):{ // 게임내의 청크데이터 불러오기
                const chunckId = recvData['data2'];
                window.MAP_DATA[chunckId] = recvData['data'];
                reqeustChunckId.pop(chunckId);
                break;
            }
            case('playerJoin'):{ // 플레이어가 참가했을때 최초로 실행되는 코드
                const name = DATA.name
                const id = DATA.id
                const pos = DATA.pos
                const tag = DATA.tag
                if (recvData.me){
                    playerId = id
                    join = true
                }

                window.entity.newEntity(
                    'player',name,pos,tag,{},id
                );
                break;
            }
            case('playerLeft'):{
                // DATA = entity(player) id
                window.entity.removeEntity(DATA)
                break;
            }

            case('loadComplete'):{ // 게임내에서 완전히 로딩이 끝나면 수신받는 명령
                clientId = DATA.objid
                startLoadFinish = true;
                paper.send({
                    "type":'playerJoin',
                    'data':clientId,
                })
                break;
            }
            case("entityDataEdit"):{
                // 엔티티의 부가적인 모든 데이터를 수정하기 위해 서버에서 받는 신뢰성이
                // 보장되어야 하는 명령
                const EDIT = DATA.edit;
                const ID = DATA.id;
                for (let editType of EDIT){
                    if (editType == 'pos'){
                        try{
                            const playerEntity = window.entity.getAll()[ID];
                            playerEntity.pos = DATA.pos;
                            
                        } catch {
                            // 위치데이터 오류시 예외처리
                            // 허나 위치는 조금 누락되어도 상관없어서 딱히? 처리할필요 없다
                        }
                    
                    }
                    // elif 써서 다른 데이터 처리하기
                }
                break;
            }
        }
        
        
    })

})();