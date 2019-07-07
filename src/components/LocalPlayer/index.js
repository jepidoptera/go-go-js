import api from "../../js/api";
// an object to track local player, and to keep pinging so the server knows we're online

class localPlayer {
    username = "";
    online = true;
    pingInterval = null;

    load (callback) {
        this.username = sessionStorage.getItem("username");
        this.authtoken = sessionStorage.getItem("authtoken");
        // ask the server for info about this player
        api.loadPlayer(this.username, (data) => {
            // incorporate response into player object (this)
            this.setData(data);
            // ping!
            this.startPinging();
            // run the callback function if there is one
            if (callback) callback(data);
        })
    }

    startPinging () {
        console.log("logged in as:", this);
        // continually ping the server to let it know we're online
        this.pingInterval = setInterval(() => {
            console.log("ping...");
            api.ping(this.username, this.authtoken, data => {
                // server may sometimes return messages to us
                let message = data.message;
                if (message) {
                    // show message
                    alert(message);
                }
            })
        }, 10000);
    }

    setData(data) {
        // incorporate all the data into this object
        Object.keys(data).forEach(key => {
            this[key] = data[key];
        })
    }

    authorize(callback) {
        api.authorizePlayer(this.username, this.authtoken, (res) => {
            console.log("authorizing: ", this);
            // this should either be true or false
            callback(res.valid);
        })
    }

    unload() {
        // stop pinging
        clearInterval(this.pingInterval);
    }
};

export default new localPlayer();