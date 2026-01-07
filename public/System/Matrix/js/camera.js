// TODO: switch to video-based texture
const video = document.createElement("video");
const cameraCanvas = document.createElement("canvas");
cameraCanvas.width = 1;
cameraCanvas.height = 1;
const context = cameraCanvas.getContext("2d");
let cameraAspectRatio = 1.0;
const cameraSize = [1, 1];

const nextPowerOf2 = (n) => Math.pow(2, Math.ceil(Math.log(n) / Math.log(2)));

const drawToCanvas = () => {
	requestAnimationFrame(drawToCanvas);
	context.drawImage(video, 0, 0, cameraCanvas.width, cameraCanvas.height);
};

const setupCamera = async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				width: { min: 800, ideal: 1280 },
				frameRate: { ideal: 60 },
			},
			audio: false,
		});
		const videoTrack = stream.getVideoTracks()[0];
		const { width, height } = videoTrack.getSettings();

		video.width = width;
		video.height = height;

		// Use power-of-two dimensions for mipmapping support
		const pWidth = nextPowerOf2(width);
		const pHeight = nextPowerOf2(height);

		cameraCanvas.width = pWidth;
		cameraCanvas.height = pHeight;

		cameraAspectRatio = width / height;
		cameraSize[0] = pWidth;
		cameraSize[1] = pHeight;

		video.srcObject = stream;
		video.play();

		drawToCanvas();
	} catch (e) {
		console.warn(`Camera not initialized: ${e}`);
	}
};

export { cameraCanvas, cameraAspectRatio, cameraSize, setupCamera };
