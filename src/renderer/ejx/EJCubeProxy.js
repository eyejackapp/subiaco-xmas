import * as THREE from 'three';
const getCubeProxyMaterial = () => {
    const material = new THREE.ShaderMaterial({
        name: 'CubeProxyMaterial',
        uniforms: {
            time: { value: 0 },
            opacity: { value: 1 },
            loading: { value: 1 },
            loadProgress: { value: 0 },
        },
        vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
        fragmentShader: `
      uniform float time;
      uniform float opacity;
      uniform float loading;
      uniform float loadProgress;

      varying vec2 vUv;

      vec4 alphaBlend( vec4 src, vec4 dst ) {
        float final_alpha = src.a + dst.a * (1.0 - src.a);
        if( final_alpha == 0.0 ) {
          return vec4( 0.0, 0.0, 0.0, 0.0 );
        }
        return vec4( (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / final_alpha, final_alpha);
      }

      float border(vec2 uv, float strokeWidth, float feather) {
        vec2 borderBottomLeft = smoothstep(vec2(strokeWidth * feather), vec2(strokeWidth), uv);
        vec2 borderTopRight = smoothstep(vec2(strokeWidth * feather), vec2(strokeWidth), 1.0 - uv);
        return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;
      }

      float lerp(float a, float b, float t) {
        return (b - a) * t + a;
      }

      float unlerp(float a, float b, float t) {
        return (t - a) / (b - a);
      }

      float remap(float a1, float b1, float a2, float b2, float t) { 
        return lerp(a2, b2, unlerp(a1, b1, t));
      }

      void main() {
        if( opacity == 0.0 ) {
          discard;
        }

        float waveTime = 2.0;
        float wavePeriod = 5.0;
        float waveX = sin( vUv.x * wavePeriod + time * waveTime );
        float waveY = cos( vUv.y * wavePeriod + time * waveTime );
        waveX = remap( -1.0, 1.0, 0.5, 1.0, waveX );
        waveY = remap( -1.0, 1.0, 0.5, 1.0, waveY );
        float wave = waveX * waveY;
        float wavePulse = wave * loading;
        float waveAlpha = mix(1.0, wave, loading);

        vec4 borderColor = vec4( 1.0, 1.0, 1.0, 0.5 );
        float borderWidth = 0.003 + 0.003 * wavePulse;
        float borderFeather = 0.0;
        float line = border(vUv, borderWidth, 1.0 - borderFeather);
        vec4 colorBorder = vec4(borderColor.xyz, borderColor.a * line * waveAlpha);

        vec4 colorFinal = vec4(0.0, 0.0, 0.0, 0.0);
        colorFinal = alphaBlend(colorBorder, colorFinal); // blend border on top.

        if( loading > 0.0 ) {
          vec4 rect = vec4(0.5 - loadProgress * 0.5, 0.5 - loadProgress * 0.5, 0.5 + loadProgress * 0.5, 0.5 + loadProgress * 0.5);
          vec2 hv = step(rect.xy, vUv) * step(vUv, rect.zw);
          float onOff = hv.x * hv.y;
          if( onOff > 0.5 ) {
            float pulse = remap( -1.0, 1.0, loadProgress, 1.0, sin( time * 2. ) );
            colorFinal = vec4(1.0, 1.0, 1.0, loading * pulse);
          }
        }
 
        colorFinal.a *= opacity;

        gl_FragColor = colorFinal;
      }
    `,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        depthTest: false,
    });
    return material;
};

//---------------------------------------------------------------- EJCubeProxy
class EJCubeProxy {
    constructor(container) {
        this.container = container;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        // geometry.translate(0, 1, 0);
        const material = getCubeProxyMaterial();
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.name = 'EJCubeProxyMesh';
        this.cube.castShadow = true;
        this.container.add(this.cube);
    }

    set loading(value) {
        if (value > 0.99) {
            value = 1;
        } else if (value < 0.01) {
            value = 0;
        }
        this.cube.material.uniforms.loading.value = value;
    }

    set loadProgress(value) {
        this.cube.material.uniforms.loadProgress.value = value;
    }

    get opacity() {
        return this.cube.material.uniforms.opacity.value;
    }

    set opacity(value) {
        this.cube.material.uniforms.opacity.value = value;
    }

    set timeElapsed(value) {
        this.cube.material.uniforms.time.value = value;
    }

    update(elapsed, delta) {
        //
    }
}
export { EJCubeProxy };
