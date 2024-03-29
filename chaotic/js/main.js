const $botonReiniciar = document.querySelector("#boton-reiniciar");
const $botonAspectoJugador = document.querySelector("#boton-elegir-aspecto");

const $seccionElegirAspecto = document.querySelector("#seleccion-aspecto");
const $tarjetas = document.querySelector("#tarjetas");
const $seccionCombate = document.querySelector("#seleccion-ataque");
const $divBotonAtaques = document.querySelector("#seccion-boton-ataque");
const $pMensajesResultado = document.querySelector("#resultado-combate");
const $pAspectoJugador = document.querySelector("#aspecto-jugador");
const $pAspectoEnemigo = document.querySelector("#aspecto-enemigo");
const $pVictoriasJugador = document.querySelector("#victorias-jugador");
const $pVictoriasEnemigo = document.querySelector("#victorias-enemigo");
const $divMensajesJugador = document.querySelector("#ataques-jugador");
const $divMensajesEnemigo = document.querySelector("#ataques-enemigo");

const $seccionVerMapa = document.querySelector("#ver-mapa");
const $mapa = document.querySelector("#mapa");

let listaDeAspectos;
let botonAtaques;

let aspectos = [];
let opcionDeAspectosTemplate;
let botonAtaqueTemplate;

let jugadorId = null;
let ataquesJugador = [];
let ataqueJugadorTurno;
let aspectoJugador;
let victoriasJugador = 0;
let victoriasJugadorRonda = 0;

let ataquesEnemigo = [];
let ataqueEnemigoTurno;
let secuenciaAtaquesEnemigo = [];
let aspectoEnemigo;
let victoriasEnemigo = 0;
let victoriasEnemigoRonda = 0;

let intervalo;
let lienzo = $mapa.getContext("2d");
let mapaBackground = new Image();
mapaBackground.src = "./assets/background-specialForest.png";

let alturaDeseada;
let anchoDelMapa = window.innerWidth - 32;
const alturaMapaMaxima = 480
if (anchoDelMapa > alturaMapaMaxima) {
    anchoDelMapa = alturaMapaMaxima - 32;
}
alturaDeseada = anchoDelMapa * 3 / 4;
$mapa.width = anchoDelMapa;
$mapa.height = alturaDeseada;

class Aspecto {
    constructor (nombre, foto, vidas, fotoMapa, id = null) {
        this.id = id;
        this.nombre = nombre;
        this.foto = foto;
        this.vidas = vidas;
        this.ataques = [];
        this.ancho = 64;
        this.alto = 64;
        this.x = getRandomNumber(0, $mapa.width - this.ancho);
        this.y = getRandomNumber(0, $mapa.height - this.alto);
        this.mapaFoto = new Image();
        this.mapaFoto.src = fotoMapa;
        this.velocidadX = 0;
        this.velocidadY = 0;
    }

    pintarAspecto() {
    lienzo.drawImage(
        this.mapaFoto,
        this.x,
        this.y,
        this.ancho,
        this.alto
    )};
}

const fulgus = new Aspecto (`Fulgus`, `./assets/sprites-splash-fulgus.png`, 5, `./assets/sprites-mapa-fulgus.png`);
const goldeon = new Aspecto (`Goldeon`, `./assets/sprites-splash-goldeon.png`, 5, `./assets/sprites-mapa-goldeon.png`);
const plantus = new Aspecto (`Plantus`, `./assets/sprites-splash-plantus.png`, 5, `./assets/sprites-mapa-plantus.png`);

const ATAQUES_FULGUS = [
    { nombre: `FUEGO`, id: `boton-fuego` },
    { nombre: `FUEGO`, id: `boton-fuego` },
    { nombre: `FUEGO`, id: `boton-fuego` },
    { nombre: `AGUA`, id: `boton-agua` },
    { nombre: `TIERRA`, id: `boton-tierra` },
];
fulgus.ataques.push(...ATAQUES_FULGUS);

const ATAQUES_GOLDEON = [
    { nombre: `AGUA`, id: `boton-agua` },
    { nombre: `AGUA`, id: `boton-agua` },
    { nombre: `AGUA`, id: `boton-agua` },
    { nombre: `FUEGO`, id: `boton-fuego` },
    { nombre: `TIERRA`, id: `boton-tierra` },
];
goldeon.ataques.push(...ATAQUES_GOLDEON);

const ATAQUES_PLANTUS = [
    { nombre: `TIERRA`, id: `boton-tierra` },
    { nombre: `TIERRA`, id: `boton-tierra` },
    { nombre: `TIERRA`, id: `boton-tierra` },
    { nombre: `FUEGO`, id: `boton-fuego` },
    { nombre: `AGUA`, id: `boton-agua` },
];
plantus.ataques.push(...ATAQUES_PLANTUS);

