export class paperSignal {

    constructor() {
        this.url = '';
        this.recvFn = null;
        this.isManualClose = false;
        this.isOpen = false;
        this.openPromise = null;
    }


    async connect(url){
        if (this.isOpen || this.openPromise !== null){
            console.error('이미 서버에 연결 되었습니다! '+url)
            return;
        }

        this.url = url;
        this.openPromise = new Promise((resolve,reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = (e) => {
                this.isOpen = true;
                this.open(e);
                resolve();
            };

            this.ws.onerror = (e) => {
                this.isOpen = false;
                this.error(e);
                resolve(e);
            };

            this.ws.onmessage = (e) => this.message(e);

            this.ws.onclose = () => {
                this.isOpen = false;
                this.close();
            };
                
        })

        await this.openPromise
    }

    disconnect(){
        if (this.ws && this.ws.readyState == WebSocket.OPEN){
            console.log('disconnected request')
            this.isManualClose = true;
            this.ws.close()
        }
    }
    
    open(e){
        console.log('[paper] connect success\n' + this.url)
        this.isOpen = true
    }

    close(){

        if (this.isManualClose){
            console.log('disconnected')
        } else {
            console.log('abnormal disconnected')
        }
        this.isOpen = false

    }
    error(e){
        console.log('error')
    }

    recv(fn){
        this.recvFn = fn;
    }

    message(recvdata){

        const data = JSON.parse(recvdata.data)
        const type = data.dataType
        const msg = JSON.parse(data.data)

        if (this.recvFn){
            this.recvFn(msg)
        }
    }
    
    send(msg){
        if(this.ws && this.ws.readyState === WebSocket.OPEN){
            const sendData = JSON.stringify({
                data:msg,
                dataType:"0"
            })
            this.ws.send(sendData);
        }
    }

    async login(nick,pw){
        if(this.ws && this.ws.readyState === WebSocket.OPEN){
            return new Promise((resolve,reject) => {

                const sendData = JSON.stringify({
                    data:{
                        nickname:nick,
                        password:pw,
                    },
                    dataType:"1"
                })
                this.ws.send(sendData);
           
                const handler = (recvdata) => {
                    const data = JSON.parse(recvdata.data)
                    const type = data.dataType
                    const msg = JSON.parse(data.data)

                    if (type == '1_r'){
                        this.ws.removeEventListener("message", handler);
                        if (msg.login) {
                            resolve(true);
                        } else {
                            throw new Error(msg.tip)
                        }
                        
                    }
                };

                this.ws.addEventListener("message", handler);

            });
        }
    }

    async signup(nick,pw){
        if(this.ws && this.ws.readyState === WebSocket.OPEN){
            return new Promise((resolve,reject) => {

                const sendData = JSON.stringify({
                    data:{
                        nickname:nick,
                        password:pw,
                    },
                    dataType:"2"
                })
                this.ws.send(sendData);
           
                const handler = (recvdata) => {
                    const data = JSON.parse(recvdata.data)
                    const type = data.dataType
                    const msg = JSON.parse(data.data)

                    if (type == '2_r'){
                        this.ws.removeEventListener("message", handler);
                        if (msg.signup) {
                            resolve(true);
                        } else {
                            console.error(msg.tip)
                            resolve(false)
                        }
                        
                    }
                };

                this.ws.addEventListener("message", handler);

            });
        }
    }
}