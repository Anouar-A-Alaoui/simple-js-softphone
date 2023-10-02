
        let phone;
        const remoteAudio = document.getElementById('remoteAudio');
        const startButton = document.getElementById('startButton');
        const stopButton = document.getElementById('stopButton');
        const callButton = document.getElementById('callButton');
        const hangupButton = document.getElementById('hangupButton');
        const calleeInput = document.getElementById('callee');

        startButton.addEventListener('click', start);
        stopButton.addEventListener('click', stop);
        callButton.addEventListener('click', call);
        hangupButton.addEventListener('click', hangup);

        function start() {
            const configuration = {
                uri: 'sip:yourusername@yourdomain.com',
                password: 'yourpassword',
                sockets: [new JsSIP.WebSocketInterface('wss://yourwebsocketserver.com')],
            };

            phone = new JsSIP.UA(configuration);

            phone.start();

            phone.on('connecting', () => {
                console.log('Connecting...');
            });

            phone.on('connected', () => {
                console.log('Connected');
                startButton.disabled = true;
                stopButton.disabled = false;
                callButton.disabled = false;
            });

            phone.on('disconnected', () => {
                console.log('Disconnected');
                startButton.disabled = false;
                stopButton.disabled = true;
                callButton.disabled = true;
                hangupButton.disabled = true;
            });

            phone.on('newRTCSession', (e) => {
                const session = e.session;

                if (session.direction === 'incoming') {
                    session.on('peerconnection', (e) => {
                        remoteAudio.srcObject = e.stream;
                    });

                    session.answer();
                    hangupButton.disabled = false;
                }
            });
        }

        function stop() {
            phone.stop();
        }

        function call() {
            const destination = calleeInput.value;
            const options = {
                mediaConstraints: { audio: true, video: false },
            };

            const session = phone.call(destination, options);

            session.on('connecting', () => {
                console.log('Call connecting...');
            });

            session.on('confirmed', () => {
                console.log('Call confirmed');
                hangupButton.disabled = false;
            });

            session.on('ended', () => {
                console.log('Call ended');
                hangupButton.disabled = true;
            });
        }

        function hangup() {
            phone.terminateSessions();
            remoteAudio.srcObject = null;
            hangupButton.disabled = true;
        }
