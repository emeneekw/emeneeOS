import { loadImage, loadText, makePassFBO, makePass } from "./utils.js";
import { setupCamera, cameraCanvas, cameraAspectRatio } from "../camera.js";

let start;
const numClicks = 5;
const clicks = Array(numClicks).fill([0, 0, -Infinity]).flat();
let aspectRatio = 1;

let index = 0;
window.onclick = (e) => {
	clicks[index * 3 + 0] = 0 + e.clientX / e.srcElement.clientWidth;
	clicks[index * 3 + 1] = 1 - e.clientY / e.srcElement.clientHeight;
	clicks[index * 3 + 2] = (Date.now() - start) / 1000;
	index = (index + 1) % numClicks;
};

export default ({ regl, config }, inputs) => {
	const output = makePassFBO(regl, config.useHalfFloat);
	const mirrorPassFrag = loadText("shaders/glsl/mirrorPass.frag.glsl");

	// Initialize camera and texture
	const cameraSetupPromise = setupCamera();

	// We create the texture with POT canvas (camera.js ensures this)
	// Initially it is 1x1, but will be resized in the render loop when updated
	const cameraTex = regl.texture({
		data: cameraCanvas,
		min: 'mipmap',
		mipmap: true,
		flipY: true
	});

	const render = regl({
		frag: regl.prop("frag"),
		uniforms: {
			time: regl.context("time"),
			tex: inputs.primary,
			bloomTex: inputs.bloom,
			cameraTex,
			clicks: () => clicks,
			aspectRatio: () => aspectRatio,
			cameraAspectRatio: () => cameraAspectRatio,
		},
		framebuffer: output,
	});

	start = Date.now();

	return makePass(
		{
			primary: output,
		},
		Promise.all([mirrorPassFrag.loaded, cameraSetupPromise]),
		(w, h) => {
			output.resize(w, h);
			aspectRatio = w / h;
		},
		() => {
			// Update the texture from the canvas each frame
			// This will also handle resizing if the canvas size changed (e.g. after setupCamera finished)
			// And because min: 'mipmap' was set, mipmaps will be regenerated.
			cameraTex(cameraCanvas);
			render({ frag: mirrorPassFrag.text() });
		}
	);
};
