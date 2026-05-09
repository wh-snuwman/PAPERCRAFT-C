export class entitySys { 
    constructor() {
        // 엔티티 시스템에서 엔티티(객체)의 데이터를 저장
        this.allEntity = {} 
    }
    newEntity(type_,name_,pos_,motion_,tag_,id_){
        const e = {
            type:type_, // 엔티티 타입
            name:name_, // 엔티티 이름(예: 플레이어 닉네임, 플레이어가 지정해주는 별명)
            pos:pos_, //위치
            motion:motion_, // 엔티티의 모션과 애니매이션 지정(추후 제작예정)
            tag:tag_, // 고급설정 데이터(예 : 이벤트 명령어,태그,고유 데이터)
            id:id_, // 엔티티 구별용 고유 ID
            renderObj:phi.obj(null,[0,0],[0,0]), // 실제 엔티티 렌더링을 위한 오브젝트(phi 모듈)
        }
        this.allEntity[id_] = e;
        return e;
    }
    editEntity(id,editType,data){ // 엔티티 렌더링
        this.allEntity[id].editType = data
    }
    removeEntity(id_){ // 엔티티 삭제
        delete this.allEntity[id_];
    }
    getAll(){
        return this.allEntity
    }
}