/* ========================================
   WEB AR MODULE
======================================== */

let arScene = null;

/* ========================================
   ELEMENTOS
======================================== */

const openARBtn =
    document.getElementById("open-ar-btn");

const closeARBtn =
    document.getElementById("close-ar-btn");

const arContainer =
    document.getElementById("ar-container");

const trackingStatus =
    document.getElementById("tracking-status");

const loadingScreen =
    document.getElementById("ar-loading");
    
const modelViewer =
     document.querySelector('#vaso-viewer');
const loadingOverlay = 
    document.querySelector('#ar-loading');

/* ========================================
   EVENTOS
======================================== */
openARBtn.addEventListener(
    "click",
    async () => {

        try {

            /* HTTPS */
            if (
                location.protocol !== "https:" &&
                location.hostname !== "localhost"
            ) {
                alert(
                    "A experiência AR requer HTTPS."
                );

                return;
            }

            /* SUPORTE CÂMERA */
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                alert(
                    "Seu navegador não suporta câmera."
                );

                return;
            }

            startAR();

        } catch (error) {

            console.error(error);

            alert(
                "Erro ao iniciar AR."
            );
        }
    }
);

closeARBtn.addEventListener(
    "click",
    stopAR
);

/* ========================================
   START AR
======================================== */

function startAR() {

    if (arScene) return;

    console.log("[AR] Inicializando...");

    arContainer.style.display = "block";

    loadingScreen.classList.remove(
        "hidden"
    );

    arScene =
        document.createElement("a-scene");

    /* ========================================
       AFRAME
    ======================================== */
  
  arScene.setAttribute(
        "embedded",
        "true"
    );

    arScene.setAttribute(
        "renderer",
        `
        antialias: true;
        alpha: true;
        precision: mediump;
        logarithmicDepthBuffer: true;
        `
    );

    arScene.setAttribute(
        "vr-mode-ui",
        "enabled: false"
    );

    arScene.setAttribute(
        "device-orientation-permission-ui",
        "enabled: false"
    );
  
      /* ========================================
       ARJS
    ======================================== */

    arScene.setAttribute(
        "arjs",
        `
        sourceType: webcam;
        trackingMethod: best;
        debugUIEnabled: false;
        videoTexture: true;
        `
    );
/* ========================================
       HTML DA CENA
    ======================================== */

    arScene.innerHTML = `

        <a-assets>

            <a-asset-item
                id="modelo3d"
                src="vaso.glb">
            </a-asset-item>

        </a-assets>

        <!-- LUZ -->

        <a-entity
            light="type: ambient; intensity: 1.2">
        </a-entity>

        <a-entity
            light="type: directional; intensity: 1"
            position="1 1 1">
        </a-entity>
        <!-- MARKER -->

        <a-marker
            id="hiro-marker"
            preset="hiro">

            <a-entity
                gltf-model="#modelo3d"
                position="0 0 0"
                scale="2 2 2"
                rotation="-90 0 0">
            </a-entity>

        </a-marker>
<!-- CAMERA -->

        <a-entity camera></a-entity>
    `;
  arContainer.appendChild(
        arScene
    );

    /* ========================================
       EVENTOS AR
    ======================================== */
arScene.addEventListener(
        "renderstart",
        () => {

            console.log(
                "[AR] Render iniciado"
            );

            loadingScreen.classList.add(
                "hidden"
            );
        }
    );
  arScene.addEventListener(
        "camera-error",
        (error) => {

            console.error(
                "[CAMERA ERROR]",
                error
            );

            alert(
                "Erro ao acessar câmera."
            );

            stopAR();
        }
    );
   arScene.addEventListener(
        "loaded",
        () => {

            const marker =
                document.getElementById(
                    "hiro-marker"
                );

            if (!marker) {
                console.error(
                    "Marker não encontrado"
                );

                return;
            }
          marker.addEventListener(
                "markerFound",
                () => {

                    console.log(
                        "[MARKER] Detectado"
                    );

                    trackingStatus.innerText =
                        "Marcador detectado.";
                }
            );
           marker.addEventListener(
                "markerLost",
                () => {

                    console.log(
                        "[MARKER] Perdido"
                    );

                    trackingStatus.innerText =
                        "Aguardando marcador Hiro...";
                }
            );
        }
    );
}

/* ========================================
   STOP AR
======================================== */

function stopAR() {

    console.log(
        "[AR] Encerrando"
    );
  /* FINALIZA STREAM DA CÂMERA */

    const video =
        document.querySelector("video");

    if (
        video &&
        video.srcObject
    ) {
        video.srcObject
            .getTracks()
            .forEach(track => track.stop());
    }
  
   /* REMOVE CENA */

    if (arScene) {

        arScene.remove();

        arScene = null;
    }
  arContainer.style.display =
        "none";

    trackingStatus.innerText =
        "Aguardando marcador Hiro...";
}
