import {paperSignal} from "/@paperSignal/src/script/paperSignal.js"

(async () => {
    window.paper = new paperSignal();
    await paper.connect('ws://localhost:8080');

    // paper.send({
    //     "type":'playerJoin',
    // })

    paper.recv((recvData)=>{
        const TYPE = recvData.type // type은 무조건 받음.

        switch(TYPE){
            case('chunckData'):{
                const chunckId = recvData['data2'];
                window.MAP_DATA[chunckId] = recvData['data'];
                reqeustChunckId.pop(chunckId);
            }
            // case('')
            
        }
        
        
    })

})();