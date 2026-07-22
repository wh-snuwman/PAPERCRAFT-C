import "./imgLoad.js"
import "./newId.js"
import  { state }  from './init.js'
import { phi, wing } from "./api.js"


window.particle = function(type,pos,count,spread=0){
    for (let i=0; i<count; i++){
        if (type == 'sculpture'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'addX':phi.random(-4,4),
                'delTime':0,
                'floor':-14,
                'gravity':-14
            },newId(),IMG.PARTICLE[type])
        } 
        else if (type == 'empty_shell'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'addX':phi.random(-2,2),
                'delTime':0,
                'floor':-8,
                'gravity':-8
            },newId(),IMG.PARTICLE[type])
        } 
        else if (type == 'bang'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'addX':phi.random(-1,1),
                'delTime':0,
                'floor':-8,
                'gravity':-11
            },newId(),IMG.PARTICLE[type])
        } 
        else if (type == 'gun_fire'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'delTime':Date.now() + 20,
            },newId(),IMG.PARTICLE[type])
        }
        else if (type == 'gun_fire_flip'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'delTime':Date.now() + 20,
                'flip':true
            },newId(),IMG.PARTICLE['gun_fire'])
        }
        else if (type == 'sculpture_1'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'addX':phi.random(-4,4),
                'gravity':-10
            },newId(),IMG.PARTICLE['sculpture'])
        } 



        else{
            console.error('정의되지 않은 타입의 파티클입니다!')
        }
    }
}