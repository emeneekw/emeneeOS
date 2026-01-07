precision mediump float;
varying vec2 vUV;
uniform sampler2D cameraTex;
uniform float cameraAspectRatio;
uniform float aspectRatio; // Screen aspect ratio

void main() {
    // Basic texture lookup
    // Adjust UV to maintain aspect ratio and fill the screen (cover)
    vec2 uv = vUV;

    // We want to map the screen UV (0..1) to camera UV (0..1) such that the camera image covers the screen
    // without distortion (preserving camera aspect ratio) and cropping excess.

    // Calculate scale factor
    // Screen Aspect > Camera Aspect (Screen wider): crop top/bottom. Scale Y.
    // Screen Aspect < Camera Aspect (Screen taller): crop left/right. Scale X.

    vec2 scale = vec2(1.0);

    // Example: Screen 2.0, Camera 1.0.
    // We want to show only the vertical center of the camera? No.
    // If Screen is Wide (2.0), Camera is Square (1.0).
    // We want to fit width. Camera width matches Screen width.
    // Screen Height is 0.5 * Width. Camera Height is 1.0 * Width.
    // We show 0.5/1.0 = 50% of Camera Height.
    // So we need to map 0..1 Screen Y to 0.25..0.75 Camera Y.
    // UV' = (UV - 0.5) * factor + 0.5
    // factor should be < 1.0 to "zoom in" (crop).
    // factor = 0.5 = ScreenAspect / CameraAspect ? No. 2.0 / 1.0 = 2.0.
    // factor = CameraAspect / ScreenAspect ? 1.0 / 2.0 = 0.5. Yes.

    // Example: Screen 0.5 (Tall), Camera 1.0 (Square).
    // Match Height.
    // Screen Width is 0.5 * Height. Camera Width is 1.0 * Height.
    // We show 50% of Camera Width.
    // factor = ScreenAspect / CameraAspect ? 0.5 / 1.0 = 0.5. Yes.

    if (aspectRatio > cameraAspectRatio) {
        scale.y = cameraAspectRatio / aspectRatio;
    } else {
        scale.x = aspectRatio / cameraAspectRatio;
    }

    uv = (uv - 0.5) * scale + 0.5;

    vec4 color = texture2D(cameraTex, uv);
    gl_FragColor = color;
}
