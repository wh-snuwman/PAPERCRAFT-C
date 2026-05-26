// import {wingAPI} from "../../wingAPI/src/script/wingAPI.js"
import "./imgLoad.js"
// import './game.js'
import "./newId.js"


window.particle = function(type,pos,count,spread=0){
    for (let i=0; i<count; i++){
        window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
            'particleType':type,
            'adjY':0,'adjX':0,
            'addX':phi.random(-4,4),
            'delTime':0,
            'floor':-14,
            'gravity':-14
        },newId(),IMG.PARTICLE.sculpture)
    }
}