aspectos.push(fulgus, goldeon, plantus);

function iniciarJuego() {
    $seccionVerMapa.style.display = "none";
    $seccionCombate.style.display = "none";
    $botonReiniciar.style.display = "none";

    aspectos.forEach((aspecto) => {
        opcionDeAspectosTemplate = `
            <input type="radio" name="aspecto" id=${aspecto.nombre} />
            <label class="aspecto-tarjeta" for=${aspecto.nombre}>
                <p>${aspecto.nombre}</p>
                <img src=${aspecto.foto} alt=${aspecto.nombre}>
            </label>
        `;
        $tarjetas.innerHTML += opcionDeAspectosTemplate;  
    })
    listaDeAspectos = document.querySelectorAll("input[name=aspecto]");

    $botonAspectoJugador.addEventListener("click", seleccionarAspectoJugador);
    $botonReiniciar.addEventListener("click", reiniciarJuego);

    unirseAlJuego();
}

function unirseAlJuego() {
    fetch("http://localhost:8080/unirse")
        .then(function(res) {
            if (res.ok) {
                res.text()
                    .then(function(respuesta) {
                        console.log(respuesta);
                        jugadorId = respuesta;
                });
            }
        });
}

function seleccionarAspectoJugador() {
    for (let i = 0; i < listaDeAspectos.length; i++) {
        if (listaDeAspectos[i].checked) {
            aspectoJugador = aspectos[i];
            $seccionElegirAspecto.style.display = "none";

            seleccionarAspecto(aspectoJugador.nombre)
            $seccionVerMapa.style.display = "flex";
            return iniciarMapa();
        }
    }
    return alert(`Elige tu Mascota`);
}
function seleccionarAspectoEnemigo () {
    ataquesEnemigo = ataquesEnemigo.concat(aspectoEnemigo.ataques);
    $pAspectoEnemigo.innerHTML = aspectoEnemigo.nombre;
}

