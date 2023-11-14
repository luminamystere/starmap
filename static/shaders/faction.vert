varying vec3 v_Normal;
varying vec3 vPos;
varying mat4 mMatrix;

void main(void) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
    vPos = position;
    mMatrix = modelMatrix;
}