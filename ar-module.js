/* ========================================
   WEB AR MODULE
======================================== */

let arScene = null;

/* ========================================
   ELEMENTOS
======================================== */

const openARBtn = document.getElementById("open-ar-btn");
const closeARBtn = document.getElementById("close-ar-btn");
const arContainer = document.getElementById("ar-container");
const trackingStatus = document.getElementById("tracking-status");

// Unificando as variáveis de loading para evitar conflito de escopo
const loadingScreen = document.getElementById("ar-loading");
const modelViewer = document.querySelector('#vaso-viewer');

/* ========================================
   EVENTOS NATIVOS DO MODEL-VIEWER (CORREÇÃO DO DELAY)
======================================== */

// Executa assim que o modelo 3D estático da página terminar de carregar totalmente
if (modelViewer) {
    modelViewer.addEventListener('load', () => {
        console.log("[MODEL-VIEWER] Modelo carregado com sucesso.");
        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
            loadingScreen.style.display = "none";
        }
    });

    // Caso ocorra algum erro no download do arquivo GLB, limpa o loading para não travar o site
    modelViewer.addEventListener('error', (error) => {
        console.error("[MODEL-VIEWER] Erro ao carregar o modelo 3D:", error);
        if (loadingScreen) {
            loadingScreen.style.display = "none";
        }
    });
}

/* ========================================
   EVENTOS DE INTERAÇÃO
======================================== */
if (openARBtn) {
    openARBtn.addEventListener("click", async () => {
        try {
            /* HTTPS */
            if (location.protocol !== "https:" && location.hostname !== "localhost") {
                alert("A experiência AR requer HTTPS.");
                return;
            }

            /* SUPORTE CÂMERA */
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Seu navegador não suporta câmera.");
                return;
            }

            startAR();
        } catch (error) {
            console.error(error);
            alert("Erro ao iniciar AR.");
        }
    });
}

if (closeARBtn) {
    closeARBtn.addEventListener("click", stopAR);
}

/* ========================================
   START AR (CÂMERA E MARCADOR)
======================================== */

function startAR() {
    if (arScene) return;

    console.log("[AR] Inicializando câmera e cena...");

    arContainer.style.display = "block";

    // Mostra o loading novamente se a câmera demorar para abrir
    if (loadingScreen) {
        loadingScreen.classList.remove("hidden");
        loadingScreen.style.display = "flex";
    }

    arScene = document.createElement("a-scene");

    /* ========================================
       AFRAME
    ======================================== */
    arScene.setAttribute("embedded", "true");
    arScene.setAttribute("renderer", `
        antialias: true;
        alpha: true;
        precision: mediump;
        logarithmicDepthBuffer: true;
    `);
    arScene.setAttribute("vr-mode-ui", "enabled: false");
    arScene.setAttribute("device-orientation-permission-ui", "enabled: false");
  
    /* ========================================
       ARJS
    ======================================== */
    arScene.setAttribute("arjs", `
        sourceType: webcam;
        trackingMethod: best;
        debugUIEnabled: false;
        videoTexture: true;
    `);

    /* ========================================
       HTML DA CENA
    ======================================== */
    arScene.innerHTML = `
        <a-assets>
            <a-asset-item id="modelo3d" src="vaso.glb"></a-asset-item>
        </a-assets>

        <!-- LUZ -->
        
        
        
        <!-- MARKER -->
        <a-marker id="hiro-marker" preset="hiro">
            
            
        </a-marker>

        <!-- CAMERA -->
        
    `;
    
    arContainer.appendChild(arScene);

    /* ========================================
       EVENTOS AR
    ======================================== */
    arScene.addEventListener("renderstart", () => {
        console.log("[AR] Render da webcam iniciado.");
        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
            loadingScreen.style.display = "none";
        }
    });

    arScene.addEventListener("camera-error", (error) => {
        console.error("[CAMERA ERROR]", error);
        alert("Erro ao acessar câmera.");
        stopAR();
    });

    arScene.addEventListener("loaded", () => {
        const marker = document.getElementById("hiro-marker");

        if (!marker) {
            console.error("Marker não encontrado");
            return;
        }

        marker.addEventListener("markerFound", () => {
            console.log("[MARKER] Detectado");
            trackingStatus.innerText = "Marcador detectado.";
        });

        marker.addEventListener("markerLost", () => {
            console.log("[MARKER] Perdido");
            trackingStatus.innerText = "Aguardando marcador Hiro...";
        });
    });
}

/* ========================================
   STOP AR
======================================== */

function stopAR() {
    console.log("[AR] Encerrando");

    /* FINALIZA STREAM DA CÂMERA */
    const video = document.querySelector("video");
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
  
    /* REMOVE CENA */
    if (arScene) {
        arScene.remove();
        arScene = null;
    }
    
    arContainer.style.display = "none";
    trackingStatus.innerText = "Aguardando marcador Hiro...";
}
