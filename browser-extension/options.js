async function START_RECORDING() {
  console.log('start recording');

  // const stream = await navigator.mediaDevices.getDisplayMedia({
  //     preferCurrentTab: true,
  // });

  const stream = await new Promise((resolve, reject) => {
    chrome.tabCapture.capture(
      {
        video: true,
        videoConstraints: {
          mandatory: {
            minWidth: 1920,
            minHeight: 1080,
            maxWidth: 1920,
            maxHeight: 1080,
          },
        },
      },
      (stream) => {
        if (stream) {
          resolve(stream);
        } else {
          reject();
        }
      },
    );
  });

  const promise = new Promise((resolve) => {
    const peer = new peerjs.Peer();

    // peer.on('call', (call) => {
    //     call.answer(stream);
    // });

    peer.on('open', (id) => {
      resolve(id);
      console.log('open peer:', id);

      peer.on('connection', (conn) => {
        console.log('established connection:', conn);

        conn.on('open', () => {
          console.log('connected: ' + conn.peer);
          conn.send('hello from the server');
          peer.call(conn.peer, stream);
        });
      });
    });
  });

  return await promise;
}

async function STOP_RECORDING() {
  console.log('stop recording');
}