function seleccionarAspecto(aspectoJugador) {
    fetch(`http://localhost:8080/chaotic/${jugadorId}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            aspecto: aspectoJugador
        })
    });
}

function ataqueAleatorioEnemigo() {
    let ataqueAleatorio = getRandomNumber(0, ataquesEnemigo.length - 1);
    ataqueEnemigoTurno = ataquesEnemigo[ataqueAleatorio].nombre;
    ataquesEnemigo.splice(ataqueAleatorio, 1);

    secuenciaAtaquesEnemigo.push(ataqueEnemigoTurno);
    console.log(secuenciaAtaquesEnemigo)
    iniciarCombate();
}
function secuenciaAtaquesJugador(ataque) {
    if (aspectoJugador.nombre !== ``) {
        ataqueJugadorTurno = ataque.target.textContent;
        ataquesJugador.push(ataqueJugadorTurno);

        console.log(ataquesJugador)
        ataqueAleatorioEnemigo();
    } else {
        alert(`Elige tu Mascota`);
        location.reload();
    }
}
function iniciarCombate() {
    if (ataquesJugador.length === aspectoJugador.ataques.length && secuenciaAtaquesEnemigo.length === aspectoEnemigo.ataques.length) {
        combate(ataquesJugador, secuenciaAtaquesEnemigo);
    }
}

function guardarAtaquesTurno(jugador, enemigo) {
    ataqueJugadorTurno = ataquesJugador[jugador];
    ataqueEnemigoTurno = secuenciaAtaquesEnemigo[enemigo];
    crearMensaje('', "mensaje-ataque", 1);
    crearMensaje('', "mensaje-ataque", 2);
}
function comentarioCombateAleatorio() {
    let mensajeAleatorio;
    let resultadoCombateRonda = [
        `El enemigo se tambalea`,
        `Tu ${aspectoJugador.nombre} grita de emoción`,
        `Atacas con facilidad`,
        `El enemigo realiza ataques certeros`,
        `El ${aspectoEnemigo.nombre} enemigo despliega un gran poder`,
        `Empiezas a sentir el peso de tu cuerpo`,
        `Hubo un bloqueo perfecto por ambas partes`,
        `Tu ${aspectoJugador.nombre} lucha a la par de ${aspectoEnemigo.nombre} enemigo`,
    ];

    if (victoriasJugadorRonda > victoriasEnemigoRonda) {
        mensajeAleatorio  = getRandomNumber(0, 2);
    } else if (victoriasJugadorRonda < victoriasEnemigoRonda) {
        mensajeAleatorio  = getRandomNumber(3, 5);
    } else {
        mensajeAleatorio  = getRandomNumber(6, 7);
    }

    crearMensaje(resultadoCombateRonda[mensajeAleatorio], '', 3);
    victoriasJugadorRonda = 0;
    victoriasEnemigoRonda = 0;
}  
function combate(jugador, enemigo) {
    for (let i = 0; i < jugador.length; i++) {
        if (jugador[i] === enemigo[i]) {
            guardarAtaquesTurno(i, i);
        } else if (jugador[i] === "FUEGO" && enemigo[i] === "TIERRA") {
            guardarAtaquesTurno(i, i);
            victoriasJugador++;
            victoriasJugadorRonda++;
            $pVictoriasJugador.innerHTML = victoriasJugador;
        } else if (jugador[i] === "AGUA" && enemigo[i] === "FUEGO") {
            guardarAtaquesTurno(i, i);
            victoriasJugador++;
            victoriasJugadorRonda++;
            $pVictoriasJugador.innerHTML = victoriasJugador;
        } else if (jugador[i] === "TIERRA" && enemigo[i] === "AGUA") {
            guardarAtaquesTurno(i, i);
            victoriasJugador++;
            victoriasJugadorRonda++;
            $pVictoriasJugador.innerHTML = victoriasJugador;
        } else {
            guardarAtaquesTurno(i, i);
            victoriasEnemigo++;
            victoriasEnemigoRonda++;
            $pVictoriasEnemigo.innerHTML = victoriasEnemigo;
        }
    }

    ataquesJugador = [];
    secuenciaAtaquesEnemigo = [];
    ataquesEnemigo = ataquesEnemigo.concat(aspectoEnemigo.ataques);
    comentarioCombateAleatorio();
    revisarVictorias();
}
function revisarVictorias() {
    if (victoriasJugador === victoriasEnemigo && victoriasJugador + victoriasEnemigo >= 10) {
        let mensajeVictoria = `Ambos sienten como sus cuerpos se destrozan`;
        let claseNombre = `resultado-ganador`;
        crearMensaje(mensajeVictoria, claseNombre, 3);
        botonAtaques.forEach(function(boton) {
            boton.disabled = false;
            boton.style.background = ``;
        });
    } else if (victoriasJugador >= 5 && victoriasJugador > victoriasEnemigo) {
        let mensajeVictoria = `El ${aspectoEnemigo.nombre} enemigo ya no reacciona, ni su portador`;
        let claseNombre = `resultado-ganador`;
        crearMensajeVictoria(mensajeVictoria, claseNombre);
    } else if (victoriasEnemigo >= 5 && victoriasEnemigo > victoriasJugador) {
        let mensajeDerrota = `Tu cuerpo ya no puede soportar a ${aspectoJugador.nombre}`;
        let claseNombre = `resultado-ganador`;
        crearMensajeVictoria(mensajeDerrota, claseNombre);
    } else {
        botonAtaques.forEach(function(boton) {
            boton.disabled = false;
            boton.style.background = ``;
        });
    }
}

function crearMensaje(texto, clase, numBloque, destino) {
    //1=Jugador 2=Enemigo 3=Resultado
    let $parrafo = document.createElement("p");
    let mensajeAtaque = [
        `Tu ${aspectoJugador.nombre} utilizó ${ataqueJugadorTurno}`,
        `El ${aspectoEnemigo.nombre} enemigo utilizó ${ataqueEnemigoTurno}`
    ];

    if (numBloque === 1) {
        $parrafo.innerHTML = mensajeAtaque[numBloque - 1];
        $parrafo.className = clase;
        return $divMensajesJugador.insertAdjacentElement("afterbegin" ,$parrafo);
    } else if (numBloque === 2) {
        $parrafo.innerHTML = mensajeAtaque[numBloque - 1];
        $parrafo.className = clase;
        return $divMensajesEnemigo.insertAdjacentElement("afterbegin" ,$parrafo);
    } else if (numBloque === 3) {
        $pMensajesResultado.innerHTML = texto;
    } else {
        $parrafo.innerHTML = texto;
        $parrafo.className = `${clase}`;
        destino.appendChild($parrafo)
    }
}
function crearMensajeVictoria(texto, clase) {
    $botonReiniciar.style.display = "";
    $pMensajesResultado.className = `${clase}`;
    return $pMensajesResultado.innerHTML = texto;
}
function crearBotonesAtaque(aspectoJugador) {
    aspectoJugador.forEach((ataque) => {
        botonAtaqueTemplate = `
        <button class="boton-ataque ${ataque.id}" id="">${ataque.nombre}</button>
        `;
        $divBotonAtaques.innerHTML += botonAtaqueTemplate;    
    })
    botonAtaques = document.querySelectorAll(".boton-ataque");
    
    botonAtaques.forEach(function(boton) {
        boton.addEventListener("click", (e) => {
            boton.disabled = true;
            boton.style.background = `#3C2A21`;
            secuenciaAtaquesJugador(e);
        });
    });
}

