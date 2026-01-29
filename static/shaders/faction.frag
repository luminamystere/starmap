uniform vec3 sphereColour;
varying vec3 v_Normal;
varying vec3 v_View;
varying vec3 vPos;
varying mat4 mMatrix;

void main(void) {
  vec4 worldPosition = mMatrix * vec4(vPos, 1.0);
  vec3 look = normalize(vec3(cameraPosition) - vec3(worldPosition));
  float dotProduct = dot(v_Normal, look);
  gl_FragColor = vec4(sphereColour, (0.95 - dotProduct));
}