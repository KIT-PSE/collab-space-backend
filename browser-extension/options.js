async function START_RECORDING() {
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

    peer.on('open', (id) => {
      resolve(id);
      peer.on('connection', (conn) => {
        conn.on('open', () => {
          conn.send('hello from the server');
          peer.call(conn.peer, stream);
        });
      });
    });
  });

  return await promise;
}

async function STOP_RECORDING() {
  //
}