function reiniciarJuego() {
    location.reload();
}

function getRandomNumber(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function pintarCanvas() {
    aspectoJugador.x = aspectoJugador.x + aspectoJugador.velocidadX;
    aspectoJugador.y = aspectoJugador.y + aspectoJugador.velocidadY;
    lienzo.clearRect(0, 0, $mapa.clientWidth, $mapa.clientHeight);
    lienzo.drawImage(
        mapaBackground,
        0,
        0,
        $mapa.width,
        $mapa.height
    )
    aspectoJugador.pintarAspecto();
    enviarPosicion(aspectoJugador.x, aspectoJugador.y);
    if (aspectoJugador.velocidadX !== 0 || aspectoJugador.velocidadY !== 0) {
        comprobarColision(aspectoEnemigo);
    }
}

function enviarPosicion(x, y) {
    fetch(`http://localhost:8080/chaotic/${jugadorId}/posicion`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            x,
            y
        })
    })
        .then(function (res) {
            if(res.ok) {
                res.json()
                    .then(function ({ enemigos }) {
                        console.log(enemigos);
                        enemigos.forEach(function (enemigo) {
                            const aspectoNombre = enemigo.aspecto.nombre || "";
                            if (aspectoNombre === `Fulgus`) {
                                aspectoEnemigo = new Aspecto (`Fulgus`, `./assets/sprites-splash-fulgus.png`, 5, `./assets/sprites-mapa-fulgus.png`);
                                aspectoEnemigo.ataques.push(...ATAQUES_FULGUS);                                
                            } else if (aspectoNombre === `Goldeon`) {
                                aspectoEnemigo = new Aspecto (`Goldeon`, `./assets/sprites-splash-goldeon.png`, 5, `./assets/sprites-mapa-goldeon.png`);
                                aspectoEnemigo.ataques.push(...ATAQUES_GOLDEON);
                            } else if (aspectoNombre === `Plantus`) {
                                aspectoEnemigo = new Aspecto (`Plantus`, `./assets/sprites-splash-plantus.png`, 5, `./assets/sprites-mapa-plantus.png`);
                                aspectoEnemigo.ataques.push(...ATAQUES_PLANTUS);
                            }
                            aspectoEnemigo.x = enemigo.x;
                            aspectoEnemigo.y = enemigo.y;
                            aspectoEnemigo.pintarAspecto();
                        });
                    });
            }
        });
}

function comprobarColision(enemigo) {
    const arribaEnemigo = enemigo.y;
    const abajoEnemigo = enemigo.y + enemigo.alto;
    const izquierdaEnemigo = enemigo.x;
    const derechaEnemigo = enemigo.x + enemigo.ancho;
    
    const arribaAspecto = aspectoJugador.y;
    const abajoAspecto = aspectoJugador.y + aspectoJugador.alto;
    const izquierdaAspecto = aspectoJugador.x;
    const derechaAspecto = aspectoJugador.x + aspectoJugador.ancho;

    if (
        abajoAspecto < arribaEnemigo ||
        arribaAspecto > abajoEnemigo ||
        derechaAspecto < izquierdaEnemigo ||
        izquierdaAspecto > derechaEnemigo
    ) {
        return;
    }
    console.log("Chocaste");
    detenerMovimiento();
    clearInterval(intervalo);

    $seccionVerMapa.style.display = "none";
    $seccionCombate.style.display = "";
    $pAspectoJugador.innerHTML = aspectoJugador.nombre;

    seleccionarAspectoEnemigo();
    crearBotonesAtaque(aspectoJugador.ataques);
}

function moverRight() {
    aspectoJugador.velocidadX = 5;
}
function moverDown() {
    aspectoJugador.velocidadY = 5;
}
function moverUp() {
    aspectoJugador.velocidadY = -5;
}
function moverLeft() {
    aspectoJugador.velocidadX = -5;
}
function detenerMovimiento() {
    aspectoJugador.velocidadX = 0;
    aspectoJugador.velocidadY = 0;
}

function tocasteUnaTecla(e) {
    switch (e.key) {
        case "w":
            moverUp();
            break;
        case "s":
            moverDown();
            break;
        case "a":
            moverLeft();
            break;
        case "d":
            moverRight();
            break;
        default:
            break;
    }
}

function iniciarMapa() {    
    intervalo = setInterval(pintarCanvas, 50);
    window.addEventListener("keydown", tocasteUnaTecla);
    window.addEventListener("keyup", detenerMovimiento);
}

window.addEventListener("load", iniciarJuego);
