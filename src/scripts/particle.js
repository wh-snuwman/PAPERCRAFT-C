import "./imgLoad.js"
import "./newId.js"

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
        } else if (type == 'empty_shell'){
            window.entity.newEntity('particle',null,[pos[0]+phi.random(spread/-2,spread/2),pos[1]+phi.random(spread/-2,spread/2)],null,{
                'particleType':type,
                'adjY':0,'adjX':0,
                'addX':phi.random(-2,2),
                'delTime':0,
                'floor':-8,
                'gravity':-11
            },newId(),IMG.PARTICLE[type])
        }
    }
}